import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubmissionsList } from '@/components/dashboard/submissions-list'

export default async function SubmissionsPage() {
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

  // Get user's submissions
  const submissions = await db.submission.findMany({
    where: { ambassadorId: user.id },
    include: { opportunity: true },
    orderBy: { submittedAt: 'desc' },
  })

  // Calculate stats
  const approved = submissions.filter((s) => s.status === 'APPROVED').length
  const pending = submissions.filter((s) => s.status === 'PENDING_REVIEW').length
  const rejected = submissions.filter((s) => s.status === 'REJECTED').length
  const totalEarned = submissions
    .filter((s) => s.status === 'PAID')
    .reduce((sum, s) => sum + s.amount, 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Entregas</h1>
          <p className="text-gray-600 mt-2">
            Historial completo de tus envíos y pagos
          </p>
        </div>
        <a href="/dashboard/submit">
          <Button size="lg">+ Nuevo Envío</Button>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Aprobadas</p>
              <p className="text-3xl font-bold text-green-600">{approved}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Rechazadas</p>
              <p className="text-3xl font-bold text-red-600">{rejected}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Total Ganado</p>
              <p className="text-2xl font-bold text-indigo-600">
                €{totalEarned.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Entregas ({submissions.length})
          </h2>
        </CardHeader>
        <CardContent>
          <SubmissionsList submissions={submissions as any} />
        </CardContent>
      </Card>
    </div>
  )
}
