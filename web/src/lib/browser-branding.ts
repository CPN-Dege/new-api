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
