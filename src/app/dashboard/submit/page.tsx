import { db } from '@/lib/db'
import { SubmissionForm } from '@/components/dashboard/submission-form'

export default async function SubmitPage() {
  const opportunities = await db.opportunity.findMany({
    where: { status: 'ACTIVE' },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Enviar Comentario</h1>
        <p className="text-gray-600 mt-2">
          Comparte un comentario valioso sobre las oportunidades activas
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <SubmissionForm opportunities={opportunities} />
      </div>
    </div>
  )
}
