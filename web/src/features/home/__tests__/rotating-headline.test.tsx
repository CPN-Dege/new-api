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
import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { RotatingHeadline } from '../components/rotating-headline'

const nativeMatchMedia = window.matchMedia
function motionPreference(reduced: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    ...nativeMatchMedia(query),
    matches: reduced,
  }))
}
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it('rotates the exact approved phrases in order and loops', () => {
  motionPreference(false)
  vi.useFakeTimers()
  const { container, unmount } = render(<RotatingHeadline />)
  const active = () =>
    container.querySelector('[data-active="true"]')?.textContent
  expect(active()).toBe('Frontier Model')
  act(() => {
    vi.advanceTimersByTime(3200)
  })
  expect(active()).toBe('Image Generation')
  act(() => {
    vi.advanceTimersByTime(3200)
  })
  expect(active()).toBe('Everythings')
  act(() => {
    vi.advanceTimersByTime(3200)
  })
  expect(active()).toBe('Frontier Model')
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})

it('keeps a stable accessible phrase list and does not rotate for reduced motion', () => {
  motionPreference(true)
  vi.useFakeTimers()
  const { container } = render(<RotatingHeadline />)
  expect(
    screen.getByText('Frontier Model, Image Generation, Everythings')
  ).toHaveClass('sr-only')
  act(() => {
    vi.advanceTimersByTime(9600)
  })
  expect(container.querySelector('[data-active="true"]')?.textContent).toBe(
    'Frontier Model'
  )
  expect(vi.getTimerCount()).toBe(0)
  for (const line of container.querySelectorAll('[data-active]')) {
    expect(line).toHaveAttribute('aria-hidden', 'true')
  }
})
