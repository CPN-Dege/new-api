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
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { isHalsamerPublicModel } from '../halsamer-public-pricing'
import { DynamicPricingBreakdown } from './dynamic-pricing-breakdown'

interface HalsamerPricingHighlightProps {
  modelName: string
  billingExpr?: string | null
  compact?: boolean
}

export function HalsamerPricingHighlight(props: HalsamerPricingHighlightProps) {
  const { t } = useTranslation()
  if (!isHalsamerPublicModel(props.modelName)) return null

  return (
    <section
      aria-label={props.modelName}
      data-public-pricing-model={props.modelName}
      className={cn(
        'border-border/60 bg-muted/20 min-w-0 rounded-xl border',
        props.compact ? 'p-3' : 'p-4 sm:p-5'
      )}
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='min-w-0'>
          <p className='text-sm font-semibold'>{props.modelName}</p>
          <p className='text-muted-foreground mt-1 text-xs'>
            {t('USD per 1M tokens · default group · OpenAI-compatible')}
          </p>
        </div>
        <Badge variant='secondary'>{t('Live')}</Badge>
      </div>
      <div className='mt-4 min-w-0 overflow-x-auto'>
        <DynamicPricingBreakdown
          billingExpr={props.billingExpr}
          compact={props.compact}
        />
      </div>
    </section>
  )
}
