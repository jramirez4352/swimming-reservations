"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions/auth"

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/classes", label: "Clases" },
  { href: "/admin/reservations", label: "Reservas" },
  { href: "/admin/students", label: "Usuarios" },
  { href: "/admin/reports", label: "Reportes" },
  { href: "/admin/settings", label: "Configuración" },
]

export function AdminNav({ name }: { name?: string | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-lg font-bold text-cyan-400 shrink-0">
            🏊 Admin
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm transition-colors ${
                  pathname.startsWith(l.href) ? "text-cyan-300 font-medium" : "text-slate-300 hover:text-cyan-300"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop user area */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="text-sm text-slate-400 truncate max-w-[120px]">{name}</span>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit"
                className="text-slate-100 border-slate-500 bg-slate-700 hover:bg-slate-600 hover:text-white">
                Salir
              </Button>
            </form>
          </div>

          {/* Mobile/tablet hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-slate-300 hover:bg-slate-700 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-700 space-y-0.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(l.href)
                    ? "bg-slate-700 text-cyan-300"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-700 px-1">
              <span className="text-sm text-slate-400 truncate max-w-[180px]">{name}</span>
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit"
                  className="text-slate-100 border-slate-500 bg-slate-700 hover:bg-slate-600">
                  Salir
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
