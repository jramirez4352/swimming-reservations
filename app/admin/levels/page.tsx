import { db } from "@/lib/db"
import { LevelManagerList } from "@/components/LevelManagerList"
import { SeedLevelsButton } from "@/components/SeedLevelsButton"

export default async function AdminLevelsPage() {
  const levels = await db.level.findMany({ orderBy: { order: "asc" } })

  const levelStudentCounts = await db.user.groupBy({
    by: ["level"],
    where: { role: "STUDENT", level: { not: null } },
    _count: { id: true },
  })
  const countMap = new Map(levelStudentCounts.map(r => [r.level, r._count.id]))

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Niveles de aprendizaje</h1>
        {levels.length === 0 && <SeedLevelsButton />}
      </div>

      {levels.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-muted-foreground">
          <p className="font-medium">No hay niveles configurados.</p>
          <p className="text-sm mt-1">Usa el botón "Crear predeterminados" para generar los 6 niveles base.</p>
        </div>
      ) : (
        <LevelManagerList levels={levels} countMap={Object.fromEntries(countMap)} />
      )}
    </div>
  )
}
