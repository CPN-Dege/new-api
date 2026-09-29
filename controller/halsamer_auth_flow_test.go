package controller

import (
	"bufio"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/system_setting"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/go-redis/redis/v8"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func controllerMobilePtr(value string) *string { return &value }

func setupHalsamerAuthTest(t *testing.T) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	require.NoError(t, db.AutoMigrate(&model.User{}, &model.AuthFlow{}, &model.UserSession{}, &model.Option{}, &model.Token{}))
	oldDB, oldLogDB := model.DB, model.LOG_DB
	oldRedisClient, oldRedisEnabled := common.RDB, common.RedisEnabled
	oldSecret := common.SessionSecret
	oldRegister, oldPassword, oldEmail := common.RegisterEnabled, common.PasswordRegisterEnabled, common.EmailVerificationEnabled
	oldAddress := system_setting.ServerAddress
	model.DB, model.LOG_DB = db, db
	common.RDB = redis.NewClient(&redis.Options{Addr: "127.0.0.1:0"})
	common.RedisEnabled = false
	common.SessionSecret = "TEST_ONLY_halsamer_auth_flow_secret"
	system_setting.ServerAddress = "https://api.halsamer.io"
	common.RegisterEnabled, common.PasswordRegisterEnabled, common.EmailVerificationEnabled = true, true, true
	t.Cleanup(func() {
		model.DB, model.LOG_DB = oldDB, oldLogDB
		_ = common.RDB.Close()
		common.RDB, common.RedisEnabled = oldRedisClient, oldRedisEnabled
		common.SessionSecret = oldSecret
		system_setting.ServerAddress = oldAddress
		common.RegisterEnabled, common.PasswordRegisterEnabled, common.EmailVerificationEnabled = oldRegister, oldPassword, oldEmail
	})
}

func postHalsamerAuth(t *testing.T, handler gin.HandlerFunc, path, payload string) *httptest.ResponseRecorder {
	t.Helper()
	r := gin.New()
	r.POST(path, handler)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodPost, path, strings.NewReader(payload)))
	return w
}

func TestHalsamerRegistrationRequiresUniqueE164MobileAndCreatesPendingAccount(t *testing.T) {
	setupHalsamerAuthTest(t)
	oldGenerateDefaultToken := constant.GenerateDefaultToken
	constant.GenerateDefaultToken = true
	t.Cleanup(func() { constant.GenerateDefaultToken = oldGenerateDefaultToken })
	common.SMTPServer, common.SMTPFrom, common.SMTPAccount, common.SMTPToken = "127.0.0.1", "no-reply@example.test", "", ""
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)
	var deliveredMessages []string
	var deliveredMessagesMu sync.Mutex
	common.SMTPPort = listener.Addr().(*net.TCPAddr).Port
	common.SMTPSSLEnabled, common.SMTPStartTLSEnabled = false, false
	done := make(chan struct{})
	go func() {
		defer close(done)
		connection, acceptErr := listener.Accept()
		if acceptErr != nil {
			return
		}
		defer connection.Close()
		reader := bufio.NewReader(connection)
		fmt.Fprint(connection, "220 example.test ESMTP\r\n")
		for {
			line, readErr := reader.ReadString('\n')
			if readErr != nil {
				return
			}
			switch {
			case strings.HasPrefix(line, "EHLO"):
				fmt.Fprint(connection, "250-example.test\r\n250 OK\r\n")
			case strings.HasPrefix(line, "MAIL FROM"), strings.HasPrefix(line, "RCPT TO"):
				fmt.Fprint(connection, "250 OK\r\n")
			case strings.HasPrefix(line, "DATA"):
				fmt.Fprint(connection, "354 End data\r\n")
				var message strings.Builder
				for {
					dataLine, _ := reader.ReadString('\n')
					if dataLine == ".\r\n" {
						break
					}
					message.WriteString(dataLine)
				}
				deliveredMessagesMu.Lock()
				deliveredMessages = append(deliveredMessages, message.String())
				deliveredMessagesMu.Unlock()
				fmt.Fprint(connection, "250 queued\r\n")
			case strings.HasPrefix(line, "QUIT"):
				fmt.Fprint(connection, "221 bye\r\n")
				return
			default:
				fmt.Fprint(connection, "250 OK\r\n")
			}
		}
	}()
	t.Cleanup(func() { _ = listener.Close(); <-done })

	missing := postHalsamerAuth(t, Register, "/api/user/register", `{"username":"alice","email":"alice@example.com","password":"password123","verification_code":"registration-token"}`)
	assert.Contains(t, missing.Body.String(), `"success":false`)

	invalid := postHalsamerAuth(t, Register, "/api/user/register", `{"username":"alice","email":"alice@example.com","mobile":"0812345","password":"password123","verification_code":"registration-token"}`)
	assert.Contains(t, invalid.Body.String(), `"success":false`)

	valid := postHalsamerAuth(t, Register, "/api/user/register", `{"username":"alice","email":"alice@example.com","mobile":"+628123456789","password":"password123","verification_code":"registration-token"}`)
	assert.Contains(t, valid.Body.String(), `"success":true`)
	var alice model.User
	require.NoError(t, model.DB.Where("username = ?", "alice").First(&alice).Error)
	assert.Equal(t, "+628123456789", *alice.Mobile)
	assert.False(t, alice.EmailVerified)
	assert.Equal(t, common.UserStatusDisabled, alice.Status)
	var defaultTokenCount int64
	require.NoError(t, model.DB.Model(&model.Token{}).Where("user_id = ?", alice.Id).Count(&defaultTokenCount).Error)
	assert.Zero(t, defaultTokenCount)
	deliveredMessagesMu.Lock()
	require.Len(t, deliveredMessages, 1)
	assert.Contains(t, deliveredMessages[0], "Verify Email")
	assert.Contains(t, deliveredMessages[0], "/api/user/confirm-email?token=")
	assert.NotContains(t, deliveredMessages[0], "registration-token")
	deliveredMessagesMu.Unlock()

	common.RegisterVerificationCodeWithKey("bob@example.com", "registration-token-2", common.EmailVerificationPurpose)
	duplicate := postHalsamerAuth(t, Register, "/api/user/register", `{"username":"bob","email":"bob@example.com","mobile":"+628123456789","password":"password123","verification_code":"registration-token-2"}`)
	assert.Contains(t, duplicate.Body.String(), `"success":false`)
}

func TestHalsamerEmailConfirmationIsSingleUseAndActivatesAccount(t *testing.T) {
	setupHalsamerAuthTest(t)
	user := model.User{Username: "pending", Email: "pending@example.com", Mobile: controllerMobilePtr("+628111111111"), Password: "hash", Status: common.UserStatusDisabled, EmailVerified: false, AuthVersion: 1}
	require.NoError(t, model.DB.Create(&user).Error)
	token, _, err := model.CreateAuthFlow(model.AuthFlowCreate{Purpose: model.AuthFlowPurposeEmailConfirmation, UserId: user.Id, Payload: `{"email":"pending@example.com"}`, ExpiresAt: time.Now().Add(time.Minute)})
	require.NoError(t, err)
	first := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(first)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/user/confirm-email?token="+token, nil)
	ConfirmRegistrationEmail(ctx)
	assert.Equal(t, http.StatusSeeOther, first.Code)
	assert.Equal(t, "https://api.halsamer.io/sign-in?verified=1", first.Header().Get("Location"))
	second := httptest.NewRecorder()
	ctx2, _ := gin.CreateTestContext(second)
	ctx2.Request = httptest.NewRequest(http.MethodGet, "/api/user/confirm-email?token="+token, nil)
	ConfirmRegistrationEmail(ctx2)
	assert.NotEqual(t, http.StatusSeeOther, second.Code)
	var activated model.User
	require.NoError(t, model.DB.First(&activated, user.Id).Error)
	assert.True(t, activated.EmailVerified)
	assert.Equal(t, common.UserStatusEnabled, activated.Status)
}

func TestHalsamerPasswordResetAcceptsChosenPasswordAndRevokesOldOne(t *testing.T) {
	setupHalsamerAuthTest(t)
	hash, err := common.HashAccountPassword("old-password")
	require.NoError(t, err)
	user := model.User{Username: "reset-user", Email: "reset@example.com", Mobile: controllerMobilePtr("+628122222222"), Password: hash, Status: common.UserStatusEnabled, EmailVerified: true, AuthVersion: 1}
	require.NoError(t, model.DB.Create(&user).Error)
	token, _, err := model.CreateAuthFlow(model.AuthFlowCreate{Purpose: model.AuthFlowPurposePasswordReset, UserId: user.Id, Payload: `{"email":"reset@example.com"}`, ExpiresAt: time.Now().Add(time.Minute)})
	require.NoError(t, err)
	response := postHalsamerAuth(t, ResetPassword, "/api/user/reset", `{"email":"reset@example.com","token":"`+token+`","password":"new-password-123","confirm_password":"new-password-123"}`)
	assert.Contains(t, response.Body.String(), `"success":true`)
	assert.NotContains(t, response.Body.String(), "new-password-123")
	var reloaded model.User
	require.NoError(t, model.DB.First(&reloaded, user.Id).Error)
	assert.True(t, common.ValidatePasswordAndHash("new-password-123", reloaded.Password))
	assert.False(t, common.ValidatePasswordAndHash("old-password", reloaded.Password))
	replay := postHalsamerAuth(t, ResetPassword, "/api/user/reset", `{"email":"reset@example.com","token":"`+token+`","password":"other-password-123","confirm_password":"other-password-123"}`)
	assert.Contains(t, replay.Body.String(), `"success":false`)
}
