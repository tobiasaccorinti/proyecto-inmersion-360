'use client'

/**
 * Componente Sidebar reutilizable para todos los dashboards.
 * Recibe los nav items, el nombre del usuario y el rol.
 */

import Link from 'next/link'

export interface NavItem {
  id: string
  label: string
  icon: string
}

interface SidebarProps {
  navItems: NavItem[]
  activeNav: string
  onNavChange: (id: string) => void
  userName: string
  userRole: string
  onLogout: () => void
}

export function Sidebar({ navItems, activeNav, onNavChange, userName, userRole, onLogout }: SidebarProps) {
  return (
    <aside className="w-56 bg-white flex flex-col py-6 px-4 gap-6 min-h-screen border-r border-gray-100 flex-shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">I</span>
        </div>
        <span
          style={{ fontFamily: 'var(--font-heading, sans-serif)' }}
          className="font-bold text-gray-900"
        >
          Inspira
        </span>
      </Link>

      {/* Navegación */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
              activeNav === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Usuario */}
      <div className="border-t border-gray-100 pt-4 px-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
            {userName?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-xs text-gray-400 capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-xs text-gray-400 hover:text-gray-600 text-left px-1"
        >
          Cerrar sesión →
        </button>
      </div>
    </aside>
  )
}
