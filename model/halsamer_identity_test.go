package model

import (
	"errors"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func setupHalsamerIdentityDB(t *testing.T) {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	require.NoError(t, db.AutoMigrate(&User{}, &UserSession{}, &AuthFlow{}, &Token{}))
	old := DB
	DB = db
	t.Cleanup(func() { DB = old })
}

func mobilePtr(value string) *string { return &value }

func TestNormalizeE164Mobile(t *testing.T) {
	for _, tc := range []struct {
		input string
		want  string
		ok    bool
	}{
		{"+628123456789", "+628123456789", true},
		{" +14155552671 ", "+14155552671", true},
		{"08123456789", "", false},
		{"+0123456789", "", false},
		{"+62812 345", "", false},
		{"+1-415-555-2671", "", false},
		{"+1234567", "", false},
		{"+1234567890123456", "", false},
		{"", "", false},
	} {
		t.Run(tc.input, func(t *testing.T) {
			got, err := NormalizeE164Mobile(tc.input)
			assert.Equal(t, tc.want, got)
			assert.Equal(t, tc.ok, err == nil)
		})
	}
}

func TestPendingRegistrationAndConfirmationFlow(t *testing.T) {
	setupHalsamerIdentityDB(t)
	user := User{Username: "pending-flow", Email: "pending-flow@example.com", Mobile: mobilePtr("+628123450001"), Password: "password123", Role: common.RoleCommonUser, Status: common.UserStatusDisabled, EmailVerified: false}
	payload, err := common.Marshal(map[string]string{"email": user.Email})
	require.NoError(t, err)
	token, _, err := user.InsertPendingWithAuthFlow(0, AuthFlowCreate{Purpose: AuthFlowPurposeEmailConfirmation, Payload: string(payload), ExpiresAt: time.Now().Add(time.Minute)})
	require.NoError(t, err)
	assert.NotEmpty(t, token)
	var flow AuthFlow
	require.NoError(t, DB.Where("user_id = ? AND purpose = ?", user.Id, AuthFlowPurposeEmailConfirmation).First(&flow).Error)
	require.NoError(t, DeletePendingRegistration(user.Id))
	var count int64
	require.NoError(t, DB.Unscoped().Model(&User{}).Where("id = ?", user.Id).Count(&count).Error)
	assert.Zero(t, count)
	require.NoError(t, DB.Model(&AuthFlow{}).Where("user_id = ?", user.Id).Count(&count).Error)
	assert.Zero(t, count)
}

func TestPendingConfirmationRefusesToActivateAnExistingProvisionedAccount(t *testing.T) {
	setupHalsamerIdentityDB(t)
	oldGenerateDefaultToken := constant.GenerateDefaultToken
	constant.GenerateDefaultToken = true
	t.Cleanup(func() { constant.GenerateDefaultToken = oldGenerateDefaultToken })
	user := User{Username: "provisioned", Email: "provisioned@example.com", Mobile: mobilePtr("+628123450077"), Password: "password123", Role: common.RoleCommonUser, Status: common.UserStatusDisabled, EmailVerified: false}
	require.NoError(t, user.Insert(0))
	require.NoError(t, CreateDefaultTokenForUser(user))
	payload, err := common.Marshal(map[string]string{"email": user.Email})
	require.NoError(t, err)
	token, _, err := CreateAuthFlow(AuthFlowCreate{Purpose: AuthFlowPurposeEmailConfirmation, UserId: user.Id, Payload: string(payload), ExpiresAt: time.Now().Add(time.Minute)})
	require.NoError(t, err)
	_, err = ConfirmRegistrationEmailAndProvision(token)
	assert.ErrorIs(t, err, ErrAuthFlowInvalid)
	var stored User
	require.NoError(t, DB.First(&stored, user.Id).Error)
	assert.False(t, stored.EmailVerified)
	assert.Equal(t, common.UserStatusDisabled, stored.Status)
}

func TestPendingRegistrationIdentityIsUniqueAndActivatesOnce(t *testing.T) {
	setupHalsamerIdentityDB(t)
	first := User{Username: "alice", Email: "alice@example.com", Mobile: mobilePtr("+628123456789"), Password: "password123", Role: common.RoleCommonUser, Status: common.UserStatusDisabled, EmailVerified: false}
	require.NoError(t, first.Insert(0))

	for _, duplicate := range []User{
		{Username: "bob", Email: "other@example.com", Mobile: first.Mobile, Password: "password123"},
		{Username: "carol", Email: first.Email, Mobile: mobilePtr("+628222222222"), Password: "password123"},
	} {
		assert.Error(t, duplicate.Insert(0))
	}

	token, _, err := CreateAuthFlow(AuthFlowCreate{Purpose: AuthFlowPurposeEmailConfirmation, UserId: first.Id, Payload: `{"email":"alice@example.com"}`, ExpiresAt: time.Now().Add(time.Minute)})
	require.NoError(t, err)
	activated, err := ConfirmRegistrationEmail(token)
	require.NoError(t, err)
	assert.Equal(t, first.Id, activated.Id)
	assert.True(t, activated.EmailVerified)
	assert.Equal(t, common.UserStatusEnabled, activated.Status)
	_, err = ConfirmRegistrationEmail(token)
	assert.ErrorIs(t, err, ErrAuthFlowConsumed)
}

func TestPasswordResetTokenSetsChosenPasswordOnce(t *testing.T) {
	setupHalsamerIdentityDB(t)
	user := User{Username: "reset", Email: "reset@example.com", Mobile: mobilePtr("+628111111111"), Password: "old-password", Status: common.UserStatusEnabled, EmailVerified: true, AuthVersion: 1}
	require.NoError(t, user.Insert(0))
	token, _, err := CreateAuthFlow(AuthFlowCreate{Purpose: AuthFlowPurposePasswordReset, UserId: user.Id, Payload: `{"email":"reset@example.com"}`, ExpiresAt: time.Now().Add(time.Minute)})
	require.NoError(t, err)
	secondToken, _, err := CreateExclusiveAuthFlow(AuthFlowCreate{Purpose: AuthFlowPurposePasswordReset, UserId: user.Id, Payload: `{"email":"reset@example.com"}`, ExpiresAt: time.Now().Add(time.Minute)})
	require.NoError(t, err)
	require.NoError(t, ResetPasswordWithToken(user.Email, secondToken, "new-password-123"))
	var stored User
	require.NoError(t, DB.First(&stored, user.Id).Error)
	assert.True(t, common.ValidatePasswordAndHash("new-password-123", stored.Password))
	assert.False(t, common.ValidatePasswordAndHash("old-password", stored.Password))
	assert.ErrorIs(t, ResetPasswordWithToken(user.Email, token, "another-password"), ErrAuthFlowConsumed)
	assert.ErrorIs(t, ResetPasswordWithToken(user.Email, secondToken, "another-password"), ErrAuthFlowConsumed)
}

func TestExpiredConfirmationAndResetTokensDoNotChangeUser(t *testing.T) {
	setupHalsamerIdentityDB(t)
	user := User{Username: "expired", Email: "expired@example.com", Mobile: mobilePtr("+628333333333"), Password: "old-password", Status: common.UserStatusDisabled, EmailVerified: false, AuthVersion: 1}
	require.NoError(t, user.Insert(0))
	for _, purpose := range []string{AuthFlowPurposeEmailConfirmation, AuthFlowPurposePasswordReset} {
		token, _, err := CreateAuthFlow(AuthFlowCreate{Purpose: purpose, UserId: user.Id, Payload: `{"email":"expired@example.com"}`, ExpiresAt: time.Now().Add(-time.Second)})
		if err == nil {
			if purpose == AuthFlowPurposeEmailConfirmation {
				_, err = ConfirmRegistrationEmail(token)
			} else {
				err = ResetPasswordWithToken(user.Email, token, "new-password-123")
			}
		}
		assert.True(t, errors.Is(err, ErrAuthFlowExpired) || errors.Is(err, ErrAuthFlowInvalid))
	}
}
