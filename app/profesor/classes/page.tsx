import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const fmt = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

export default async function ProfesorClassesPage() {
  const session = await auth()
  if (!session) return null

  const now = new Date()

  const [user, upcoming, past] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { canCreateClasses: true, role: true } }),
    db.class.findMany({
      where: { instructorUserId: session.user.id, datetime: { gte: now } },
      include: { reservations: { where: { status: "ACTIVE" } } },
      orderBy: { datetime: "asc" },
    }),
    db.class.findMany({
      where: { instructorUserId: session.user.id, datetime: { lt: now } },
      include: { reservations: { where: { status: "ACTIVE" } } },
      orderBy: { datetime: "desc" },
      take: 10,
    }),
  ])

  function ClassRow({ cls, isPast }: { cls: typeof upcoming[0]; isPast?: boolean }) {
    const pct = Math.round((cls.reservations.length / cls.maxCapacity) * 100)
    const editParams = new URLSearchParams({
      title: cls.title, description: cls.description ?? "",
      datetime: cls.datetime.toISOString(), durationMins: String(cls.durationMins), maxCapacity: String(cls.maxCapacity),
    }).toString()

    return (
      <div className={`flex items-center justify-between px-4 py-3 gap-4 ${isPast ? "opacity-60" : ""}`}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{cls.title}</p>
          <p className="text-xs text-muted-foreground capitalize">{fmt.format(new Date(cls.datetime))} · {cls.durationMins} min</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-24 bg-slate-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{cls.reservations.length}/{cls.maxCapacity}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/profesor/classes/${cls.id}`}>
            <Button variant="outline" size="sm">Alumnos</Button>
          </Link>
          {!isPast && (
            <Link href={`/profesor/classes/${cls.id}/edit?${editParams}`}>
              <Button variant="outline" size="sm">Editar</Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Clases</h1>
        {(user?.canCreateClasses || user?.role === "ADMIN") && (
          <Link href="/profesor/classes/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">+ Nueva clase</Button>
          </Link>
        )}
      </div>

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-muted-foreground">
          <p>No tienes clases asignadas.</p>
          <p className="text-sm mt-1">El administrador puede asignarte clases desde el panel de administración.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-2">Próximas ({upcoming.length})</h2>
              <div className="rounded-md border bg-white overflow-hidden divide-y">
                {upcoming.map(cls => <ClassRow key={cls.id} cls={cls} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-2 text-muted-foreground">Pasadas (últimas 10)</h2>
              <div className="rounded-md border bg-white overflow-hidden divide-y">
                {past.map(cls => <ClassRow key={cls.id} cls={cls} isPast />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
