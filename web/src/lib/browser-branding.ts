export const HALSAMER_BROWSER_TITLE = 'Halsamer API'
export const HALSAMER_COMPACT_TITLE = 'HLS API'

export function resolveBrowserTitle(_systemName?: string): string {
  return HALSAMER_BROWSER_TITLE
}

export function resolveHeaderTitle(compact: boolean): string {
  return compact ? HALSAMER_COMPACT_TITLE : HALSAMER_BROWSER_TITLE
}
