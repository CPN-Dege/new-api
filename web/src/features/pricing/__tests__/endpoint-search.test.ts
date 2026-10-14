import { describe, expect, it } from 'vitest'

import { filterBySearch } from '../lib/filters'
import type { PricingModel } from '../types'

const image: PricingModel = {
  id: 1,
  model_name: 'nano-banana-2',
  quota_type: 0,
  model_ratio: 1,
  completion_ratio: 1,
  enable_groups: ['default'],
  supported_endpoint_types: ['image-generation'],
}
describe('model endpoint search', () => {
  it('finds the advertised endpoint type without changing the model', () => {
    expect(filterBySearch([image], 'IMAGE-GENERATION')).toEqual([image])
    expect(filterBySearch([image], 'nonexistent')).toEqual([])
  })
})
