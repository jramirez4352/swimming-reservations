"use client"

import { useState, useActionState } from "react"
import { saveEvaluation } from "@/lib/actions/evaluations"
import { Button } from "@/components/ui/button"

interface Props {
  reservationId: string
  initialRating?: number | null
  initialComment?: string | null
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
        >
          <span className={hovered ? star <= hovered ? "text-amber-400" : "text-slate-200"
                                   : star <= value  ? "text-amber-400" : "text-slate-200"}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

export function EvaluationForm({ reservationId, initialRating, initialComment }: Props) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(initialRating ?? 0)

  const action = saveEvaluation.bind(null, reservationId)
  const [state, formAction, pending] = useActionState(action, null)

  const hasEval = !!initialRating

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
          hasEval
            ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "border-slate-300 bg-white text-slate-500 hover:border-slate-400"
        }`}
      >
        {hasEval ? `${"★".repeat(initialRating ?? 0)} Editar` : "＋ Calificar"}
      </button>
    )
  }

  return (
    <div className="bg-white border rounded-xl p-3 shadow-sm space-y-2 min-w-[220px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">Calificación</span>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
      </div>

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="rating" value={rating} />

        <StarPicker value={rating} onChange={setRating} />

        <textarea
          name="comment"
          defaultValue={initialComment ?? ""}
          placeholder="Comentario (opcional)..."
          rows={2}
          className="w-full text-xs rounded-lg border border-input bg-background px-2.5 py-1.5 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          maxLength={500}
        />

        {state?.error && <p className="text-[11px] text-red-600">{state.error}</p>}
        {state?.success && <p className="text-[11px] text-green-600">✓ Guardado</p>}

        <Button
          type="submit"
          size="sm"
          disabled={pending || rating === 0}
          className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
        >
          {pending ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  )
}
