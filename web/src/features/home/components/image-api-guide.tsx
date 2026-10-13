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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  getImageModel,
  IMAGE_MODELS,
  imageCurl,
  imagePython,
} from '../image-models'

export function ImageApiGuide(props: { modelId?: string }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState('nano-banana-2')
  const model = getImageModel(props.modelId ?? selected)
  if (!model) return null
  return (
    <section
      id={props.modelId ? undefined : 'image-api'}
      aria-label={t('Image API guide')}
      className='min-w-0 space-y-4'
    >
      <div>
        <h2 className='text-xl font-semibold'>
          {t('Create images with Halsamer API')}
        </h2>
        <p className='text-muted-foreground mt-2 text-sm'>
          {t(
            'Five image models on the default group. Use your Halsamer-issued API key, not an upstream provider key.'
          )}
        </p>
      </div>
      {!props.modelId && (
        <div
          className='flex flex-wrap gap-2'
          aria-label={t('Choose an image model')}
        >
          {IMAGE_MODELS.map((item) => (
            <Button
              key={item.modelId}
              variant={model.modelId === item.modelId ? 'default' : 'outline'}
              size='sm'
              aria-pressed={model.modelId === item.modelId}
              onClick={() => setSelected(item.modelId)}
            >
              {item.name}
            </Button>
          ))}
        </div>
      )}
      <div className='rounded-lg border p-4'>
        <h3 className='font-semibold'>{model.name}</h3>
        <code className='mt-1 block text-xs break-all'>{model.modelId}</code>
        <p className='text-muted-foreground mt-2 text-sm'>
          {t(model.description)}
        </p>
        <p className='text-muted-foreground mt-2 text-xs'>
          {t('Upstream model')}: <code>{model.upstream}</code>
        </p>
      </div>
      <ol className='list-decimal space-y-2 pl-5 text-sm'>
        <li>
          {t(
            'Sign in to the console, create an API key for the default group, and ensure you have available quota. Restricted keys must allow the selected model.'
          )}
        </li>
        <li>
          {t(
            'Set HALSAMER_API_KEY in your server environment. For the Python example, install the openai package. Never put a secret key in browser code.'
          )}
        </li>
        <li>
          {t(
            'Send a prompt to POST /v1/images/generations. The SDK base URL is https://api.halsamer.io/v1. Check accessible model IDs with GET /v1/models.'
          )}
        </li>
        <li>
          {t(
            'Decode data[0].b64_json to save the image. Check usage and the actual charge in the console logs; an image does not have a fixed per-picture price.'
          )}
        </li>
      </ol>
      <Tabs defaultValue='curl'>
        <TabsList aria-label={t('Image example language')}>
          <TabsTrigger value='curl'>cURL</TabsTrigger>
          <TabsTrigger value='python'>Python</TabsTrigger>
        </TabsList>
        {(['curl', 'python'] as const).map((language) => {
          const command =
            language === 'curl'
              ? imageCurl(model.modelId)
              : imagePython(model.modelId)
          return (
            <TabsContent key={language} value={language} className='min-w-0'>
              <div className='mb-2 flex items-center justify-between gap-2'>
                <span className='text-xs'>{t('Request example')}</span>
                <CopyButton
                  value={command}
                  aria-label={t('Copy image example')}
                />
              </div>
              <pre className='bg-muted/30 max-h-[420px] overflow-auto rounded-lg p-3 text-xs leading-relaxed break-all whitespace-pre-wrap'>
                <code>{command}</code>
              </pre>
            </TabsContent>
          )
        })}
      </Tabs>
      <div className='text-muted-foreground space-y-2 text-sm'>
        <p>
          {t(
            'Verified baseline: one PNG at 1024×1024 per request, non-streaming, for each of these five models. This is not a quality or speed benchmark.'
          )}
        </p>
        <p>
          {t(
            'Reference editing, 4K, streaming, multiple images, and cached billing have not been qualified on these routes. The native New API README lists /v1/images/edits separately; do not treat it as verified for these models.'
          )}
        </p>
        <p>
          {t(
            'Nano Banana 2 and Pro use the GPT Image 2 pricing scheme. The provider does not separate their text and image output tokens, so all reported output tokens use the output rate. This is not official Nano Banana price parity.'
          )}
        </p>
        <p>
          {t(
            'Model Square prices are token-based, in USD per 1M tokens. Use the selected model’s current pricing breakdown, not another model’s rate.'
          )}
        </p>
        <p>
          {t(
            'A timeout can occur after generation starts. Inspect your usage logs before retrying; automatic retries can create additional images and charges.'
          )}
        </p>
      </div>
    </section>
  )
}
