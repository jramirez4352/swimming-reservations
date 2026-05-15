"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { changeUserRole } from "@/lib/actions/admin-users"

interface Props {
  userId: string
  currentRole: string
}

export function RoleSelector({ userId, currentRole }: Props) {
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  const ROLE_LABELS: Record<string, string> = { STUDENT: "Alumno", ADMIN: "Administrador", PROFESOR: "Profesor" }

  async function handleChange(newRole: string) {
    if (newRole === role) return
    if (!confirm(`¿Cambiar rol a ${ROLE_LABELS[newRole] ?? newRole}?`)) return
    setLoading(true)
    await changeUserRole(userId, newRole)
    setRole(newRole)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Rol:</span>
      <div className="flex rounded-md overflow-hidden border">
        {[
          { value: "STUDENT", label: "Alumno", active: "bg-blue-600 text-white" },
          { value: "PROFESOR", label: "Profesor", active: "bg-emerald-600 text-white" },
          { value: "ADMIN", label: "Admin", active: "bg-slate-800 text-white" },
        ].map((r, i) => (
          <button
            key={r.value}
            onClick={() => handleChange(r.value)}
            disabled={loading}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${i > 0 ? "border-l" : ""} ${
              role === r.value ? r.active : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {loading && <span className="text-xs text-muted-foreground">Guardando...</span>}
    </div>
  )
}
