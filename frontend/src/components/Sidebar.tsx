'use client'

/**
 * Componente Sidebar reutilizable para todos los dashboards.
 * Soporta modo responsive con menú hamburguesa en mobile.
 */

import Link from 'next/link'
import { useState } from 'react'

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
  const [isOpen, setIsOpen] = useState(false)

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between mb-6">
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
        {/* Close button mobile */}
        <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400">
          ✕
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onNavChange(item.id)
              setIsOpen(false)
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-left transition-all ${
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
      <div className="border-t border-gray-100 pt-4 px-2 mt-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
            {userName?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-sm text-gray-400 capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-xs text-gray-400 hover:text-gray-600 text-left px-1"
        >
          Cerrar sesión →
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-white flex-col py-6 px-5 gap-6 min-h-screen border-r border-gray-100 flex-shrink-0 sticky top-0">
        {content}
      </aside>

      {/* Header Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <span style={{ fontFamily: 'var(--font-heading, sans-serif)' }} className="font-bold text-gray-900">
            Inspira
          </span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-lg"
        >
          ☰
        </button>
      </header>

      {/* Sidebar Mobile Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <aside className="w-64 bg-white h-full p-6 shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}

