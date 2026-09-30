import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import {
  HALSAMER_PUBLIC_PRICING,
  isHalsamerPublicModel,
} from '../halsamer-public-pricing'

interface HalsamerPricingHighlightProps {
  modelName: string
  compact?: boolean
}

const PRICE_COLUMNS = [
  { key: 'input', label: 'Input' },
  { key: 'output', label: 'Output' },
  { key: 'cacheRead', label: 'Cache read' },
  { key: 'cacheWrite', label: 'Cache write' },
] as const

function usd(value: number): string {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`
}

export function HalsamerPricingHighlight({
  modelName,
  compact = false,
}: HalsamerPricingHighlightProps) {
  if (!isHalsamerPublicModel(modelName)) return null

  return (
    <section
      aria-label='Halsamer GPT 6 Astra selling price'
      className={cn(
        'border-border/60 bg-muted/20 rounded-xl border',
        compact ? 'p-3' : 'p-4 sm:p-5'
      )}
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <p className='text-sm font-semibold'>GPT 6 Astra selling price</p>
          <p className='text-muted-foreground mt-1 text-xs'>
            USD per 1M tokens · default group · OpenAI-compatible
          </p>
        </div>
        <Badge variant='secondary'>Live</Badge>
      </div>

      <div className='mt-4 overflow-x-auto'>
        <table className='w-full min-w-[560px] border-separate border-spacing-0 text-left text-xs'>
          <thead>
            <tr className='text-muted-foreground'>
              <th className='border-border/60 border-b px-3 py-2 font-medium'>
                Input context
              </th>
              {PRICE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className='border-border/60 border-b px-3 py-2 font-medium'
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HALSAMER_PUBLIC_PRICING.map((tier) => (
              <tr key={tier.id}>
                <td className='border-border/40 border-b px-3 py-3 font-medium last:border-b-0'>
                  {tier.label}
                </td>
                {PRICE_COLUMNS.map((column) => (
                  <td
                    key={column.key}
                    className='border-border/40 border-b px-3 py-3 font-mono font-semibold tabular-nums last:border-b-0'
                  >
                    {usd(tier[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
