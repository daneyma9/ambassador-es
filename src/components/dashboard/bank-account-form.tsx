'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Form, FormGroup } from '@/components/ui/form'
import { maskIban } from '@/lib/utils'

interface BankAccountFormProps {
  currentIban?: string
  isVerified?: boolean
  onUpdate?: () => void
}

export function BankAccountForm({
  currentIban,
  isVerified = false,
  onUpdate,
}: BankAccountFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [iban, setIban] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!iban) {
      setError('El IBAN es requerido')
      return
    }

    // Basic IBAN validation
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(iban)) {
      setError('IBAN inválido. Formato: ES91 1234 5678 9012 3456 7890')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/ambassadors/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccount: iban }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al guardar')
        return
      }

      setSuccess(true)
      setIban('')
      onUpdate?.()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700">
        <h3 className="text-lg font-bold text-white">Cuenta Bancaria</h3>
        <p className="text-green-100 text-sm mt-1">
          Donde recibirás los pagos
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        {error && <Alert type="error" title="Error">{error}</Alert>}
        {success && (
          <Alert type="success" title="✓ Guardado">
            Tu cuenta bancaria fue actualizada correctamente
          </Alert>
        )}

        {currentIban && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">IBAN Registrado</p>
            <p className="text-2xl font-mono font-bold text-blue-900">
              {maskIban(currentIban)}
            </p>
            {isVerified && (
              <p className="text-xs text-green-600 mt-2">✓ Verificado</p>
            )}
            {!isVerified && (
              <p className="text-xs text-yellow-600 mt-2">
                ⏳ Pendiente de verificación
              </p>
            )}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              label="IBAN (Número de Cuenta)"
              type="text"
              placeholder="ES91 1234 5678 9012 3456 7890"
              value={iban}
              onChange={(e) => setIban(e.target.value.toUpperCase())}
              helperText="Sin espacios: ES911234567890123456789"
              required
            />
          </FormGroup>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
            <p className="font-semibold mb-2">ℹ️ ¿Qué es IBAN?</p>
            <p>
              Es el número único de tu cuenta bancaria internacional. Lo
              necesitamos para transferirte el dinero semanalmente.
            </p>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            {currentIban ? 'Actualizar IBAN' : 'Guardar IBAN'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  )
}
