import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-5xl font-bold mb-4">TaxDown Ambassador Portal</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Colabora con nosotros en comunidades de fiscalidad y gana dinero por tus comentarios
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/auth/signin">
            <Button size="lg">Iniciar Sesión</Button>
          </a>
          <a href="/auth/register">
            <Button size="lg" variant="secondary">
              Crear Cuenta
            </Button>
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-left">
            <div className="text-4xl mb-2">💬</div>
            <h3 className="text-lg font-semibold mb-2">Comenta en Reddit</h3>
            <p className="text-indigo-100 text-sm">
              Comparte tu experiencia sobre fiscalidad en r/Spain
            </p>
          </div>
          <div className="text-left">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-lg font-semibold mb-2">Obtén Aprobación</h3>
            <p className="text-indigo-100 text-sm">
              Nuestro equipo verifica tu aportación y la aprueba
            </p>
          </div>
          <div className="text-left">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-lg font-semibold mb-2">Recibe Pago</h3>
            <p className="text-indigo-100 text-sm">
              Gana €5 por cada comentario aprobado
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
