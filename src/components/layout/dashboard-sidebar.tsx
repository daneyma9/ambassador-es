'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/opportunities', label: 'Oportunidades', icon: '💼' },
  { href: '/dashboard/reddit-tracker', label: 'Reddit', icon: '🔍' },
  { href: '/dashboard/submissions', label: 'Mis Entregas', icon: '📝' },
  { href: '/dashboard/payments', label: 'Pagos', icon: '💰' },
  { href: '/dashboard/profile', label: 'Perfil', icon: '👤' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 overflow-y-auto hidden md:block">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">TaxDown</h2>
        <p className="text-xs text-gray-400 mt-1">Ambassador Portal</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-4">ADMIN</p>
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <span>⚙️</span>
          <span>Panel Admin</span>
        </Link>
      </div>
    </aside>
  )
}
