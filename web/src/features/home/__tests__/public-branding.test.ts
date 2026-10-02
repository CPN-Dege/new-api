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
  it('renders four Live cards with exact IDs and responsive columns', () => {
    const html = renderToStaticMarkup(createElement(Features))
    const host = document.createElement('div')
    host.innerHTML = html
    const cards = host.querySelectorAll('[data-model-id]')
    expect(cards).toHaveLength(4)
    for (const model of FOCUSED_MODELS) {
      const card = host.querySelector(`[data-model-id="${model.modelId}"]`)
      expect(card?.textContent).toContain(model.name)
      expect(card?.textContent).toContain(model.modelId)
      expect(card?.textContent).toContain('Live')
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

  it('shows the four published models as Live with exact public IDs', () => {
    expect(FOCUSED_MODELS).toEqual([
      { name: 'GPT 5.6 Sol', status: 'Live', modelId: 'gpt-5.6-sol' },
      { name: 'GPT 6.1 Sol', status: 'Live', modelId: 'gpt-6.1-sol' },
      { name: 'GPT 6 Luna', status: 'Live', modelId: 'gpt-6-luna' },
      { name: 'GPT 6 Astra', status: 'Live', modelId: 'gpt-astra-6' },
    ])
  })

  it('keeps statistics and landing copy aligned with four live models', () => {
    expect(FOCUSED_STATS).toEqual([
      { value: 4, label: 'live AI models' },
      { value: 1, label: 'unified API access' },
      { value: 1, label: 'usage dashboard' },
    ])
    expect(CORE_FEATURES_COPY).toEqual({
      eyebrow: 'Focused AI Access',
      heading: 'Four live models,',
      subheading: 'one API for your workflows',
    })
    expect(HERO_COPY).toEqual({
      heading: 'One API for',
      modelLine: 'GPT Sol, Luna & Astra',
      availabilityLine: 'Four models. All live.',
      description:
        'Access four live models through Halsamer API with transparent pricing, clear usage tracking, and familiar OpenAI-compatible workflows.',
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
