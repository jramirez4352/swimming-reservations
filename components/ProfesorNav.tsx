"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions/auth"

const links = [
  { href: "/profesor/dashboard", label: "Inicio" },
  { href: "/profesor/classes", label: "Mis Clases" },
  { href: "/profesor/students", label: "Mis Alumnos" },
  { href: "/profesor/messages", label: "Mensajes" },
]

export function ProfesorNav({ name }: { name?: string | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-emerald-700 text-white">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/profesor/dashboard" className="text-lg font-bold text-emerald-100 shrink-0">
            🏊 Profesor
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm transition-colors ${
                  pathname.startsWith(l.href) ? "text-white font-semibold" : "text-emerald-200 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-emerald-300 truncate max-w-[120px]">{name}</span>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit"
                className="text-white border-emerald-500 bg-emerald-600 hover:bg-emerald-500">
                Salir
              </Button>
            </form>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-emerald-200 hover:bg-emerald-600 transition-colors"
            onClick={() => setOpen(!open)}
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

        {open && (
          <div className="md:hidden mt-3 pt-3 border-t border-emerald-600 space-y-0.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(l.href)
                    ? "bg-emerald-600 text-white"
                    : "text-emerald-200 hover:bg-emerald-600 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-emerald-600 px-1">
              <span className="text-sm text-emerald-300 truncate max-w-[180px]">{name}</span>
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit"
                  className="text-white border-emerald-500 bg-emerald-600 hover:bg-emerald-500">
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
