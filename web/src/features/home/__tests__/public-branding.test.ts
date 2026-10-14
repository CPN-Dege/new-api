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
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { Features } from '../components/sections/features'
import {
  CORE_FEATURES_COPY,
  FOCUSED_STATS,
  FOCUSED_MODELS,
  HERO_COPY,
  PUBLIC_NAV_ITEMS,
  SUPPORTED_APPLICATIONS,
  SUPPORTED_APPLICATIONS_DESCRIPTION,
} from '../public-branding'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('Halsamer public branding', () => {
  it('publishes every selected image ID alongside the existing chat models', () => {
    const ids = FOCUSED_MODELS.map((model) => model.modelId)
    for (const id of [
      'nano-banana-2',
      'nano-banana-pro',
      'gpt-image-2.5-sunburst',
      'gpt-image-2.5-flare',
      'gpt-image-2',
    ]) {
      expect(ids).toContain(id)
    }
    expect(new Set(ids).size).toBe(9)
  })
  it('renders nine Live cards with exact IDs and responsive columns', () => {
    const html = renderToStaticMarkup(createElement(Features))
    const host = document.createElement('div')
    host.innerHTML = html
    const cards = host.querySelectorAll('[data-model-id]')
    expect(cards).toHaveLength(9)
    for (const model of FOCUSED_MODELS) {
      const card = host.querySelector(`[data-model-id="${model.modelId}"]`)
      expect(card?.textContent).toContain(model.name)
      expect(card?.textContent).toContain(model.modelId)
      expect(card?.textContent).toContain('Live')
      expect(
        card?.querySelector('[role="img"]')?.getAttribute('aria-label')
      ).toBe(model.modelId.startsWith('nano-') ? 'Google logo' : 'OpenAI logo')
    }
    expect(cards[0].parentElement?.classList.contains('sm:grid-cols-2')).toBe(
      true
    )
    expect(cards[0].parentElement?.classList.contains('lg:grid-cols-4')).toBe(
      true
    )
    expect(host.textContent).not.toMatch(/coming soon/i)
  })
  it('exposes only the four approved public destinations', () => {
    expect(PUBLIC_NAV_ITEMS).toEqual([
      { title: 'Home', href: '/' },
      { title: 'Console', href: '/dashboard' },
      { title: 'Model Square', href: '/pricing' },
      {
        title: 'Academy',
        href: 'https://academy.halsamer.io',
        external: true,
      },
    ])
  })

  it('points supported applications to their official websites', () => {
    expect(SUPPORTED_APPLICATIONS).toEqual([
      { name: 'Codex', iconName: 'OpenAI', href: 'https://openai.com/codex' },
      {
        name: 'Claude Code',
        iconName: 'Claude.Color',
        href: 'https://www.anthropic.com/claude-code',
      },
    ])
    expect(SUPPORTED_APPLICATIONS_DESCRIPTION).toBe(
      'Supports one-click configuration and perfectly adapts to Halsamer API protocol configuration.'
    )
  })

  it('shows the nine published models as Live with exact public IDs', () => {
    expect(FOCUSED_MODELS).toEqual([
      { name: 'GPT 5.6 Sol', status: 'Live', modelId: 'gpt-5.6-sol' },
      { name: 'GPT 6.1 Sol', status: 'Live', modelId: 'gpt-6.1-sol' },
      { name: 'GPT 6 Luna', status: 'Live', modelId: 'gpt-6-luna' },
      { name: 'GPT 6 Astra', status: 'Live', modelId: 'gpt-astra-6' },
      { name: 'Nano Banana 2', status: 'Live', modelId: 'nano-banana-2' },
      { name: 'Nano Banana Pro', status: 'Live', modelId: 'nano-banana-pro' },
      {
        name: 'GPT Image 2.5 Sunburst',
        status: 'Live',
        modelId: 'gpt-image-2.5-sunburst',
      },
      {
        name: 'GPT Image 2.5 Flare',
        status: 'Live',
        modelId: 'gpt-image-2.5-flare',
      },
      { name: 'GPT Image 2', status: 'Live', modelId: 'gpt-image-2' },
    ])
  })

  it('keeps statistics and landing copy aligned with nine live models', () => {
    expect(FOCUSED_STATS).toEqual([
      { value: 9, label: 'live AI models' },
      { value: 1, label: 'unified API access' },
      { value: 1, label: 'usage dashboard' },
    ])
    expect(CORE_FEATURES_COPY).toEqual({
      eyebrow: 'Focused AI Access',
      heading: 'Nine live models,',
      subheading: 'one API for your workflows',
    })
    expect(HERO_COPY).toEqual({
      heading: 'One API for',
      modelLine: 'GPT & Nano Banana',
      availabilityLine: 'Four chat models. Five image models. All live.',
      description:
        'Chat and generate images through Halsamer API with one key, clear usage pricing, and familiar OpenAI-compatible workflows.',
    })
    expect(
      JSON.stringify([
        FOCUSED_MODELS,
        FOCUSED_STATS,
        HERO_COPY,
        CORE_FEATURES_COPY,
      ])
    ).not.toMatch(/coming soon|SaaAstra6/i)
  })
})
