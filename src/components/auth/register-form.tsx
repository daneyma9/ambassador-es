'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Form, FormGroup } from '@/components/ui/form'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!formData.email.endsWith('@taxdown.es')) {
      newErrors.email = 'Solo se permiten emails de @taxdown.es'
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos una mayúscula'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos un número'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al registrarse')
        return
      }

      setSuccess(true)
      setFormData({ email: '', name: '', password: '', confirmPassword: '' })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700">
        <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
        <p className="text-indigo-100 text-sm mt-1">
          Únete a la red de embajadores de TaxDown
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        {error && <Alert type="error" title="Error">{error}</Alert>}
        {success && (
          <Alert type="success" title="¡Éxito!">
            Cuenta creada. Redirigiendo al login...
          </Alert>
        )}

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
              label="Nombre Completo"
              type="text"
              name="name"
              placeholder="Juan García"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
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
              helperText="Mín. 8 caracteres, 1 mayúscula, 1 número"
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="Confirmar Contraseña"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </FormGroup>

          <Button type="submit" fullWidth loading={loading}>
            Crear Cuenta
          </Button>

          <p className="text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <a href="/auth/signin" className="text-indigo-600 hover:underline font-medium">
              Inicia sesión
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
  )
}
