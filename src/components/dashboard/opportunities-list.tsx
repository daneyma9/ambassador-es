'use client'

import { Opportunity } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface OpportunitiesListProps {
  opportunities: Opportunity[]
  loading?: boolean
}

export function OpportunitiesList({
  opportunities,
  loading = false,
}: OpportunitiesListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-32 animate-pulse bg-gray-200">
            <div />
          </Card>
        ))}
      </div>
    )
  }

  if (opportunities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay oportunidades disponibles por el momento
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Vuelve pronto para ver nuevas colaboraciones
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {opportunities.map((opp) => (
        <Card key={opp.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {opp.title}
                  </h3>
                  <Badge variant={opp.status === 'ACTIVE' ? 'success' : 'default'}>
                    {opp.status === 'ACTIVE' ? 'Activa' : 'Pausada'}
                  </Badge>
                </div>

                <p className="text-gray-600 text-sm mb-4">{opp.description}</p>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Categoría:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {opp.category}
                    </span>
                  </div>

                  {opp.reward && (
                    <div>
                      <span className="text-gray-500">Recompensa:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {formatCurrency(opp.reward)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                href={`/dashboard/opportunities/${opp.id}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Ver Detalles
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
