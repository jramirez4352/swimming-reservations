import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const fmtShort = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
const fmtFull  = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", weekday: "long",  day: "numeric", month: "long",  hour: "2-digit", minute: "2-digit" })

export default async function ProfesorDashboardPage() {
  const session = await auth()
  if (!session) return null

  const now = new Date()
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  const weekEnd  = new Date(now); weekEnd.setDate(now.getDate() + 7)

  const myClasses = await db.class.findMany({
    where: { instructorUserId: session.user.id, datetime: { gte: now } },
    include: { reservations: { where: { status: "ACTIVE" } } },
    orderBy: { datetime: "asc" },
  })

  const todayClasses   = myClasses.filter(c => new Date(c.datetime) <= todayEnd)
  const upcomingClasses = myClasses.filter(c => new Date(c.datetime) > todayEnd && new Date(c.datetime) <= weekEnd)

  const totalStudents = new Set(
    myClasses.flatMap(c => c.reservations.map(r => r.userId))
  ).size

  const unreadMessages = await db.message.count({ where: { toUserId: session.user.id, read: false } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido, {session.user.name}</h1>
        <p className="text-muted-foreground mt-1">Panel del profesor</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Clases hoy",      value: todayClasses.length,    icon: "📅", href: "/profesor/classes" },
          { label: "Esta semana",     value: upcomingClasses.length,  icon: "📋", href: "/profesor/classes" },
          { label: "Total alumnos",   value: totalStudents,           icon: "👥", href: "/profesor/students" },
          { label: "Mensajes nuevos", value: unreadMessages,          icon: "✉️", href: "/profesor/messages" },
        ].map(s => (
          <Link key={s.label} href={s.href} className="group block">
            <Card className="transition-all group-hover:shadow-md group-hover:border-emerald-300 cursor-pointer">
              <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">{s.label}</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{s.icon} {s.value}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Today's classes */}
      {todayClasses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Clases de hoy</h2>
          <div className="space-y-3">
            {todayClasses.map(cls => {
              const pct = Math.round((cls.reservations.length / cls.maxCapacity) * 100)
              return (
                <Link key={cls.id} href={`/profesor/classes/${cls.id}`} className="group block">
                  <div className="bg-white rounded-xl border p-4 transition-all group-hover:shadow-md group-hover:border-emerald-300 group-hover:-translate-y-0.5 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold group-hover:text-emerald-700 transition-colors">{cls.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">{fmtFull.format(new Date(cls.datetime))} · {cls.durationMins} min</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={cls.reservations.length >= cls.maxCapacity ? "destructive" : "secondary"}>
                          {cls.reservations.length}/{cls.maxCapacity}
                        </Badge>
                        <span className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming this week */}
      {upcomingClasses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Próximas esta semana</h2>
          <div className="rounded-md border bg-white overflow-hidden divide-y">
            {upcomingClasses.map(cls => (
              <Link key={cls.id} href={`/profesor/classes/${cls.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{cls.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{fmtShort.format(new Date(cls.datetime))}</p>
                </div>
                <Badge variant="secondary">{cls.reservations.length}/{cls.maxCapacity}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {todayClasses.length === 0 && upcomingClasses.length === 0 && (
        <div className="rounded-xl border bg-white p-8 text-center text-muted-foreground">
          <p>No tienes clases programadas esta semana.</p>
          <p className="text-sm mt-1">El admin puede asignarte clases desde el panel de administración.</p>
        </div>
      )}
    </div>
  )
}
