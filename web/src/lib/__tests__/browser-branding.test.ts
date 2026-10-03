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
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  HALSAMER_BROWSER_TITLE,
  HALSAMER_COMPACT_TITLE,
  HALSAMER_FAVICON,
  HALSAMER_LOGO,
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

  it('uses the supplied Halsamer 3D mark and favicon assets', () => {
    expect(HALSAMER_LOGO).toBe('/brand-3d/Halsamer-3D-symbol-color-512.png')
    expect(HALSAMER_FAVICON).toBe('/brand-3d/favicon-transparent-v2.ico')
  })

  it('keeps build-time favicon injection on the supplied Halsamer asset', () => {
    const config = readFileSync(
      resolve(process.cwd(), 'rsbuild.config.ts'),
      'utf8'
    )
    expect(config).toContain(
      "favicon: './public/brand-3d/favicon-transparent-v2.ico'"
    )
    expect(config).not.toContain("favicon: './public/favicon.ico'")
  })
})
