interface Props {
  rating: number
  comment?: string | null
  profesorName?: string | null
  small?: boolean
}

export function EvaluationDisplay({ rating, comment, profesorName, small }: Props) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating)

  if (small) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-amber-400 text-sm tracking-tight">{stars}</span>
        {comment && <span className="text-xs text-muted-foreground truncate max-w-[120px]">"{comment}"</span>}
      </span>
    )
  }

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-lg tracking-tight">{stars}</span>
        <span className="text-xs font-semibold text-amber-700">{rating}/5</span>
        {profesorName && <span className="text-xs text-muted-foreground ml-auto">por {profesorName}</span>}
      </div>
      {comment && (
        <p className="text-sm text-slate-700 italic">"{comment}"</p>
      )}
    </div>
  )
}
