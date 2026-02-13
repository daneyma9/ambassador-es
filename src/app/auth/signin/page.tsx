'use client'

import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/signin-form'

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <SignInForm />
    </Suspense>
  )
}

