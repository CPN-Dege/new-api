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
export const HALSAMER_PUBLIC_MODEL = 'gpt-astra-6' as const

export type HalsamerPublicPricingTier = {
  id: '0_272k' | '272k_plus'
  label: string
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export const HALSAMER_PUBLIC_PRICING: readonly HalsamerPublicPricingTier[] = [
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
] as const

export function isHalsamerPublicModel(modelName: string): boolean {
  return modelName === HALSAMER_PUBLIC_MODEL
}
