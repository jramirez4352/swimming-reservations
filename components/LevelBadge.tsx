import { getLevelConfig } from "@/lib/levels"

interface Props {
  level: number | null | undefined
  size?: "sm" | "md" | "lg"
}

export function LevelBadge({ level, size = "md" }: Props) {
  const cfg = getLevelConfig(level)
  if (!cfg) return null

  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : size === "lg" ? "text-sm px-3 py-1" : "text-xs px-2.5 py-0.5"

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${cfg.badgeClass}`}>
      {cfg.label}
    </span>
  )
}
