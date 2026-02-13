import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return <div>No autorizado</div>
  }

  // Get user data
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      submissions: {
        where: { status: 'APPROVED' },
      },
    },
  })

  if (!user) {
    return <div>Usuario no encontrado</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Bienvenido, {user.name}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Ganancia Total</p>
              <p className="text-3xl font-bold text-indigo-600">
                {formatCurrency(user.totalEarnings)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Entregas Aprobadas</p>
              <p className="text-3xl font-bold text-green-600">
                {user.approvedSubmissions}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Entregas Rechazadas</p>
              <p className="text-3xl font-bold text-red-600">
                {user.rejectedSubmissions}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Total Comentarios</p>
              <p className="text-3xl font-bold text-blue-600">
                {user.totalComments}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Acciones Rápidas</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/opportunities"
              className="p-4 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition text-center"
            >
              <p className="font-medium text-indigo-600">Ver Oportunidades</p>
              <p className="text-sm text-gray-600">Colaboraciones disponibles</p>
            </a>

            <a
              href="/dashboard/submissions"
              className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition text-center"
            >
              <p className="font-medium text-green-600">Mis Entregas</p>
              <p className="text-sm text-gray-600">Historial de envíos</p>
            </a>

            <a
              href="/dashboard/payments"
              className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition text-center"
            >
              <p className="font-medium text-blue-600">Pagos</p>
              <p className="text-sm text-gray-600">Historial de pagos</p>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Status Badge */}
      <div className="mt-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-2">Estado de la Cuenta</p>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : user.status === 'PENDING_VERIFICATION'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {user.status === 'APPROVED'
                  ? '✓ Aprobado'
                  : user.status === 'PENDING_VERIFICATION'
                    ? '⏳ Pendiente de verificación'
                    : user.status}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
