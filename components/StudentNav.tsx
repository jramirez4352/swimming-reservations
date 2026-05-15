"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions/auth"

const links = [
  { href: "/classes", label: "Clases" },
  { href: "/dashboard", label: "Mis Reservas" },
  { href: "/history", label: "Historial" },
  { href: "/profile", label: "Mi Perfil" },
]

export function StudentNav({ name }: { name?: string | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-blue-600 shrink-0">
            🏊 AquaReservas
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === l.href ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop user area */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-muted-foreground truncate max-w-[120px]">{name}</span>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">Salir</Button>
            </form>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
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
          <div className="md:hidden mt-3 pt-3 border-t space-y-0.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-3 mt-2 border-t px-1">
              <span className="text-sm text-muted-foreground truncate max-w-[180px]">{name}</span>
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">Salir</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
