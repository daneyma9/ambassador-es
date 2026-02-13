'use client'

import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface DashboardNavbarProps {
  session: Session | null
}

export function DashboardNavbar({ session }: DashboardNavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          TaxDown Ambassador Portal
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {session?.user?.name}
          </p>
          <p className="text-xs text-gray-500">{session?.user?.email}</p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        >
          Cerrar Sesión
        </Button>
      </div>
    </nav>
  )
}
