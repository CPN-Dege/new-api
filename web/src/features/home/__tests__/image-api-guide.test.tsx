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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'

import { ModelDetailsApi } from '@/features/pricing/components/model-details-api'
import type { PricingModel } from '@/features/pricing/types'

import { ImageApiGuide } from '../components/image-api-guide'
import { IMAGE_MODELS, imageRequest } from '../image-models'

it('selects all five exact IDs and copies their bounded image requests', async () => {
  const user = userEvent.setup()
  render(<ImageApiGuide />)
  for (const model of IMAGE_MODELS) {
    const button = screen.getByRole('button', { name: model.name })
    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    const panel = screen.getByRole('tabpanel')
    const command = panel.querySelector('code')?.textContent ?? ''
    const body = JSON.parse(command.split("  -d '")[1].split("' \\\n")[0])
    expect(body).toEqual(imageRequest(model.modelId))
    expect(body.n).toBe(1)
    expect(body.stream).toBe(false)
    expect(body.size).toBe('1024x1024')
    expect(command).toContain('https://api.halsamer.io/v1/images/generations')
    expect(command).toContain('$HALSAMER_API_KEY')
    expect(command).not.toContain('chat/completions')
    await user.click(screen.getByRole('button', { name: 'Copy image example' }))
    expect(await navigator.clipboard.readText()).toBe(command)
  }
  await user.click(screen.getByRole('tab', { name: 'Python' }))
  const python =
    screen.getByRole('tabpanel').querySelector('code')?.textContent ?? ''
  expect(python).toContain('client.images.generate(')
  expect(python).toContain('max_retries=0')
  expect(python).toContain('base64.b64decode(encoded, validate=True)')
  await user.click(screen.getByRole('button', { name: 'Copy image example' }))
  expect(await navigator.clipboard.readText()).toBe(python)
  expect(
    screen.getByText(/Reference editing, 4K, streaming/)
  ).toHaveTextContent('have not been qualified')
  expect(screen.getByText(/All five image models cost/)).toHaveTextContent(
    'US$0.20 per image'
  )
  expect(screen.getByText(/The request total/)).toHaveTextContent(
    'US$0.20 multiplied by the billed image count'
  )
  expect(
    screen.queryByText(/all reported output tokens/)
  ).not.toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'OpenAI logo' })).toBeInTheDocument()
})

it('uses the image guide rather than chat or invented rate parameters in model details', () => {
  render(
    <ModelDetailsApi
      model={{ model_name: 'nano-banana-pro' } as PricingModel}
      endpointMap={{}}
    />
  )
  expect(
    screen.getByRole('heading', { name: 'Nano Banana Pro' })
  ).toBeInTheDocument()
  expect(screen.getByRole('tabpanel')).toHaveTextContent(
    '"model": "nano-banana-pro"'
  )
  expect(screen.queryByText('Rate limits')).not.toBeInTheDocument()
  expect(
    screen.queryByLabelText('Choose an image model')
  ).not.toBeInTheDocument()
})

it('rejects unknown and upstream-only names instead of generating incorrect examples', () => {
  expect(() => imageRequest('gemini-3-pro-image')).toThrow(
    'Unknown public image model'
  )
  const { container } = render(<ImageApiGuide modelId='unknown' />)
  expect(container).toBeEmptyDOMElement()
})
