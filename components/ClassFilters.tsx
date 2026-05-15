"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"

const DAYS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

interface Props {
  instructors: string[]
}

export function ClassFilters({ instructors }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const currentView = searchParams.get("view") ?? "grid"

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <Input
        placeholder="Buscar clase..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => update("q", e.target.value)}
        className="w-56"
      />
      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        defaultValue={searchParams.get("instructor") ?? ""}
        onChange={(e) => update("instructor", e.target.value)}
      >
        <option value="">Todos los instructores</option>
        {instructors.map((i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        defaultValue={searchParams.get("day") ?? ""}
        onChange={(e) => update("day", e.target.value)}
      >
        <option value="">Cualquier día</option>
        {DAYS.slice(1).map((d, i) => (
          <option key={d} value={String(i + 1)}>{d}</option>
        ))}
      </select>

      {/* View toggle */}
      <div className="ml-auto flex items-center rounded-lg border border-input overflow-hidden">
        <button
          onClick={() => update("view", "grid")}
          className={`px-3 h-8 text-sm flex items-center gap-1.5 transition-colors ${
            currentView === "grid"
              ? "bg-slate-800 text-white"
              : "bg-transparent text-slate-600 hover:bg-slate-50"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
            <rect x="1" y="1" width="6" height="6" rx="1"/>
            <rect x="9" y="1" width="6" height="6" rx="1"/>
            <rect x="1" y="9" width="6" height="6" rx="1"/>
            <rect x="9" y="9" width="6" height="6" rx="1"/>
          </svg>
          Tarjetas
        </button>
        <button
          onClick={() => update("view", "calendar")}
          className={`px-3 h-8 text-sm flex items-center gap-1.5 border-l border-input transition-colors ${
            currentView === "calendar"
              ? "bg-slate-800 text-white"
              : "bg-transparent text-slate-600 hover:bg-slate-50"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16">
            <rect x="1.5" y="2.5" width="13" height="12" rx="1"/>
            <path d="M1.5 6h13M5 1v3M11 1v3"/>
          </svg>
          Calendario
        </button>
      </div>
    </div>
  )
}
