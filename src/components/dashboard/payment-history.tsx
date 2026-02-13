'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

interface PaymentRecord {
  id: string
  amount: number
  status: string
  submissionCount: number
  reference?: string
  createdAt: Date
  paidAt?: Date
}

interface PaymentHistoryProps {
  payments: PaymentRecord[]
  loading?: boolean
}

const statusConfig = {
  PENDING: { color: 'warning', label: '⏳ Pendiente' },
  PROCESSING: { color: 'primary', label: '🔄 Procesando' },
  COMPLETED: { color: 'success', label: '✓ Pagado' },
  FAILED: { color: 'danger', label: '✗ Error' },
  REJECTED: { color: 'danger', label: '✗ Rechazado' },
} as const

export function PaymentHistory({
  payments,
  loading = false,
}: PaymentHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-20 animate-pulse bg-gray-200">
            <div />
          </Card>
        ))}
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 text-lg">No hay pagos aún</p>
          <p className="text-gray-400 text-sm mt-2">
            Cuando tus entregas sean aprobadas, verás los pagos aquí
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const status = statusConfig[payment.status as keyof typeof statusConfig]
        return (
          <Card key={payment.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900">
                      Lote de Pago
                    </p>
                    <Badge variant={status.color as any}>
                      {status.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div>
                      <p className="text-gray-500">Entregas</p>
                      <p className="font-medium text-gray-900">
                        {payment.submissionCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Creado</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(new Date(payment.createdAt))}
                      </p>
                    </div>

                    {payment.paidAt && (
                      <div>
                        <p className="text-gray-500">Pagado</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(new Date(payment.paidAt))}
                        </p>
                      </div>
                    )}

                    {payment.reference && (
                      <div>
                        <p className="text-gray-500">Referencia</p>
                        <p className="font-mono text-xs text-gray-900">
                          {payment.reference.slice(0, 8)}...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {payment.status === 'COMPLETED' ? 'Transferido' : 'Por transferir'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
