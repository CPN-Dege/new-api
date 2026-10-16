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
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { RotatingHeadline } from '../components/rotating-headline'

const nativeMatchMedia = window.matchMedia
function motionPreference(reduced: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    ...nativeMatchMedia(query),
    matches: reduced,
  }))
}
let intersect: IntersectionObserverCallback
const disconnect = vi.fn()
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback
      }
      observe() {}
      disconnect = disconnect
    }
  )
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('uses the blue LED treatment and pauses its breathing with motion visibility', () => {
  motionPreference(false)
  vi.useFakeTimers()
  const { container, unmount } = render(<RotatingHeadline />)
  const text = container.querySelector('[data-active="true"]')
  expect(text).toHaveClass('hls-typewriter-blue')
  expect(text?.parentElement).toHaveAttribute('data-motion', 'running')
  act(() =>
    intersect(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  )
  expect(text?.parentElement).toHaveAttribute('data-motion', 'paused')
  act(() =>
    intersect(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  )
  expect(text?.parentElement).toHaveAttribute('data-motion', 'running')
  unmount()
})

it('pauses offscreen or hidden and releases observers and timers on unmount', () => {
  motionPreference(false)
  vi.useFakeTimers()
  const { container, unmount } = render(<RotatingHeadline />)
  act(() =>
    intersect(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  )
  expect(vi.getTimerCount()).toBe(0)
  act(() => vi.advanceTimersByTime(10000))
  expect(container.querySelector('[data-active="true"]')?.textContent).toBe(
    'Frontier Model'
  )
  act(() =>
    intersect(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  )
  expect(vi.getTimerCount()).toBe(1)
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  expect(vi.getTimerCount()).toBe(0)
  hidden.mockReturnValue(false)
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  expect(vi.getTimerCount()).toBe(1)
  unmount()
  expect(disconnect).toHaveBeenCalled()
  expect(vi.getTimerCount()).toBe(0)
})

it('backspaces one letter at a time, then types each exact phrase and loops', () => {
  motionPreference(false)
  vi.useFakeTimers()
  const { container, unmount } = render(<RotatingHeadline />)
  const active = () =>
    container.querySelector('[data-active="true"]')?.textContent
  expect(active()).toBe('Frontier Model')
  act(() => vi.advanceTimersByTime(1800))
  expect(active()).toBe('Frontier Mode')
  act(() => vi.advanceTimersByTime(18))
  expect(active()).toBe('Frontier Mod')
  for (const text of [
    'Frontier Mo',
    'Frontier M',
    'Frontier ',
    'Frontier',
    'Frontie',
    'Fronti',
    'Front',
    'Fron',
    'Fro',
    'Fr',
    'F',
    '',
  ]) {
    act(() => vi.advanceTimersToNextTimer())
    expect(active()).toBe(text)
  }
  for (const phrase of ['Image Generation', 'Everythings', 'Frontier Model']) {
    for (let length = 1; length <= phrase.length; length++) {
      act(() => vi.advanceTimersToNextTimer())
      expect(active()).toBe(phrase.slice(0, length))
    }
    if (phrase === 'Frontier Model') break
    for (let length = phrase.length - 1; length >= 0; length--) {
      act(() => vi.advanceTimersToNextTimer())
      expect(active()).toBe(phrase.slice(0, length))
    }
  }
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
