export const LEVELS: Record<number, {
  label: string
  badgeClass: string   // bg + text for the filled badge
  borderClass: string
  ringClass: string
}> = {
  1: { label: "Nivel 1", badgeClass: "bg-sky-500 text-white",      borderClass: "border-sky-400",    ringClass: "ring-sky-300" },
  2: { label: "Nivel 2", badgeClass: "bg-blue-600 text-white",     borderClass: "border-blue-500",   ringClass: "ring-blue-300" },
  3: { label: "Nivel 3", badgeClass: "bg-emerald-500 text-white",  borderClass: "border-emerald-400",ringClass: "ring-emerald-300" },
  4: { label: "Nivel 4", badgeClass: "bg-amber-500 text-white",    borderClass: "border-amber-400",  ringClass: "ring-amber-300" },
  5: { label: "Nivel 5", badgeClass: "bg-orange-500 text-white",   borderClass: "border-orange-400", ringClass: "ring-orange-300" },
  6: { label: "Nivel 6", badgeClass: "bg-purple-600 text-white",   borderClass: "border-purple-500", ringClass: "ring-purple-300" },
}

export function getLevelConfig(level: number | null | undefined) {
  if (!level || !LEVELS[level]) return null
  return LEVELS[level]
}
