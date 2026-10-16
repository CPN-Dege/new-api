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
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMediaQuery } from '@/hooks/use-media-query'

import { HERO_COPY } from '../public-branding'

import '@/styles/typewriter-blue.css'

// Invisible full phrases reserve the same space, even during the empty beat.
export function RotatingHeadline() {
  const { t } = useTranslation()
  const root = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState(() => t(HERO_COPY.modelLines[0]))
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    const phrases = HERO_COPY.modelLines.map((line) => [...t(line)])
    setText(phrases[0].join(''))
    if (reducedMotion) return

    let index = 0
    let length = phrases[0].length
    let deleting = true
    let delay = 1800
    let inView = true
    let timer: number | undefined

    function schedule() {
      window.clearTimeout(timer)
      const paused = document.hidden || !inView
      if (root.current) {
        root.current.dataset.motion = paused ? 'paused' : 'running'
      }
      if (paused) return
      timer = window.setTimeout(tick, delay)
    }

    function tick() {
      if (deleting) {
        length--
        setText(phrases[index].slice(0, length).join(''))
        delay = 18
        if (length === 0) {
          index = (index + 1) % phrases.length
          deleting = false
          delay = 160
        }
      } else {
        length++
        setText(phrases[index].slice(0, length).join(''))
        delay = 32
        if (length === phrases[index].length) {
          deleting = true
          delay = 1800
        }
      }
      schedule()
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      schedule()
    })
    if (root.current) observer.observe(root.current)
    document.addEventListener('visibilitychange', schedule)
    schedule()
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [t, reducedMotion])

  return (
    <span
      ref={root}
      data-motion={reducedMotion ? 'paused' : undefined}
      className='inline-grid max-w-full align-top'
    >
      <span className='sr-only'>
        {HERO_COPY.modelLines.map((line) => t(line)).join(', ')}
      </span>
      {HERO_COPY.modelLines.map((line) => (
        <span
          key={line}
          aria-hidden='true'
          className='invisible col-start-1 row-start-1'
        >
          {t(line)}
        </span>
      ))}
      <span
        aria-hidden='true'
        data-active='true'
        className='hls-typewriter-blue col-start-1 row-start-1'
      >
        {reducedMotion ? t(HERO_COPY.modelLines[0]) : text}
      </span>
    </span>
  )
}
