import { LevelData, textColor } from "@/lib/levels"

interface Props {
  level?: LevelData | null
  size?: "sm" | "md" | "lg"
}

export function LevelBadge({ level, size = "md" }: Props) {
  if (!level) return null

  const sizeClass = size === "sm"
    ? "text-[10px] px-2 py-0.5"
    : size === "lg"
    ? "text-sm px-3 py-1"
    : "text-xs px-2.5 py-0.5"

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClass}`}
      style={{ backgroundColor: level.color, color: textColor(level.color) }}
    >
      {level.name}
    </span>
  )
}
