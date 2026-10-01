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
export const HALSAMER_BROWSER_TITLE = 'Halsamer API'
export const HALSAMER_COMPACT_TITLE = 'HLS API'
export const HALSAMER_LOGO = '/brand-3d/Halsamer-3D-symbol-color-512.png'
export const HALSAMER_FAVICON = '/brand-3d/favicon-3d.ico'

export function resolveBrowserTitle(_systemName?: string): string {
  return HALSAMER_BROWSER_TITLE
}

export function resolveHeaderTitle(compact: boolean): string {
  return compact ? HALSAMER_COMPACT_TITLE : HALSAMER_BROWSER_TITLE
}
