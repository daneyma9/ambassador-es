'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Form, FormGroup } from '@/components/ui/form'
import { Opportunity } from '@/types'

interface SubmissionFormProps {
  opportunities: Opportunity[]
  opportunityId?: string
}

export function SubmissionForm({
  opportunities,
  opportunityId,
}: SubmissionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    redditUrl: '',
    opportunityId: opportunityId || '',
    description: '',
  })

  const [errors, setErrors] = useState({
    redditUrl: '',
    opportunityId: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors = {
      redditUrl: '',
      opportunityId: '',
    }

    // URL validation
    if (!formData.redditUrl) {
      newErrors.redditUrl = 'El URL de Reddit es requerido'
    } else if (!formData.redditUrl.includes('reddit.com')) {
      newErrors.redditUrl = 'Debe ser una URL de reddit.com'
    } else if (!formData.redditUrl.includes('/r/Spain')) {
      newErrors.redditUrl = 'Solo se permiten comentarios de r/Spain'
    } else if (
      !formData.redditUrl.includes('/comments/') &&
      !formData.redditUrl.includes('reddit.com/r')
    ) {
      newErrors.redditUrl = 'URL de post o comentario inválida'
    }

    // Opportunity validation
    if (!formData.opportunityId) {
      newErrors.opportunityId = 'Selecciona una oportunidad'
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
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redditUrl: formData.redditUrl,
          opportunityId: formData.opportunityId,
          description: formData.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.error ||
            'Error al enviar. Verifica los datos e intenta de nuevo.'
        )
        return
      }

      setSuccess(true)
      setFormData({ redditUrl: '', opportunityId: opportunityId || '', description: '' })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/submissions')
      }, 2000)
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700">
        <h2 className="text-xl font-bold text-white">
          Enviar Comentario para Aprobación
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          Comparte tu aporte y gana €5 si es aprobado
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        {error && <Alert type="error" title="Error">{error}</Alert>}
        {success && (
          <Alert type="success" title="¡Enviado!">
            Tu envío fue registrado. Redirigiendo...
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* URL de Reddit */}
          <FormGroup>
            <Input
              label="URL del Comentario en Reddit"
              type="url"
              name="redditUrl"
              placeholder="https://reddit.com/r/Spain/comments/xxxxx/..."
              value={formData.redditUrl}
              onChange={handleChange}
              error={errors.redditUrl}
              helperText="Copia el URL completo de tu comentario desde Reddit"
              required
            />
          </FormGroup>

          {/* Oportunidad */}
          <FormGroup>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oportunidad {opportunityId ? '✓' : ''}
            </label>
            <select
              name="opportunityId"
              value={formData.opportunityId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Selecciona una oportunidad...</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} - €{opp.reward}
                </option>
              ))}
            </select>
            {errors.opportunityId && (
              <p className="text-sm text-red-600 mt-1">{errors.opportunityId}</p>
            )}
          </FormGroup>

          {/* Descripción */}
          <FormGroup>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Comparte más contexto sobre tu comentario..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Máx. 500 caracteres
            </p>
          </FormGroup>

          {/* Info de validación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">
              ✓ Antes de enviar:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Tu comentario recomienda TaxDown</li>
              <li>✓ Es un comentario valioso para otros</li>
              <li>✓ Está en r/Spain</li>
              <li>✓ No es spam</li>
            </ul>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Enviar para Aprobación
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Tu envío será revisado por nuestro equipo dentro de 24 horas
          </p>
        </Form>
      </CardContent>
    </Card>
  )
}
