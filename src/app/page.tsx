export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">TaxDown Ambassador Portal</h1>
        <p className="text-xl mb-8">Colabora con nosotros y gana dinero</p>
        <a href="/auth/signin" className="btn btn-primary text-lg">
          Iniciar Sesión
        </a>
      </div>
    </main>
  )
}
