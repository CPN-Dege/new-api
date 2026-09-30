package relay

import (
	"io"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/tidwall/gjson"
)

func TestPassthroughBodyAppliesMappedModelOnly(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(nil)
	storage, err := common.CreateBodyStorage([]byte(`{"model":"gpt-astra-6","messages":[{"role":"user","content":"keep me"}],"vendor_option":{"queue":"upstream"}}`))
	require.NoError(t, err)
	defer storage.Close()
	c.Set(common.KeyBodyStorage, storage)

	body, cleanup, err := passthroughBodyWithModel(c, "gpt-6-astra")
	require.NoError(t, err)
	defer cleanup()
	raw, err := body.NewReader()
	require.NoError(t, err)
	defer raw.Close()
	payload, err := io.ReadAll(raw)
	require.NoError(t, err)

	assert.Equal(t, "gpt-6-astra", gjson.GetBytes(payload, "model").String())
	assert.Equal(t, "keep me", gjson.GetBytes(payload, "messages.0.content").String())
	assert.Equal(t, "upstream", gjson.GetBytes(payload, "vendor_option.queue").String())
}
