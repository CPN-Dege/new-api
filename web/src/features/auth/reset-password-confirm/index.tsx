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
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { PasswordInput } from '@/components/password-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCountdown } from '@/hooks/use-countdown'
import { api } from '@/lib/api'
import { handleServerError } from '@/lib/handle-server-error'
import { accountPasswordSchema } from '@/lib/password-policy'
import { AuthOperationError } from '@/lib/secure-verification'
import { createServerError } from '@/lib/server-error-message'

import { AuthLayout } from '../auth-layout'

export type ResetPasswordSearchParams = {
  email?: string
  token?: string
}

const resetPasswordSchema = z
  .object({
    password: accountPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
type ResetPasswordConfirmProps = ResetPasswordSearchParams

export function ResetPasswordConfirm(props: ResetPasswordConfirmProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const {
    secondsLeft,
    isActive,
    start: startCountdown,
  } = useCountdown({ initialSeconds: 30 })
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const isValidResetLink = Boolean(props.email && props.token)

  async function handleSubmit(values: ResetPasswordValues) {
    if (!isValidResetLink || !props.email || !props.token) {
      toast.error(t('Invalid reset link, please request a new password reset'))
      return
    }

    startCountdown()
    setLoading(true)
    try {
      const res = await api.post(
        '/api/user/reset',
        {
          email: props.email,
          token: props.token,
          password: values.password,
          confirm_password: values.confirmPassword,
        },
        { skipBusinessError: true } as Record<string, unknown>
      )

      if (res?.data?.success) {
        form.reset()
        setCompleted(true)
        toast.success(t('Password reset successfully. Please sign in.'))
      } else {
        handleServerError(createServerError(res.data, t('Request failed')))
      }
    } catch (error) {
      handleServerError(AuthOperationError.from(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className='w-full space-y-8'>
        <div className='space-y-2'>
          <h2 className='text-center text-2xl font-semibold tracking-tight sm:text-left'>
            {t('Reset password')}
          </h2>
          <p className='text-muted-foreground text-left text-sm sm:text-base'>
            {completed
              ? t('Your password has been reset. Sign in with your new password.')
              : t('Choose a new password for your account.')}
          </p>
        </div>

        <div className='space-y-4'>
          {!isValidResetLink && (
            <Alert variant='destructive'>
              <AlertDescription>
                {t('Invalid reset link, please request a new password reset.')}
              </AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium'>
              {t('Email')}
            </label>
            <Input
              id='email'
              type='email'
              value={props.email || ''}
              disabled
              placeholder={t('Waiting for email...')}
            />
          </div>

          {!completed && (
            <Form {...form}>
              <form
                className='space-y-4'
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('New password')}</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete='new-password'
                          placeholder={t('Enter password (8–128 characters)')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Confirm password')}</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete='new-password'
                          placeholder={t('Confirm password')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full'
                  disabled={loading || isActive || !isValidResetLink}
                >
                  {isActive
                    ? t('Try again in {{seconds}}s', { seconds: secondsLeft })
                    : t('Reset password')}
                </Button>
              </form>
            </Form>
          )}

          <Button
            variant={completed ? 'default' : 'link'}
            className='w-full'
            onClick={() => navigate({ to: '/sign-in', replace: true })}
          >
            {t('Back to login')}
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
