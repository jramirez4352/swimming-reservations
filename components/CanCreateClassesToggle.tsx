"use client"

import { useState } from "react"
import { toggleCanCreateClasses } from "@/lib/actions/admin-users"

interface Props {
  userId: string
  initialValue: boolean
}

export function CanCreateClassesToggle({ userId, initialValue }: Props) {
  const [enabled, setEnabled] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const next = !enabled
    await toggleCanCreateClasses(userId, next)
    setEnabled(next)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-white">
      <div>
        <p className="text-sm font-medium">Crear clases</p>
        <p className="text-xs text-muted-foreground">
          {enabled
            ? "Este profesor puede crear sus propias clases."
            : "Solo el admin puede crear clases para este profesor."}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          enabled ? "bg-emerald-500" : "bg-slate-200"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}
