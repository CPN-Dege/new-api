package model

import (
	"os"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestHalsamerIdentityMigrationPostgreSQL(t *testing.T) {
	dsn := strings.TrimSpace(os.Getenv("TEST_POSTGRES_DSN"))
	if dsn == "" || !strings.Contains(dsn, "newapi_auth_test") {
		t.Skip("dedicated TEST_POSTGRES_DSN for newapi_auth_test is not configured")
	}
	db, err := gorm.Open(postgres.New(postgres.Config{DSN: dsn, PreferSimpleProtocol: true}), &gorm.Config{})
	require.NoError(t, err)

	oldDB := DB
	oldDatabaseType := common.MainDatabaseType()
	DB = db
	common.SetMainDatabaseType(common.DatabaseTypePostgreSQL)
	t.Cleanup(func() {
		DB = oldDB
		common.SetMainDatabaseType(oldDatabaseType)
	})

	require.NoError(t, db.Exec("DROP TABLE IF EXISTS auth_flows, users CASCADE").Error)
	t.Cleanup(func() { _ = db.Exec("DROP TABLE IF EXISTS auth_flows, users CASCADE").Error })
	require.NoError(t, db.Exec("CREATE TABLE users (id BIGSERIAL PRIMARY KEY, username VARCHAR(20) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, email VARCHAR(50), status INTEGER DEFAULT 1, auth_version BIGINT NOT NULL DEFAULT 1)").Error)
	require.NoError(t, db.Exec("INSERT INTO users (username,password,email,status) VALUES (?,?,?,?)", "legacy", "hash", "legacy@example.com", common.UserStatusEnabled).Error)

	for range 2 {
		require.NoError(t, db.AutoMigrate(&User{}, &AuthFlow{}))
	}
	for _, column := range []string{"mobile", "email_verified"} {
		assert.True(t, db.Migrator().HasColumn(&User{}, column))
	}
	var legacy struct {
		Username      string
		Mobile        *string
		EmailVerified bool
		Status        int
	}
	require.NoError(t, db.Table("users").Where("username = ?", "legacy").First(&legacy).Error)
	assert.Nil(t, legacy.Mobile)
	assert.False(t, legacy.EmailVerified)
	assert.Equal(t, common.UserStatusEnabled, legacy.Status)

	first := User{Username: "first", Password: "hash", Email: "first@example.com", Mobile: mobilePtr("+628123450099"), Status: common.UserStatusDisabled, EmailVerified: false}
	require.NoError(t, db.Create(&first).Error)
	duplicate := User{Username: "second", Password: "hash", Email: "second@example.com", Mobile: mobilePtr("+628123450099"), Status: common.UserStatusDisabled}
	assert.Error(t, db.Create(&duplicate).Error)

	var indexCount int64
	require.NoError(t, db.Raw("SELECT COUNT(*) FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'users' AND indexdef ILIKE ?", "%UNIQUE%mobile%").Scan(&indexCount).Error)
	assert.Equal(t, int64(1), indexCount)
}
