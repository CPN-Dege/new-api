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
import { describe, expect, it, vi } from 'vitest'

import { api } from '@/lib/api'

import { ResetPasswordConfirm } from '..'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: { seconds?: number }) =>
      values?.seconds === undefined
        ? key
        : key.replace('{{seconds}}', String(values.seconds)),
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/hooks/use-countdown', () => ({
  useCountdown: () => ({
    secondsLeft: 0,
    isActive: false,
    start: vi.fn(),
  }),
}))

vi.mock('../../auth-layout', () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Halsamer password reset form', () => {
  it('submits the user-chosen password and never displays a generated password', async () => {
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { success: true } })
    const user = userEvent.setup()

    render(
      <ResetPasswordConfirm
        email='alice@example.com'
        token='single-use-token'
      />
    )

    await user.type(screen.getByLabelText('New password'), 'new-password-123')
    await user.type(
      screen.getByLabelText('Confirm password'),
      'new-password-123'
    )
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(api.post).toHaveBeenCalledWith(
      '/api/user/reset',
      {
        email: 'alice@example.com',
        token: 'single-use-token',
        password: 'new-password-123',
        confirm_password: 'new-password-123',
      },
      { skipBusinessError: true }
    )
    expect(
      await screen.findByText(
        'Your password has been reset. Sign in with your new password.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByDisplayValue('new-password-123')).not.toBeInTheDocument()
  })
})
