import { describe, expect, it } from 'vitest'

import {
  HALSAMER_PUBLIC_MODEL,
  HALSAMER_PUBLIC_PRICING,
  isHalsamerPublicModel,
} from '../halsamer-public-pricing'

describe('Halsamer public pricing', () => {
  it('exposes the exact live model and tiers', () => {
    expect(HALSAMER_PUBLIC_MODEL).toBe('gpt-astra-6')
    expect(HALSAMER_PUBLIC_PRICING).toEqual([
      {
        id: '0_272k',
        label: '0–272K input tokens',
        input: 18,
        output: 90,
        cacheRead: 1.8,
        cacheWrite: 22.5,
      },
      {
        id: '272k_plus',
        label: 'Over 272K input tokens',
        input: 36,
        output: 135,
        cacheRead: 3.6,
        cacheWrite: 45,
      },
    ])
  })

  it('only highlights the live public model', () => {
    expect(isHalsamerPublicModel('gpt-astra-6')).toBe(true)
    expect(isHalsamerPublicModel('gpt-6-astra')).toBe(false)
    expect(isHalsamerPublicModel('GPT 6 Astra')).toBe(false)
  })
})
