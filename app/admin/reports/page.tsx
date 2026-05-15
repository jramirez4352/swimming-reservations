import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const fmt = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", day: "numeric", month: "short", year: "numeric" })

export default async function AdminReportsPage() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalStudents, totalAdmins, totalClasses, allClasses, recentStudents, cancelledCount] =
    await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.class.count(),
      db.class.findMany({
        include: {
          reservations: { where: { status: "ACTIVE" } },
        },
        orderBy: { datetime: "desc" },
      }),
      db.user.findMany({
        where: { role: "STUDENT", createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      db.reservation.count({ where: { status: "CANCELLED" } }),
    ])

  const totalActiveReservations = allClasses.reduce((acc, c) => acc + c.reservations.length, 0)
  const totalCapacity = allClasses.reduce((acc, c) => acc + c.maxCapacity, 0)
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalActiveReservations / totalCapacity) * 100) : 0
  const fullClasses = allClasses.filter((c) => c.reservations.length >= c.maxCapacity).length

  // Top 10 classes by reservation count
  const topClasses = [...allClasses]
    .sort((a, b) => b.reservations.length - a.reservations.length)
    .slice(0, 10)

  // Stats per instructor
  const instructorMap = new Map<string, { reservations: number; classes: number; capacity: number }>()
  for (const c of allClasses) {
    const cur = instructorMap.get(c.instructor) ?? { reservations: 0, classes: 0, capacity: 0 }
    instructorMap.set(c.instructor, {
      reservations: cur.reservations + c.reservations.length,
      classes: cur.classes + 1,
      capacity: cur.capacity + c.maxCapacity,
    })
  }
  const instructors = Array.from(instructorMap.entries())
    .map(([name, s]) => ({
      name,
      ...s,
      occupancyPct: s.capacity > 0 ? Math.round((s.reservations / s.capacity) * 100) : 0,
    }))
    .sort((a, b) => b.reservations - a.reservations)

  const maxInstructorReservations = instructors[0]?.reservations ?? 1
  const maxClassReservations = topClasses[0]?.reservations.length ?? 1

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <a href="/api/admin/reports/export" download>
          <button className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
            ⬇ Exportar CSV
          </button>
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Alumnos", value: totalStudents, icon: "👥" },
          { label: "Admins", value: totalAdmins, icon: "🛡️" },
          { label: "Clases", value: totalClasses, icon: "📋" },
          { label: "Reservas activas", value: totalActiveReservations, icon: "✅" },
          { label: "Ocupación promedio", value: `${avgOccupancy}%`, icon: "📊" },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground font-medium">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.icon} {s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top classes by occupancy */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Clases más populares</h2>
          <div className="rounded-md border bg-white overflow-hidden">
            <div className="divide-y">
              {topClasses.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Sin datos.</p>
              ) : (
                topClasses.map((c) => {
                  const pct = Math.round((c.reservations.length / c.maxCapacity) * 100)
                  const barWidth = maxClassReservations > 0
                    ? Math.round((c.reservations.length / maxClassReservations) * 100)
                    : 0
                  return (
                    <div key={c.id} className="p-3">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.instructor} · {fmt.format(new Date(c.datetime))}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-semibold">{c.reservations.length}/{c.maxCapacity}</span>
                          <span className="ml-1.5">
                            {pct >= 100 ? (
                              <Badge variant="destructive" className="text-xs">Llena</Badge>
                            ) : pct >= 75 ? (
                              <Badge className="bg-amber-500 text-xs">{pct}%</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">{pct}%</Badge>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Stats per instructor */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Por instructor</h2>
          <div className="rounded-md border bg-white overflow-hidden">
            <div className="divide-y">
              {instructors.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Sin datos.</p>
              ) : (
                instructors.map((inst) => {
                  const barWidth = maxInstructorReservations > 0
                    ? Math.round((inst.reservations / maxInstructorReservations) * 100)
                    : 0
                  return (
                    <div key={inst.name} className="p-3">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{inst.name}</p>
                          <p className="text-xs text-muted-foreground">{inst.classes} {inst.classes === 1 ? "clase" : "clases"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-semibold">{inst.reservations} reservas</span>
                          <span className="ml-1.5 text-xs text-muted-foreground">({inst.occupancyPct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-cyan-500 transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Clases llenas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{fullClasses}</p>
            <p className="text-xs text-muted-foreground mt-1">de {totalClasses} clases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Reservas canceladas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-500">{cancelledCount}</p>
            <p className="text-xs text-muted-foreground mt-1">total histórico</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Nuevos alumnos (7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{recentStudents.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent registrations */}
      {recentStudents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Registros recientes (últimos 7 días)</h2>
          <div className="rounded-md border bg-white overflow-hidden">
            <div className="divide-y">
              {recentStudents.map((s) => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{fmt.format(new Date(s.createdAt))}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
