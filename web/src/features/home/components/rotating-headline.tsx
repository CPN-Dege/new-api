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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

import { HERO_COPY } from '../public-branding'

// Keep every phrase in the same grid cell so the longest phrase reserves space.
// Existing page transitions cannot rotate inline text without layout shifts.
export function RotatingHeadline() {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (reducedMotion) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % HERO_COPY.modelLines.length)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [reducedMotion])

  return (
    <span className='inline-grid max-w-full align-top'>
      <span className='sr-only'>
        {HERO_COPY.modelLines.map((line) => t(line)).join(', ')}
      </span>
      {HERO_COPY.modelLines.map((line, i) => (
        <span
          key={line}
          aria-hidden='true'
          data-active={index === i}
          className={cn(
            'col-start-1 row-start-1 bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text text-transparent transition-[opacity,transform] duration-500 motion-reduce:transition-none',
            index === i
              ? 'translate-y-0 opacity-100'
              : 'translate-y-2 opacity-0'
          )}
        >
          {t(line)}
        </span>
      ))}
    </span>
  )
}
