import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { SubmissionReview } from '@/components/admin/submission-review'

export default async function AdminSubmissionsPage() {
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

  // Get pending submissions
  const pendingSubmissions = await db.submission.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      ambassador: true,
      opportunity: true,
    },
    orderBy: { submittedAt: 'asc' },
  })

  // Get stats
  const allSubmissions = await db.submission.findMany({
    include: { opportunity: true },
  })

  const approved = allSubmissions.filter((s) => s.status === 'APPROVED').length
  const rejected = allSubmissions.filter((s) => s.status === 'REJECTED').length
  const paid = allSubmissions.filter((s) => s.status === 'PAID').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Revisar Entregas</h1>
        <p className="text-gray-600 mt-2">
          Aprueba o rechaza las entregas de los embajadores
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">
                {pendingSubmissions.length}
              </p>
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
              <p className="text-gray-600 text-sm mb-1">Pagadas</p>
              <p className="text-3xl font-bold text-indigo-600">{paid}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Panel */}
      <SubmissionReview submissions={pendingSubmissions as any} />
    </div>
  )
}
