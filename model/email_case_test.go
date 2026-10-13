package model

import (
	"os"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func setupEmailCaseTestState(t *testing.T) {
	t.Helper()
	engine := os.Getenv("EMAIL_CASE_TEST_ENGINE")
	if engine == "" {
		setupUserUpdateTestState(t)
		return
	}
	dsn := os.Getenv("EMAIL_CASE_TEST_DSN")
	require.Contains(t, dsn, "email_case_fixture")
	var dialector gorm.Dialector
	var kind common.DatabaseType
	switch engine {
	case "postgres":
		require.Contains(t, dsn, "host=/")
		dialector = postgres.Open(dsn)
		kind = common.DatabaseTypePostgreSQL
	case "mysql":
		require.True(t, strings.Contains(dsn, "@unix(/"))
		dialector = mysql.Open(dsn)
		kind = common.DatabaseTypeMySQL
	default:
		t.Fatal("unsupported dedicated fixture engine")
	}
	db, err := gorm.Open(dialector, &gorm.Config{})
	require.NoError(t, err)
	sqlDB, err := db.DB()
	require.NoError(t, err)
	sqlDB.SetMaxOpenConns(2)
	oldDB, oldLog, oldRedis, oldBatch := DB, LOG_DB, common.RedisEnabled, common.BatchUpdateEnabled
	DB, LOG_DB = db, db
	common.RedisEnabled, common.BatchUpdateEnabled = false, false
	common.SetDatabaseTypes(kind, kind)
	initCol()
	t.Cleanup(func() {
		DB, LOG_DB = oldDB, oldLog
		common.RedisEnabled, common.BatchUpdateEnabled = oldRedis, oldBatch
		common.SetDatabaseTypes(common.DatabaseTypeSQLite, common.DatabaseTypeSQLite)
		initCol()
		require.NoError(t, sqlDB.Close())
	})
	require.NoError(t, db.AutoMigrate(&User{}))
	require.NoError(t, db.Exec("DELETE FROM users").Error)
}

func TestEmailCaseUpdate(t *testing.T) {
	setupEmailCaseTestState(t)
	original := User{Username: "update-case", Email: "before@example.test", Status: common.UserStatusEnabled, EmailVerified: true, AuthVersion: 7}
	require.NoError(t, DB.Create(&original).Error)
	update := User{Id: original.Id, Email: "  AFTER@EXAMPLE.TEST  ", EmailVerified: true}
	require.NoError(t, update.Update(false))
	var stored User
	require.NoError(t, DB.First(&stored, original.Id).Error)
	require.Equal(t, "after@example.test", stored.Email)
	require.Equal(t, original.AuthVersion, stored.AuthVersion)
}

func TestEmailCaseLogin(t *testing.T) {
	setupEmailCaseTestState(t)
	hash, err := common.HashAccountPassword("TEST_ONLY_CaseSensitive123!")
	require.NoError(t, err)
	original := User{Username: "EmailCaseUser", Email: "Legacy@Example.TEST", Password: hash, Status: common.UserStatusEnabled, EmailVerified: true, Role: common.RoleCommonUser}
	require.NoError(t, DB.Create(&original).Error)
	login := User{Username: "  legacy@EXAMPLE.test  ", Password: "TEST_ONLY_CaseSensitive123!"}
	require.NoError(t, login.ValidateAndFill())
	require.Equal(t, original.Id, login.Id)
	for _, identifier := range []string{"legacy@example.test", "LEGACY@EXAMPLE.TEST", original.Username} {
		candidate := User{Username: identifier, Password: "TEST_ONLY_CaseSensitive123!"}
		require.NoError(t, candidate.ValidateAndFill())
		require.Equal(t, original.Id, candidate.Id)
	}
	wrongPassword := User{Username: "legacy@example.test", Password: "test_only_casesensitive123!"}
	require.ErrorIs(t, wrongPassword.ValidateAndFill(), ErrInvalidCredentials)
	require.NoError(t, DB.Model(&User{}).Where("id = ?", original.Id).Update("status", common.UserStatusDisabled).Error)
	pending := User{Username: "LEGACY@example.test", Password: "TEST_ONLY_CaseSensitive123!"}
	require.ErrorIs(t, pending.ValidateAndFill(), ErrInvalidCredentials)
	require.NoError(t, DB.Delete(&original).Error)
	deleted := User{Username: "legacy@example.test", Password: "TEST_ONLY_CaseSensitive123!"}
	require.ErrorIs(t, deleted.ValidateAndFill(), ErrInvalidCredentials)
}

func TestEmailCaseAmbiguousLoginRejected(t *testing.T) {
	setupEmailCaseTestState(t)
	hash, err := common.HashAccountPassword("TEST_ONLY_CaseSensitive123!")
	require.NoError(t, err)
	for _, fixture := range []User{
		{Username: "legacy-one", Email: "Legacy@Example.test", Password: hash, Status: common.UserStatusEnabled, AffCode: "case-one"},
		{Username: "legacy-two", Email: "legacy@example.TEST", Password: hash, Status: common.UserStatusEnabled, AffCode: "case-two"},
	} {
		require.NoError(t, DB.Create(&fixture).Error)
	}
	for _, identifier := range []string{"legacy@example.test", "LEGACY@EXAMPLE.TEST"} {
		login := User{Username: identifier, Password: "TEST_ONLY_CaseSensitive123!"}
		require.ErrorIs(t, login.ValidateAndFill(), ErrInvalidCredentials)
	}
	byUsername := User{Username: "legacy-one", Password: "TEST_ONLY_CaseSensitive123!"}
	require.NoError(t, byUsername.ValidateAndFill())
	conflict := User{Username: "person@example.test", Password: hash, Status: common.UserStatusEnabled, AffCode: "case-three"}
	require.NoError(t, DB.Create(&conflict).Error)
	owner := User{Username: "other-person", Email: "PERSON@example.test", Password: hash, Status: common.UserStatusEnabled, AffCode: "case-four"}
	require.NoError(t, DB.Create(&owner).Error)
	ambiguous := User{Username: "person@example.test", Password: "TEST_ONLY_CaseSensitive123!"}
	require.ErrorIs(t, ambiguous.ValidateAndFill(), ErrInvalidCredentials)
}

func TestEmailCaseStorageAndUniqueness(t *testing.T) {
	setupEmailCaseTestState(t)
	user := User{Username: "case-storage", Email: " FIRST@EXAMPLE.TEST ", Password: "TEST_ONLY_CaseSensitive123!", Status: common.UserStatusEnabled, EmailVerified: true}
	require.NoError(t, user.Insert(0))
	require.Equal(t, "first@example.test", user.Email)
	user.Email = " SECOND@EXAMPLE.TEST "
	require.NoError(t, user.Edit(false))
	require.Equal(t, "second@example.test", user.Email)
	other := User{Username: "other-storage", Email: "Taken@Example.test", Status: common.UserStatusEnabled, AffCode: "case-taken"}
	require.NoError(t, DB.Create(&other).Error)
	for _, address := range []string{" TAKEN@example.TEST ", "   "} {
		update := User{Id: user.Id, Email: address}
		require.Error(t, update.Update(false))
		var stored User
		require.NoError(t, DB.First(&stored, user.Id).Error)
		require.Equal(t, "second@example.test", stored.Email)
	}
}
