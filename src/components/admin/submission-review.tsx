'use client'

import { useState } from 'react'
import { Submission } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { formatDate, formatCurrency } from '@/lib/utils'

interface SubmissionReviewProps {
  submissions: (Submission & { ambassador: any; opportunity: any })[]
  onReview?: () => void
}

export function SubmissionReview({
  submissions,
  onReview,
}: SubmissionReviewProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(
    submissions[0] || null
  )
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleApprove = async (submissionId: string) => {
    if (!window.confirm('¿Aprobar este envío?')) return

    setLoading(true)
    setReviewingId(submissionId)

    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/approve`,
        { method: 'PATCH' }
      )

      if (!response.ok) throw new Error('Error al aprobar')

      setMessage({ type: 'success', text: '✓ Envío aprobado' })
      onReview?.()
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al aprobar el envío',
      })
    } finally {
      setLoading(false)
      setReviewingId(null)
    }
  }

  const handleReject = async (submissionId: string) => {
    if (!rejectReason.trim()) {
      setMessage({
        type: 'error',
        text: 'Debes ingresar una razón de rechazo',
      })
      return
    }

    if (!window.confirm('¿Rechazar este envío?')) return

    setLoading(true)
    setReviewingId(submissionId)

    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/reject`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectReason }),
        }
      )

      if (!response.ok) throw new Error('Error al rechazar')

      setMessage({ type: 'success', text: '✓ Envío rechazado' })
      setRejectReason('')
      onReview?.()
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al rechazar el envío',
      })
    } finally {
      setLoading(false)
      setReviewingId(null)
    }
  }

  if (!selectedSubmission) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 text-lg">No hay entregas pendientes</p>
          <p className="text-gray-400 text-sm mt-2">
            Todas las entregas han sido revisadas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Pendientes de Revisión</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    selectedSubmission.id === sub.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {sub.ambassador.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sub.opportunity.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(new Date(sub.submittedAt))}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Panel */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700">
            <h3 className="text-lg font-bold text-white">Revisar Envío</h3>
          </CardHeader>

          <CardContent className="pt-6">
            {message && (
              <Alert
                type={message.type}
                title={message.type === 'success' ? 'Éxito' : 'Error'}
              >
                {message.text}
              </Alert>
            )}

            {/* Submission Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-600">Embajador</label>
                <p className="font-semibold text-gray-900">
                  {selectedSubmission.ambassador.name}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-semibold text-gray-900">
                  {selectedSubmission.ambassador.email}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Oportunidad</label>
                <p className="font-semibold text-gray-900">
                  {selectedSubmission.opportunity.title}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Recompensa</label>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedSubmission.amount)}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600">URL de Reddit</label>
                <a
                  href={selectedSubmission.redditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 break-all"
                >
                  Abrir en Reddit →
                </a>
              </div>

              {selectedSubmission.description && (
                <div>
                  <label className="text-sm text-gray-600">Descripción</label>
                  <p className="text-gray-900">{selectedSubmission.description}</p>
                </div>
              )}
            </div>

            {/* Reject Reason */}
            <div className="mb-6">
              <label className="text-sm text-gray-600 block mb-2">
                Razón de Rechazo (si aplica)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: El comentario no recomienda TaxDown..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleApprove(selectedSubmission.id)}
                loading={loading && reviewingId === selectedSubmission.id}
                className="flex-1"
              >
                ✓ Aprobar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleReject(selectedSubmission.id)}
                loading={loading && reviewingId === selectedSubmission.id}
                className="flex-1"
              >
                ✗ Rechazar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
