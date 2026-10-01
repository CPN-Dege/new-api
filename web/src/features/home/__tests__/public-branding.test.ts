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
import { describe, expect, it } from 'vitest'

import {
  CORE_FEATURES_COPY,
  FOCUSED_STATS,
  FOCUSED_MODELS,
  HERO_COPY,
  PUBLIC_NAV_ITEMS,
  SUPPORTED_APPLICATIONS,
  SUPPORTED_APPLICATIONS_DESCRIPTION,
} from '../public-branding'

describe('Halsamer public branding', () => {
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

  it('distinguishes the live model from planned models', () => {
    expect(FOCUSED_MODELS).toEqual([
      { name: 'GPT 6 Astra', status: 'Live', modelId: 'gpt-astra-6' },
      { name: 'GPT 5.6 Sol', status: 'Coming soon' },
      { name: 'GPT 6 Sol', status: 'Coming soon' },
    ])
    expect(FOCUSED_STATS).toEqual([
      { value: 1, label: 'live AI model' },
      { value: 2, label: 'models coming soon' },
      { value: 1, label: 'unified API access' },
    ])
    expect(CORE_FEATURES_COPY).toEqual({
      eyebrow: 'Focused AI Access',
      heading: 'One live model today,',
      subheading: 'two more coming soon',
    })
    expect(HERO_COPY).toEqual({
      heading: 'One API for',
      modelLine: 'GPT 6 Astra',
      comingSoonLine: 'GPT 5.6 Sol and GPT 6 Sol coming soon',
      description:
        'Use GPT 6 Astra today through Halsamer API with transparent pricing, clear usage tracking, and familiar OpenAI-compatible workflows.',
    })
  })
})
