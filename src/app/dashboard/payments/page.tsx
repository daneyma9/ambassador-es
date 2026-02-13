import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BankAccountForm } from '@/components/dashboard/bank-account-form'
import { PaymentHistory } from '@/components/dashboard/payment-history'
import { formatCurrency } from '@/lib/utils'

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return <div>No autorizado</div>
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return <div>Usuario no encontrado</div>
  }

  // Get payment records
  const payments = await db.paymentRecord.findMany({
    where: { ambassadorId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  // Get pending amount (submissions that are PAYMENT_PENDING)
  const pendingSubmissions = await db.submission.findMany({
    where: {
      ambassadorId: user.id,
      status: 'PAYMENT_PENDING',
    },
  })

  const pendingAmount = pendingSubmissions.reduce((sum, s) => sum + s.amount, 0)

  // Calculate stats
  const completed = payments.filter((p) => p.status === 'COMPLETED')
  const totalPaid = completed.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu cuenta bancaria y visualiza tu historial de pagos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Total Ganado</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(user.totalEarnings)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Ya Pagado</p>
              <p className="text-3xl font-bold text-indigo-600">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Pendiente</p>
              <p className="text-3xl font-bold text-yellow-600">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Próximo Pago</p>
              <p className="text-sm font-medium text-gray-900">
                Cada Viernes
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {pendingAmount > 0 ? `${formatCurrency(pendingAmount)} 💰` : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank Account */}
        <div className="lg:col-span-1">
          <BankAccountForm
            currentIban={user.bankAccount || undefined}
            isVerified={user.bankAccountVerified}
          />
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">
                Historial de Pagos ({payments.length})
              </h2>
            </CardHeader>
            <CardContent>
              <PaymentHistory payments={payments as any} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            ℹ️ Cómo funciona el sistema de pagos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900 mb-2">1️⃣ Aprobación</p>
              <p>
                Tu comentario es aprobado por nuestro equipo. Se marca como
                «Pago Pendiente»
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-2">2️⃣ Lote Semanal</p>
              <p>
                Cada viernes, procesamos todos los pagos pendientes y los
                agrupamos en un lote
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-2">3️⃣ Transferencia</p>
              <p>
                El dinero llega a tu cuenta en 1-3 días hábiles según tu banco
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
