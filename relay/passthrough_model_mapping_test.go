package relay

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/constant"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/relaykit/dto"
	"github.com/QuantumNous/new-api/relaykit/types"
	"github.com/QuantumNous/new-api/setting/model_setting"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/tidwall/gjson"
)

func TestCrossProtocolPassthroughConvertsOpenAIImages(t *testing.T) {
	for _, protocol := range []string{"claude", "gemini"} {
		modes := []string{"channel", "global", "native"}
		if protocol == "claude" {
			modes = append(modes, "url", "missing", "null")
		}
		for _, mode := range modes {
			t.Run(fmt.Sprintf("%s/%s", protocol, mode), func(t *testing.T) {
				global := mode == "global"
				native := mode == "native"
				channelType := constant.ChannelTypeOpenAI
				if native {
					channelType = constant.ChannelTypeAnthropic
					if protocol == "gemini" {
						channelType = constant.ChannelTypeGemini
					}
				}
				oldGlobal := model_setting.GetGlobalSettings().PassThroughRequestEnabled
				model_setting.GetGlobalSettings().PassThroughRequestEnabled = global
				defer func() { model_setting.GetGlobalSettings().PassThroughRequestEnabled = oldGlobal }()
				captured := make(chan []byte, 1)
				server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					payload, err := io.ReadAll(r.Body)
					if !assert.NoError(t, err) {
						w.WriteHeader(500)
						return
					}
					if !native {
						assert.Equal(t, "/v1/chat/completions", r.URL.Path)
					}
					captured <- payload
					// Deliberately reject after capture; no billing/database fixture needed.
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusBadRequest)
					_, _ = w.Write([]byte(`{"error":{"message":"TEST_ONLY captured","type":"invalid_request_error"}}`))
				}))
				defer server.Close()
				path := "/v1/messages"
				raw := `{"model":"gpt-astra-6","max_tokens":64,"messages":[{"role":"user","content":[{"type":"text","text":"read image"},{"type":"image","source":{"type":"base64","media_type":"image/png","data":"VEVTVF9PTkxZ"}}]}]}`
				if protocol == "gemini" {
					path = "/v1beta/models/gpt-astra-6:generateContent"
					raw = `{"contents":[{"role":"user","parts":[{"text":"read image"},{"inlineData":{"mimeType":"image/png","data":"VEVTVF9PTkxZ"}}]}],"generationConfig":{"maxOutputTokens":64}}`
				}
				wantImage := "data:image/png;base64,VEVTVF9PTkxZ"
				sourceJSON := `"source":{"type":"base64","media_type":"image/png","data":"VEVTVF9PTkxZ"}`
				switch mode {
				case "url":
					wantImage = "https://example.invalid/TEST_ONLY%2Fshot.png?x=1&y=%2B#crop"
					raw = strings.Replace(raw, sourceJSON, `"source":{"type":"url","url":"`+wantImage+`"}`, 1)
				case "missing":
					raw = strings.Replace(raw, ","+sourceJSON, "", 1)
				case "null":
					raw = strings.Replace(raw, sourceJSON, `"source":null`, 1)
				}
				c, _ := gin.CreateTestContext(httptest.NewRecorder())
				c.Request = httptest.NewRequest(http.MethodPost, path, strings.NewReader(raw))
				c.Request.Header.Set("Content-Type", "application/json")
				common.SetContextKey(c, constant.ContextKeyOriginalModel, "gpt-astra-6")
				common.SetContextKey(c, constant.ContextKeyChannelType, channelType)
				common.SetContextKey(c, constant.ContextKeyChannelBaseUrl, server.URL)
				common.SetContextKey(c, constant.ContextKeyChannelKey, "TEST_ONLY")
				common.SetContextKey(c, constant.ContextKeyChannelSetting, dto.ChannelSettings{PassThroughBodyEnabled: !global, SystemPrompt: "MUST_NOT_INJECT"})
				common.SetContextKey(c, constant.ContextKeyChannelParamOverride, map[string]any{"model": "MUST_NOT_OVERRIDE"})
				c.Set("model_mapping", `{"gpt-astra-6":"gpt-6-astra"}`)
				storage, err := common.CreateBodyStorage([]byte(raw))
				require.NoError(t, err)
				defer storage.Close()
				c.Set(common.KeyBodyStorage, storage)
				if protocol == "claude" {
					var req dto.ClaudeRequest
					require.NoError(t, common.Unmarshal([]byte(raw), &req))
					var apiErr *types.NewAPIError
					require.NotPanics(t, func() { apiErr = ClaudeHelper(c, relaycommon.GenRelayInfoClaude(c, &req)) })
					require.NotNil(t, apiErr)
					if mode == "missing" || mode == "null" {
						assert.Equal(t, http.StatusBadRequest, apiErr.StatusCode)
						assert.True(t, types.IsSkipRetryError(apiErr))
						assert.Empty(t, captured, "invalid images must not dispatch upstream")
						assert.Equal(t, types.ErrorCodeConvertRequestFailed, apiErr.GetErrorCode())
						assert.EqualError(t, apiErr, "image source is required")
						original, err := storage.Bytes()
						require.NoError(t, err)
						assert.Equal(t, raw, string(original))
						return
					}
					assert.Contains(t, apiErr.Error(), "TEST_ONLY captured")
				} else {
					var req dto.GeminiChatRequest
					require.NoError(t, common.Unmarshal([]byte(raw), &req))
					apiErr := GeminiHelper(c, relaycommon.GenRelayInfoGemini(c, &req))
					require.NotNil(t, apiErr)
					assert.Contains(t, apiErr.Error(), "TEST_ONLY captured")
				}
				require.Len(t, captured, 1)
				payload := <-captured
				if native {
					assert.Equal(t, raw, string(payload))
				} else {
					assert.Equal(t, "gpt-6-astra", gjson.GetBytes(payload, "model").String())
					assert.Equal(t, wantImage, gjson.GetBytes(payload, "messages.0.content.1.image_url.url").String())
					assert.Equal(t, "read image", gjson.GetBytes(payload, "messages.0.content.0.text").String())
					assert.NotContains(t, string(payload), "MUST_NOT_")
					assert.Equal(t, int64(64), gjson.GetBytes(payload, "max_completion_tokens").Int())
				}
				original, err := storage.Bytes()
				require.NoError(t, err)
				assert.Equal(t, raw, string(original))
			})
		}
	}
}

func TestRequestValidationErrorIsBadRequestWithoutRetry(t *testing.T) {
	invalid := &types.RequestValidationError{Message: "invalid fixture input"}
	for _, tc := range []struct {
		name   string
		err    error
		status int
	}{
		{"direct", invalid, http.StatusBadRequest},
		{"wrapped", fmt.Errorf("wrapped: %w", invalid), http.StatusBadRequest},
		{"internal", errors.New("TEST_ONLY internal error"), http.StatusInternalServerError},
	} {
		t.Run(tc.name, func(t *testing.T) {
			c, _ := gin.CreateTestContext(httptest.NewRecorder())
			got := newConvertRequestFailedError(c, &relaycommon.RelayInfo{}, tc.err)
			require.NotNil(t, got)
			assert.Equal(t, tc.status, got.StatusCode)
			assert.Equal(t, types.ErrorCodeConvertRequestFailed, got.GetErrorCode())
			assert.True(t, types.IsSkipRetryError(got))
			assert.ErrorIs(t, got, tc.err)
		})
	}
}

func TestResponsesPassthroughMapsWireModelPreservingImageAndExtras(t *testing.T) {
	for _, global := range []bool{false, true} {
		t.Run(fmt.Sprintf("global=%t", global), func(t *testing.T) {
			old := model_setting.GetGlobalSettings().PassThroughRequestEnabled
			model_setting.GetGlobalSettings().PassThroughRequestEnabled = global
			defer func() { model_setting.GetGlobalSettings().PassThroughRequestEnabled = old }()
			c, _ := gin.CreateTestContext(httptest.NewRecorder())
			c.Request = httptest.NewRequest(http.MethodPost, "/v1/responses", nil)
			raw := []byte(`{"model":"gpt-astra-6","input":[{"role":"user","content":[{"type":"input_image","image_url":"data:image/png;base64,TEST_ONLY"}]}],"max_output_tokens":64,"vendor_option":{"queue":"upstream"}}`)
			storage, err := common.CreateBodyStorage(raw)
			require.NoError(t, err)
			defer storage.Close()
			c.Set(common.KeyBodyStorage, storage)
			common.SetContextKey(c, constant.ContextKeyOriginalModel, "gpt-astra-6")
			common.SetContextKey(c, constant.ContextKeyChannelType, constant.ChannelTypeOpenAI)
			common.SetContextKey(c, constant.ContextKeyChannelSetting, dto.ChannelSettings{PassThroughBodyEnabled: !global})
			c.Set("model_mapping", `{"gpt-astra-6":"gpt-6-astra"}`)
			var request dto.OpenAIResponsesRequest
			require.NoError(t, common.Unmarshal(raw, &request))
			info := relaycommon.GenRelayInfoResponses(c, &request)
			_, body, closer, apiErr := PrepareResponsesRequest(c, info, &request)
			require.Nil(t, apiErr)
			defer closer.Close()
			for range 2 {
				reader, err := body.NewReader()
				require.NoError(t, err)
				payload, err := io.ReadAll(reader)
				require.NoError(t, err)
				require.NoError(t, reader.Close())
				assert.Equal(t, "gpt-6-astra", gjson.GetBytes(payload, "model").String())
				assert.Equal(t, gjson.GetBytes(raw, "input").Raw, gjson.GetBytes(payload, "input").Raw)
				assert.Equal(t, "upstream", gjson.GetBytes(payload, "vendor_option.queue").String())
				assert.Equal(t, int64(64), gjson.GetBytes(payload, "max_output_tokens").Int())
			}
			require.NoError(t, closer.Close())
			_, closedErr := body.NewReader()
			assert.ErrorIs(t, closedErr, common.ErrStorageClosed)
			preserved, err := storage.Bytes()
			require.NoError(t, err)
			assert.Equal(t, raw, preserved)
			assert.Equal(t, "gpt-astra-6", request.Model)
		})
	}
}

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
