"use client"

import { useState } from "react"
import { LEVELS } from "@/lib/levels"
import { assignLevel } from "@/lib/actions/levels"

interface Props {
  studentId: string
  currentLevel: number | null | undefined
}

export function LevelSelector({ studentId, currentLevel }: Props) {
  const [level, setLevel] = useState<number | null>(currentLevel ?? null)
  const [loading, setLoading] = useState(false)

  async function handleChange(newLevel: number | null) {
    if (newLevel === level) return
    setLoading(true)
    await assignLevel(studentId, newLevel)
    setLevel(newLevel)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">Nivel:</span>
      <div className="flex rounded-md overflow-hidden border">
        <button
          onClick={() => handleChange(null)}
          disabled={loading}
          className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
            level === null ? "bg-slate-700 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          —
        </button>
        {Object.entries(LEVELS).map(([num, cfg], i) => {
          const n = Number(num)
          const isActive = level === n
          return (
            <button
              key={n}
              onClick={() => handleChange(n)}
              disabled={loading}
              className={`px-2.5 py-1.5 text-xs font-semibold border-l transition-colors ${
                isActive ? cfg.badgeClass : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
              title={cfg.label}
            >
              {n}
            </button>
          )
        })}
      </div>
      {loading && <span className="text-xs text-muted-foreground">Guardando...</span>}
    </div>
  )
}
