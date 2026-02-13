'use client'

import { Submission } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface SubmissionsListProps {
  submissions: (Submission & { opportunity: any })[]
  loading?: boolean
}

const statusConfig = {
  PENDING_REVIEW: { color: 'warning', label: '⏳ En Revisión' },
  APPROVED: { color: 'success', label: '✓ Aprobado' },
  REJECTED: { color: 'danger', label: '✗ Rechazado' },
  PAYMENT_PENDING: { color: 'primary', label: '💰 Pendiente Pago' },
  PAID: { color: 'success', label: '✓ Pagado' },
} as const

export function SubmissionsList({
  submissions,
  loading = false,
}: SubmissionsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-24 animate-pulse bg-gray-200">
            <div />
          </Card>
        ))}
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 text-lg">No hay entregas aún</p>
          <p className="text-gray-400 text-sm mt-2">
            Comienza a colaborar en oportunidades
          </p>
          <Link
            href="/dashboard/opportunities"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Ver Oportunidades
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const status = statusConfig[submission.status as keyof typeof statusConfig]
        return (
          <Card key={submission.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {submission.opportunity.title}
                    </h3>
                    <Badge variant={status.color as any}>
                      {status.label}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {submission.opportunity?.description || 'Sin descripción'}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📝 {formatDate(new Date(submission.submittedAt))}</span>
                    <span>🔗 Reddit URL</span>
                    {submission.reviewedAt && (
                      <span>
                        ✓ Revisado {formatDate(new Date(submission.reviewedAt))}
                      </span>
                    )}
                  </div>

                  {submission.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <strong>Razón del rechazo:</strong> {submission.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(submission.amount)}
                  </p>
                  <p className="text-xs text-gray-500">Si se aprueba</p>

                  <a
                    href={submission.redditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  >
                    Ver en Reddit →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
