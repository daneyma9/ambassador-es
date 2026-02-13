import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700">
          <h1 className="text-2xl font-bold text-white">Cuenta Suspendida</h1>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Tu cuenta ha sido suspendida. Si crees que esto es un error, contacta con el equipo de TaxDown.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Motivo:</strong> Violación de términos de servicio
              </p>
            </div>

            <a href="mailto:support@taxdown.es">
              <Button fullWidth variant="secondary">
                Contactar Soporte
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
