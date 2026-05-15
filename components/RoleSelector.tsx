"use client"

import { useState } from "react"
import { changeUserRole } from "@/lib/actions/admin-users"

interface Props {
  userId: string
  currentRole: string
}

const ROLES = [
  { value: "STUDENT",  label: "Alumno",  labelShort: "Alumno",  active: "bg-blue-600 text-white" },
  { value: "PROFESOR", label: "Profesor", labelShort: "Profesor", active: "bg-emerald-600 text-white" },
  { value: "ADMIN",    label: "Admin",    labelShort: "Admin",    active: "bg-slate-800 text-white" },
]

export function RoleSelector({ userId, currentRole }: Props) {
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  async function handleChange(newRole: string) {
    if (newRole === role) return
    const label = ROLES.find(r => r.value === newRole)?.label ?? newRole
    if (!confirm(`¿Cambiar rol a ${label}?`)) return
    setLoading(true)
    await changeUserRole(userId, newRole)
    setRole(newRole)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground shrink-0">Rol:</span>
      <div className="flex rounded-md border overflow-hidden shrink-0">
        {ROLES.map((r, i) => (
          <button
            key={r.value}
            onClick={() => handleChange(r.value)}
            disabled={loading}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${i > 0 ? "border-l" : ""} ${
              role === r.value ? r.active : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {r.labelShort}
          </button>
        ))}
      </div>
      {loading && <span className="text-xs text-muted-foreground">Guardando...</span>}
    </div>
  )
}
