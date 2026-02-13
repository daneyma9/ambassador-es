'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Form, FormGroup } from '@/components/ui/form'

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!formData.email.endsWith('@taxdown.es')) {
      newErrors.email = 'Solo se permiten emails de @taxdown.es'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every((err) => err === '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (!result?.ok) {
        setError(result?.error || 'Email o contraseña incorrectos')
        return
      }

      // Redirect to dashboard
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
      router.push(callbackUrl)
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700">
          <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Portal de Embajadores TaxDown
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          {error && <Alert type="error" title="Error">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="tu@taxdown.es"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </FormGroup>

            <FormGroup>
              <Input
                label="Contraseña"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
            </FormGroup>

            <Button type="submit" fullWidth loading={loading}>
              Iniciar Sesión
            </Button>

            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <a
                href="/auth/register"
                className="text-indigo-600 hover:underline font-medium"
              >
                Regístrate
              </a>
            </p>
          </Form>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Solo se permiten emails de @taxdown.es
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
