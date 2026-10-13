/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
export const IMAGE_MODELS = [
  {
    name: 'Nano Banana 2',
    modelId: 'nano-banana-2',
    upstream: 'gemini-3.1-flash-image',
    description:
      'Flash-family image generation for everyday visual drafts, illustrations, and text-led compositions.',
  },
  {
    name: 'Nano Banana Pro',
    modelId: 'nano-banana-pro',
    upstream: 'gemini-3-pro-image',
    description:
      'Pro-family image generation for detailed compositions and instruction-heavy creative work.',
  },
  {
    name: 'GPT Image 2.5 Sunburst',
    modelId: 'gpt-image-2.5-sunburst',
    upstream: 'gpt-image-2.5-sunburst',
    description:
      'A separately selectable GPT Image 2.5 variant. Generation is verified; a quality or speed advantage over Flare is not established.',
  },
  {
    name: 'GPT Image 2.5 Flare',
    modelId: 'gpt-image-2.5-flare',
    upstream: 'gpt-image-2.5-flare',
    description:
      'An alternative GPT Image 2.5 variant for your own prompt comparison. Generation is verified; no ranking against Sunburst is claimed.',
  },
  {
    name: 'GPT Image 2',
    modelId: 'gpt-image-2',
    upstream: 'gpt-image-2',
    description:
      'GPT-family image generation for illustrations, posters, and prompt-directed graphics. Uses the same Images API workflow.',
  },
] as const

export function getImageModel(modelId: string) {
  return IMAGE_MODELS.find((model) => model.modelId === modelId)
}

export function imageRequest(modelId: string) {
  if (!getImageModel(modelId)) throw new Error('Unknown public image model')
  return {
    model: modelId,
    prompt:
      'A clean poster of a red circle and a blue square on white, with the title HELLO.',
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
    stream: false,
    ...(modelId.startsWith('gpt-') ? { quality: 'low' } : {}),
  }
}

export function imageCurl(modelId: string) {
  return [
    'curl --fail-with-body --max-time 180 "https://api.halsamer.io/v1/images/generations"',
    '  -H "Authorization: Bearer $HALSAMER_API_KEY"',
    '  -H "Content-Type: application/json"',
    `  -d '${JSON.stringify(imageRequest(modelId), null, 2)}'`,
    '  -o image-response.json',
  ].join(' \\\n')
}

export function imagePython(modelId: string) {
  const request = imageRequest(modelId)
  return [
    'import base64, os',
    'from pathlib import Path',
    'from openai import OpenAI',
    '',
    'client = OpenAI(',
    '    base_url="https://api.halsamer.io/v1",',
    '    api_key=os.environ["HALSAMER_API_KEY"],',
    '    timeout=180.0, max_retries=0,',
    ')',
    'result = client.images.generate(',
    `    model="${modelId}",`,
    `    prompt=${JSON.stringify(request.prompt)},`,
    '    n=1, size="1024x1024", response_format="b64_json",',
    ...(modelId.startsWith('gpt-') ? ['    quality="low",'] : []),
    ')',
    'encoded = result.data[0].b64_json',
    'if not encoded:',
    '    raise RuntimeError("No base64 image returned; inspect the response")',
    'Path("image.png").write_bytes(base64.b64decode(encoded, validate=True))',
  ].join('\n')
}
