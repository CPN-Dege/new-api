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
