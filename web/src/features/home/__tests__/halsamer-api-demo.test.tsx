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

import { HeroTerminalDemo } from '../components/hero-terminal-demo'

it('shows Halsamer endpoints and usable authentication examples for every protocol', async () => {
  const user = userEvent.setup()
  const { container } = render(<HeroTerminalDemo />)
  for (const [label, path] of [
    ['Chat', '/v1/chat/completions'],
    ['Responses', '/v1/responses'],
    ['Claude', '/v1/messages'],
    ['Gemini', '/v1beta/models/gpt-6.1-sol:generateContent'],
  ]) {
    await user.click(screen.getByRole('tab', { name: label }))
    expect(
      await screen.findAllByText(`https://api.halsamer.io${path}`, {
        exact: false,
      })
    ).not.toHaveLength(0)
    expect(container.textContent).toContain('Content-Type: application/json')
    expect(container.textContent).toContain('HALSAMER_API_KEY')
    expect(container.textContent).not.toContain('your-model')
    const command =
      screen.getByRole('tabpanel').querySelector('code')?.textContent ?? ''
    expect(command).toContain(' \\\n  -H')
    expect(command).toContain('$HALSAMER_API_KEY')
    const jsonBody = command.split("  -d '")[1].slice(0, -1)
    expect(() => JSON.parse(jsonBody)).not.toThrow()
    await user.click(
      screen.getByRole('button', { name: 'Copy request example' })
    )
    expect(await navigator.clipboard.readText()).toBe(command)
  }
  expect(container.textContent).toContain('Illustrative example')
  expect(container.textContent).not.toContain('$0.000')
})
