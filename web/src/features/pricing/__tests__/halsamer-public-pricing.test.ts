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

import { Route } from '@/routes/pricing/$modelId/index'

import { HalsamerPricingHighlight } from '../components/halsamer-pricing-highlight'
import {
  HALSAMER_PUBLIC_MODELS,
  isHalsamerPublicModel,
  selectHalsamerPublicModels,
} from '../halsamer-public-pricing'

vi.mock('@/lib/nav-modules', () => ({
  getModuleAccessForGuard: vi.fn(async () => ({ enabled: true })),
}))

it('keeps all four eligible API rows and their prices, hiding other models and parked groups', () => {
  const models = [
    'gpt-5.6-sol',
    'gpt-6.1-sol',
    'gpt-6-luna',
    'gpt-astra-6',
    'SaaSolVip',
  ].map((model_name) => ({
    model_name,
    enable_groups: ['default', 'stewarden-provider-test'],
    billing_expr: 'SENTINEL',
  }))
  const selected = selectHalsamerPublicModels(models)
  expect(selected.map((model) => model.model_name)).toEqual(
    HALSAMER_PUBLIC_MODELS
  )
  expect(
    selected.every(
      (model) =>
        model.billing_expr === 'SENTINEL' &&
        model.enable_groups.length === 1 &&
        model.enable_groups[0] === 'default'
    )
  ).toBe(true)
  expect(
    selectHalsamerPublicModels([
      { ...models[0], enable_groups: ['stewarden-provider-test'] },
    ])
  ).toEqual([])
  expect(selectHalsamerPublicModels([])).toEqual([])
})

it('preserves each approved model in pricing deep links and rejects unknown IDs', async () => {
  const beforeLoad = Route.options.beforeLoad as (
    options: unknown
  ) => Promise<unknown>
  for (const id of HALSAMER_PUBLIC_MODELS) {
    await expect(
      beforeLoad({
        context: { queryClient: {} },
        location: { search: {} },
        params: { modelId: id },
      })
    ).rejects.toMatchObject({
      options: { to: '/pricing', search: { search: id } },
    })
  }
  await expect(
    beforeLoad({
      context: { queryClient: {} },
      location: { search: {} },
      params: { modelId: 'SaaAstra6' },
    })
  ).rejects.toMatchObject({ options: { to: '/pricing' } })
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}))

describe('Halsamer public pricing', () => {
  it('admits exactly the four public IDs, not upstream aliases', () => {
    expect(HALSAMER_PUBLIC_MODELS).toEqual([
      'gpt-5.6-sol',
      'gpt-6.1-sol',
      'gpt-6-luna',
      'gpt-astra-6',
    ])
    for (const id of HALSAMER_PUBLIC_MODELS) {
      expect(isHalsamerPublicModel(id)).toBe(true)
    }
    for (const id of ['gpt-6-astra', 'SaaSolVip', 'SaaAstra6', 'GPT 6 Astra']) {
      expect(isHalsamerPublicModel(id)).toBe(false)
    }
  })
  it('renders the selected model live expression without stale Astra prices or precision loss', () => {
    const html = renderToStaticMarkup(
      createElement(HalsamerPricingHighlight, {
        modelName: 'gpt-6-luna',
        billingExpr:
          'len <= 272000 ? tier("0_272k", p * 0.18 + c * 0.9 + cr * 0.018 + cc * 0.225) : tier("272k_plus", p * 0.36 + c * 1.35 + cr * 0.036 + cc * 0.45)',
      })
    )
    expect(html).toContain('gpt-6-luna')
    for (const price of ['0.018', '0.225', '0.036', '1.35']) {
      expect(html).toContain(price)
    }
    expect(html).not.toContain('GPT 6 Astra selling price')
  })
  it('does not invent prices when an expression is missing', () => {
    const html = renderToStaticMarkup(
      createElement(HalsamerPricingHighlight, { modelName: 'gpt-5.6-sol' })
    )
    expect(html).not.toContain('$18')
    expect(html).not.toContain('$90')
  })
})
