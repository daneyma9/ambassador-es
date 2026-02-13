import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface OpportunityDetailPageProps {
  params: {
    id: string
  }
}

export default async function OpportunityDetailPage({
  params,
}: OpportunityDetailPageProps) {
  const opportunity = await db.opportunity.findUnique({
    where: { id: params.id },
  })

  if (!opportunity) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <a
          href="/dashboard/opportunities"
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          ← Volver a Oportunidades
        </a>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {opportunity.title}
              </h1>
              <p className="text-gray-600 mt-2">{opportunity.description}</p>
            </div>
            <Badge
              variant={opportunity.status === 'ACTIVE' ? 'success' : 'default'}
            >
              {opportunity.status === 'ACTIVE' ? 'Activa' : 'Pausada'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-gray-600 text-sm mb-1">Recompensa por comentario</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(opportunity.reward)}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm mb-1">Categoría</p>
              <p className="text-xl font-semibold text-gray-900">
                {opportunity.category}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm mb-1">Estado</p>
              <p className="text-xl font-semibold text-gray-900">
                {opportunity.currentRedemptions} / {opportunity.maxRedemptions === -1 ? '∞' : opportunity.maxRedemptions}
              </p>
            </div>
          </div>

          {opportunity.context && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Contexto
              </h3>
              <p className="text-gray-700">{opportunity.context}</p>
            </div>
          )}

          {opportunity.suggestedText && (
            <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2">
                Ejemplo de Texto
              </h3>
              <p className="text-indigo-800 text-sm">{opportunity.suggestedText}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">Instrucciones</h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Comenta en Reddit (r/Spain) con tu aporte sobre este tema</li>
              <li>Asegúrate de recomendar TaxDown de forma natural</li>
              <li>Copia el URL del comentario</li>
              <li>Sube una captura de pantalla</li>
              <li>Envía para aprobación</li>
            </ol>
          </div>

          <Button fullWidth size="lg">
            Crear Comentario sobre esto →
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
