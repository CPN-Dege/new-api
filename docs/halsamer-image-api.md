# Halsamer Image API

This deployment guide complements the native [New API README](../README.md#quick-start). It describes the five image routes published on Halsamer, not every capability supported by New API upstream.

## Access and models

- Console and API origin: `https://api.halsamer.io`.
- OpenAI-compatible SDK base URL: `https://api.halsamer.io/v1`.
- Image generation: `POST /v1/images/generations` with JSON.
- Group: `default`. Use a **Halsamer-issued API key**, with available quota and permission for the selected model. Do not give clients an upstream provider key.
- Discover the models allowed for your key with `GET /v1/models`. Console → API keys manages keys; usage logs show consumption and charges.

| Public model ID | Upstream model | Purpose and qualification |
| --- | --- | --- |
| `nano-banana-2` | `gemini-3.1-flash-image` | Flash-family option for visual drafts, illustrations, and text-led compositions. |
| `nano-banana-pro` | `gemini-3-pro-image` | Pro-family option for detailed, instruction-heavy compositions. |
| `gpt-image-2.5-sunburst` | Same ID | Separately selectable GPT Image 2.5 variant. No measured quality/speed advantage over Flare is claimed. |
| `gpt-image-2.5-flare` | Same ID | Alternative GPT Image 2.5 variant; compare on your own prompts. |
| `gpt-image-2` | Same ID | GPT-family image generation for illustrations, posters, and graphics. |

All five produced a valid PNG at 1024×1024 in one explicitly authorized non-streaming request per model. This is a functional smoke, not a comparative benchmark. The two Gemini upstream IDs are exposed under the public Nano Banana names; do not send the upstream IDs to Halsamer instead.

## cURL

Set `HALSAMER_API_KEY` privately in your local/server environment. Never commit it or embed it in browser JavaScript.

```bash
curl --fail-with-body --max-time 180 "https://api.halsamer.io/v1/images/generations" \
  -H "Authorization: Bearer $HALSAMER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nano-banana-2",
    "prompt": "A clean poster of a red circle and a blue square on white, with the title HELLO.",
    "n": 1,
    "size": "1024x1024",
    "response_format": "b64_json",
    "stream": false
  }' \
  -o image-response.json
```

The response is JSON, not a PNG file. Decode the returned image:

```python
import base64, json
from pathlib import Path
response = json.loads(Path("image-response.json").read_text())
encoded = response["data"][0]["b64_json"]
Path("image.png").write_bytes(base64.b64decode(encoded, validate=True))
```

For `nano-banana-pro`, change only the model ID. For any of the three GPT image models, change the ID and add `"quality": "low"` to match the verified baseline. Other quality/resolution combinations were not part of this qualification.

## Python SDK

Install the `openai` package in your application's virtual environment, then:

```python
import base64, os
from pathlib import Path
from openai import OpenAI

client = OpenAI(
    base_url="https://api.halsamer.io/v1",
    api_key=os.environ["HALSAMER_API_KEY"],
    timeout=180.0,
    max_retries=0,
)
result = client.images.generate(
    model="gpt-image-2",
    prompt="A clean poster of a red circle and a blue square on white, with the title HELLO.",
    n=1,
    size="1024x1024",
    response_format="b64_json",
    quality="low",
)
encoded = result.data[0].b64_json
if not encoded:
    raise RuntimeError("No base64 image returned; inspect the response")
Path("image.png").write_bytes(base64.b64decode(encoded, validate=True))
```

These are illustrative client examples. The UI/docs verification does not submit another paid generation. Do not assume a chat-only client can generate images merely because it accepts the same API base URL.

## Pricing and limits

- All five image models cost **US$0.20 per image** in the `default` group, with no additional input/output token charges. The request total is US$0.20 multiplied by the billed image count: one image costs US$0.20; two cost US$0.40.
- Native billing expression: `tier("image", fixed(0.2)) * image_count`. Image quantity is validated and settled by New API; this is not one flat fee for an unlimited number of images.
- This Founder-selected fixed tariff replaces the previous token-based image prices and Nano/GPT parity decision. Chat pricing is unchanged. Inspect Model Square and usage logs for the active tariff and actual charge.
- Google logos identify both Nano Banana routes; OpenAI logos identify the GPT Image routes. All remain served through the configured Aotian provider; a logo is not upstream provenance proof.
- Native expression and configuration readback are verified without another paid generation. A fresh live charge under this revised tariff has not been tested.
- Reference edits, 4K, streaming, and multiple images remain unqualified on these exact routes. The native README lists `/v1/images/edits` separately; a source-level route is not a successful provider test. Do not put guessed reference-image fields on the generation endpoint.
- A timeout can occur after upstream dispatch. Check usage logs before retrying. The examples disable automatic SDK retries; a fresh request may create another image and charge.

## Implementation references

- Native setup/key/group/quota flow: [README](../README.md#quick-start).
- Separate image generation/edit endpoints: [README protocols](../README.md#capabilities).
- Request schema: `relaykit/dto/openai_image.go`.
- Image relay: `relay/image_handler.go` and `relay/channel/openai/relay_image.go`.
- Native billing: `service/image_billing.go` and `service/tiered_settle.go`.
- Prior paid qualification and exact live metadata: registered project evidence `aotian-image-catalog-20261014/`; current UI work: `image-storefront-20261014/`.
