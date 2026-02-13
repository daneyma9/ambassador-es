import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PaymentProcessor } from '@/components/admin/payment-processor'
import { formatCurrency } from '@/lib/utils'

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  })

  // Only admins can access
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard')
  }

  // Get pending submissions grouped by ambassador
  const pendingSubmissions = await db.submission.findMany({
    where: { status: 'PAYMENT_PENDING' },
    include: { ambassador: true },
  })

  // Group by ambassador
  const paymentMap = new Map<string, any>()

  for (const submission of pendingSubmissions) {
    if (!paymentMap.has(submission.ambassadorId)) {
      paymentMap.set(submission.ambassadorId, {
        ambassadorId: submission.ambassadorId,
        ambassadorName: submission.ambassador.name,
        ambassadorEmail: submission.ambassador.email,
        amount: 0,
        submissionCount: 0,
        hasBankAccount: !!submission.ambassador.bankAccount,
      })
    }

    const batch = paymentMap.get(submission.ambassadorId)
    batch.amount += submission.amount
    batch.submissionCount += 1
  }

  const pendingPayments = Array.from(paymentMap.values())
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

  // Get recent processed payments
  const recentPayments = await db.paymentRecord.findMany({
    where: { status: 'COMPLETED' },
    include: { ambassador: true },
    orderBy: { paidAt: 'desc' },
    take: 10,
  })

  // Stats
  const allPayments = await db.paymentRecord.findMany()
  const completedPayments = allPayments.filter((p) => p.status === 'COMPLETED')
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
        <p className="text-gray-600 mt-2">
          Procesa pagos semanales a los embajadores
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">
                {pendingPayments.length}
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                {formatCurrency(totalPending)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Total Pagado</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {completedPayments.length} lotes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Embajadores</p>
              <p className="text-3xl font-bold text-indigo-600">
                {pendingPayments.length}
              </p>
              <p className="text-sm text-indigo-600 mt-1">
                con pagos pendientes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Sin Cuenta</p>
              <p className="text-3xl font-bold text-red-600">
                {
                  pendingPayments.filter((p) => !p.hasBankAccount)
                    .length
                }
              </p>
              <p className="text-sm text-red-600 mt-1">
                necesitan IBAN
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Processor */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Procesar Pagos
        </h2>
        <PaymentProcessor pendingPayments={pendingPayments} />
      </div>

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Pagos Recientes</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold">
                      Embajador
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Monto
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {payment.ambassador.name}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Pagado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
