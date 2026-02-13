import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardNavbar } from '@/components/layout/dashboard-navbar'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'

export const metadata = {
  title: 'Dashboard - TaxDown Ambassador Portal',
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Check if user is suspended
  if ((session.user as any)?.status === 'SUSPENDED') {
    redirect('/auth/suspended')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar session={session} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
