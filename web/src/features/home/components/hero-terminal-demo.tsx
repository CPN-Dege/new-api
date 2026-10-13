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
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { imageRequest } from '../image-models'

const ORIGIN = 'https://api.halsamer.io'
const MODEL = 'gpt-6.1-sol'

const API_EXAMPLES = [
  {
    id: 'chat',
    label: 'Chat',
    baseUrl: `${ORIGIN}/v1`,
    endpoint: `${ORIGIN}/v1/chat/completions`,
    headers: ['Authorization: Bearer $HALSAMER_API_KEY'],
    payload: {
      model: MODEL,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 256,
    },
  },
  {
    id: 'responses',
    label: 'Responses',
    baseUrl: `${ORIGIN}/v1`,
    endpoint: `${ORIGIN}/v1/responses`,
    headers: ['Authorization: Bearer $HALSAMER_API_KEY'],
    payload: { model: MODEL, input: 'Hello', max_output_tokens: 256 },
  },
  {
    id: 'images',
    label: 'Images',
    baseUrl: `${ORIGIN}/v1`,
    endpoint: `${ORIGIN}/v1/images/generations`,
    headers: ['Authorization: Bearer $HALSAMER_API_KEY'],
    payload: imageRequest('nano-banana-2'),
  },
  {
    id: 'claude',
    label: 'Claude',
    baseUrl: ORIGIN,
    endpoint: `${ORIGIN}/v1/messages`,
    headers: ['x-api-key: $HALSAMER_API_KEY', 'anthropic-version: 2023-06-01'],
    payload: {
      model: MODEL,
      max_tokens: 256,
      messages: [{ role: 'user', content: 'Hello' }],
    },
  },
  {
    id: 'gemini',
    label: 'Gemini',
    baseUrl: ORIGIN,
    endpoint: `${ORIGIN}/v1beta/models/${MODEL}:generateContent`,
    headers: ['x-goog-api-key: $HALSAMER_API_KEY'],
    payload: {
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      generationConfig: { maxOutputTokens: 256 },
    },
  },
]

export function HeroTerminalDemo(props: { className?: string }) {
  const { t } = useTranslation()
  return (
    <section
      aria-label={t('Halsamer API examples')}
      className={cn(
        'mx-auto w-full min-w-0 max-w-2xl overflow-hidden rounded-2xl border bg-background/95 shadow-lg',
        props.className
      )}
    >
      <Tabs defaultValue='chat' className='gap-0'>
        <TabsList
          variant='line'
          className='h-auto w-full flex-wrap justify-start border-b px-3 py-2'
          aria-label={t('API protocol')}
        >
          {API_EXAMPLES.map((example) => (
            <TabsTrigger key={example.id} value={example.id}>
              {t(example.label)}
            </TabsTrigger>
          ))}
        </TabsList>
        {API_EXAMPLES.map((example) => {
          const command = [
            `curl -X POST "${example.endpoint}"`,
            ...example.headers.map((header) => `  -H "${header}"`),
            '  -H "Content-Type: application/json"',
            `  -d '${JSON.stringify(example.payload, null, 2)}'`,
          ].join(' \\\n')
          return (
            <TabsContent
              key={example.id}
              value={example.id}
              className='min-w-0 p-4 sm:p-5'
            >
              <dl className='mb-4 grid gap-2 text-xs'>
                <div>
                  <dt className='text-muted-foreground'>{t('Base URL')}</dt>
                  <dd className='font-mono break-all'>{example.baseUrl}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>{t('Model')}</dt>
                  <dd className='font-mono'>
                    {example.id === 'images' ? 'nano-banana-2' : MODEL}
                  </dd>
                </div>
              </dl>
              <p className='text-muted-foreground mb-3 text-xs'>
                {t(
                  'Set HALSAMER_API_KEY to your Halsamer API key in your local environment. Never share your key.'
                )}
              </p>
              <div className='mb-2 flex items-center justify-between gap-2'>
                <span className='text-xs font-semibold'>
                  {t('Request example')}
                </span>
                <CopyButton
                  value={command}
                  aria-label={t('Copy request example')}
                />
              </div>
              <pre className='bg-muted/30 max-h-[380px] overflow-auto rounded-lg p-3 text-xs leading-relaxed break-all whitespace-pre-wrap'>
                <code>{command}</code>
              </pre>
              <p className='text-muted-foreground mt-3 text-xs'>
                {t(
                  'Illustrative example — not a live response or speed guarantee. Protocol compatibility depends on the selected model and route.'
                )}
              </p>
              <p className='text-muted-foreground mt-2 text-xs'>
                {t(
                  'Claude and Gemini label API formats, not additional model names. Use the exact Halsamer model ID from Model Square.'
                )}
              </p>
            </TabsContent>
          )
        })}
      </Tabs>
    </section>
  )
}
