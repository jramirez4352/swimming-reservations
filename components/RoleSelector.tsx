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

  async function handleChange(newRole: string) {
    if (newRole === role) return
    if (!confirm(`¿Cambiar rol a ${newRole === "ADMIN" ? "Administrador" : "Alumno"}?`)) return
    setLoading(true)
    await changeUserRole(userId, newRole)
    setRole(newRole)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Rol:</span>
      <div className="flex rounded-md overflow-hidden border">
        <button
          onClick={() => handleChange("STUDENT")}
          disabled={loading}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            role === "STUDENT"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Alumno
        </button>
        <button
          onClick={() => handleChange("ADMIN")}
          disabled={loading}
          className={`px-3 py-1.5 text-xs font-medium border-l transition-colors ${
            role === "ADMIN"
              ? "bg-slate-800 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Admin
        </button>
      </div>
      {loading && <span className="text-xs text-muted-foreground">Guardando...</span>}
    </div>
  )
}
