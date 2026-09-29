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
import { describe, expect, it, vi } from 'vitest'

import { api } from '@/lib/api'

import { register } from '../../api'
import { registerFormSchema } from '../../constants'

describe('Halsamer registration contract', () => {
  it('requires a valid email and E.164 mobile number', () => {
    expect(
      registerFormSchema.safeParse({
        username: 'alice',
        email: 'alice@example.com',
        mobile: '+628123456789',
        password: 'password123',
        confirmPassword: 'password123',
      }).success
    ).toBe(true)

    expect(
      registerFormSchema.safeParse({
        username: 'alice',
        email: '',
        mobile: '+628123456789',
        password: 'password123',
        confirmPassword: 'password123',
      }).success
    ).toBe(false)

    expect(
      registerFormSchema.safeParse({
        username: 'alice',
        email: 'alice@example.com',
        mobile: '08123456789',
        password: 'password123',
        confirmPassword: 'password123',
      }).success
    ).toBe(false)
  })

  it('sends email and mobile without a pre-registration verification code', async () => {
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { success: true } })

    await register({
      username: 'alice',
      email: 'alice@example.com',
      mobile: '+628123456789',
      password: 'password123',
    })

    expect(api.post).toHaveBeenCalledWith(
      '/api/user/register',
      {
        username: 'alice',
        email: 'alice@example.com',
        mobile: '+628123456789',
        password: 'password123',
      },
      { params: { turnstile: '' } }
    )
  })
})
