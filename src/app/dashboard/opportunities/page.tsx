import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { OpportunitiesList } from '@/components/dashboard/opportunities-list'

export default async function OpportunitiesPage() {
  const opportunities = await db.opportunity.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Oportunidades</h1>
        <p className="text-gray-600 mt-2">
          Selecciona una oportunidad para colaborar y ganar dinero
        </p>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Buscar oportunidades..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todas las categorías</option>
                <option value="fiscal">Fiscalidad</option>
                <option value="impuestos">Impuestos</option>
                <option value="empresa">Empresa</option>
                <option value="otros">Otros</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <OpportunitiesList opportunities={opportunities} />
    </div>
  )
}
