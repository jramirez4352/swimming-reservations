"use client"

import { useState } from "react"
import { LevelData, textColor } from "@/lib/levels"
import { assignLevel } from "@/lib/actions/levels"

interface Props {
  studentId: string
  currentLevel: number | null | undefined
  levels: LevelData[]
}

export function LevelSelector({ studentId, currentLevel, levels }: Props) {
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
            level === null ? "bg-slate-700 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
          }`}
        >
          —
        </button>
        {levels.map((l, i) => {
          const isActive = level === l.id
          return (
            <button
              key={l.id}
              onClick={() => handleChange(l.id)}
              disabled={loading}
              title={l.name}
              className={`px-2.5 py-1.5 text-xs font-semibold border-l transition-all`}
              style={isActive
                ? { backgroundColor: l.color, color: textColor(l.color) }
                : { backgroundColor: "white", color: "#64748b" }
              }
            >
              {l.id}
            </button>
          )
        })}
      </div>
      {loading && <span className="text-xs text-muted-foreground">Guardando...</span>}
    </div>
  )
}
