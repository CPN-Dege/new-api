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
