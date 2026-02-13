'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PaymentBatch {
  ambassadorId: string
  ambassadorName: string
  ambassadorEmail: string
  amount: number
  submissionCount: number
  hasBankAccount: boolean
}

interface PaymentProcessorProps {
  pendingPayments: PaymentBatch[]
  onProcess?: () => void
}

export function PaymentProcessor({
  pendingPayments,
  onProcess,
}: PaymentProcessorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedAmbassadors, setSelectedAmbassadors] = useState<Set<string>>(
    new Set()
  )

  const totalAmount = Array.from(selectedAmbassadors).reduce((sum, id) => {
    const payment = pendingPayments.find((p) => p.ambassadorId === id)
    return sum + (payment?.amount || 0)
  }, 0)

  const toggleAmbassador = (ambassadorId: string) => {
    const newSelected = new Set(selectedAmbassadors)
    if (newSelected.has(ambassadorId)) {
      newSelected.delete(ambassadorId)
    } else {
      newSelected.add(ambassadorId)
    }
    setSelectedAmbassadors(newSelected)
  }

  const selectAll = () => {
    if (selectedAmbassadors.size === pendingPayments.length) {
      setSelectedAmbassadors(new Set())
    } else {
      setSelectedAmbassadors(new Set(pendingPayments.map((p) => p.ambassadorId)))
    }
  }

  const handleProcess = async () => {
    if (selectedAmbassadors.size === 0) {
      setError('Selecciona al menos un embajador')
      return
    }

    // Check if all selected have bank accounts
    const withoutBankAccount = Array.from(selectedAmbassadors).filter((id) => {
      const payment = pendingPayments.find((p) => p.ambassadorId === id)
      return !payment?.hasBankAccount
    })

    if (withoutBankAccount.length > 0) {
      setError(
        `${withoutBankAccount.length} embajador(es) no tiene(n) cuenta bancaria`
      )
      return
    }

    if (
      !window.confirm(
        `¿Procesar pago de ${formatCurrency(totalAmount)} a ${selectedAmbassadors.size} embajador(es)?`
      )
    ) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambassadorIds: Array.from(selectedAmbassadors),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al procesar pagos')
        return
      }

      setSuccess(true)
      setSelectedAmbassadors(new Set())
      onProcess?.()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (pendingPayments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay pagos pendientes en este momento
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && <Alert type="error" title="Error">{error}</Alert>}
      {success && (
        <Alert type="success" title="✓ Éxito">
          Pagos procesados correctamente
        </Alert>
      )}

      <Card>
        <CardHeader className="flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold">Pagos Pendientes ({pendingPayments.length})</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={selectAll}
          >
            {selectedAmbassadors.size === pendingPayments.length
              ? 'Deseleccionar Todos'
              : 'Seleccionar Todos'}
          </Button>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={
                        pendingPayments.length > 0 &&
                        selectedAmbassadors.size === pendingPayments.length
                      }
                      onChange={selectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Embajador
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Email
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">
                    Entregas
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((payment) => (
                  <tr
                    key={payment.ambassadorId}
                    className={`border-b border-gray-100 ${
                      selectedAmbassadors.has(payment.ambassadorId)
                        ? 'bg-indigo-50'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        disabled={!payment.hasBankAccount}
                        checked={selectedAmbassadors.has(
                          payment.ambassadorId
                        )}
                        onChange={() => toggleAmbassador(payment.ambassadorId)}
                      />
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {payment.ambassadorName}
                      {!payment.hasBankAccount && (
                        <p className="text-xs text-red-600">⚠️ Sin IBAN</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {payment.ambassadorEmail}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900">
                      {payment.submissionCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-green-50 border-2 border-green-200">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total a Pagar</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {selectedAmbassadors.size} embajador(es) seleccionado(s)
              </p>
            </div>

            <Button
              onClick={handleProcess}
              loading={loading}
              disabled={selectedAmbassadors.size === 0}
              size="lg"
            >
              💰 Procesar Pagos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
