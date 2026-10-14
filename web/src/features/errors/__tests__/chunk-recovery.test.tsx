import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { GeneralError } from '../general-error'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useRouter: () => ({ history: { go: vi.fn() } }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
afterEach(() => vi.unstubAllGlobals())

it('offers a full page reload for a stale release chunk, without automatic reload loops', () => {
  const reload = vi.fn()
  vi.stubGlobal('location', { ...window.location, reload })
  const error = new Error('Loading chunk 726 failed.')
  error.name = 'ChunkLoadError'
  render(<GeneralError error={error} />)
  expect(
    screen.getByText(
      /A new version is available\. Reload this page to continue\./
    )
  ).toBeDefined()
  expect(reload).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Reload page' }))
  expect(reload).toHaveBeenCalledOnce()
})
