import { describe, expect, it } from 'vitest'

import {
  HALSAMER_BROWSER_TITLE,
  HALSAMER_COMPACT_TITLE,
  resolveBrowserTitle,
  resolveHeaderTitle,
} from '../browser-branding'

describe('Halsamer browser branding', () => {
  it('keeps the browser title fixed to Halsamer API', () => {
    expect(resolveBrowserTitle('New API')).toBe('Halsamer API')
    expect(resolveBrowserTitle('Other Gateway')).toBe('Halsamer API')
    expect(resolveBrowserTitle(undefined)).toBe(HALSAMER_BROWSER_TITLE)
  })

  it('uses HLS API only for the compact scrolled header', () => {
    expect(resolveHeaderTitle(false)).toBe(HALSAMER_BROWSER_TITLE)
    expect(resolveHeaderTitle(true)).toBe(HALSAMER_COMPACT_TITLE)
    expect(HALSAMER_COMPACT_TITLE).toBe('HLS API')
  })
})
