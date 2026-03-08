'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { newsletterSubscriptionSchema, type NewsletterSubscriptionData } from '@/lib/validations/newsletter'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterSubscriptionData>({
    resolver: zodResolver(newsletterSubscriptionSchema),
  })

  const onSubmit = async (data: NewsletterSubscriptionData) => {
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Something went wrong')
      }

      setStatus('success')
      reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-xs text-green-600 dark:text-green-400">
        Thanks for subscribing!
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1.5">
      <p className="text-xs font-medium text-foreground">Stay updated</p>
      <Input
        {...register('name')}
        placeholder="Your name"
        className="h-7 text-xs"
        aria-label="Name"
      />
      {errors.name && (
        <p className="text-[10px] text-red-500">{errors.name.message}</p>
      )}
      <Input
        {...register('email')}
        type="email"
        placeholder="Your email"
        className="h-7 text-xs"
        aria-label="Email"
      />
      {errors.email && (
        <p className="text-[10px] text-red-500">{errors.email.message}</p>
      )}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="w-full h-7 text-xs"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          'Subscribe'
        )}
      </Button>
      {status === 'error' && (
        <p className="text-[10px] text-red-500">{errorMessage}</p>
      )}
    </form>
  )
}
