import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const [totalClasses, classesToday, totalReservations, totalStudents, allClasses] =
    await Promise.all([
      db.class.count(),
      db.class.count({ where: { datetime: { gte: today, lt: tomorrow } } }),
      db.reservation.count({ where: { status: "ACTIVE" } }),
      db.user.count({ where: { role: "STUDENT" } }),
      db.class.findMany({
        include: { reservations: { where: { status: "ACTIVE" } } },
      }),
    ])

  const fullCount = allClasses.filter((c) => c.reservations.length >= c.maxCapacity).length

  const stats = [
    {
      label: "Total de clases",
      value: totalClasses,
      icon: "📋",
      href: "/admin/classes",
      description: "Ver todas las clases",
    },
    {
      label: "Clases hoy",
      value: classesToday,
      icon: "📅",
      href: "/admin/classes",
      description: "Ver clases",
    },
    {
      label: "Reservas activas",
      value: totalReservations,
      icon: "✅",
      href: "/admin/reservations?status=ACTIVE",
      description: "Ver reservas activas",
    },
    {
      label: "Alumnos registrados",
      value: totalStudents,
      icon: "👥",
      href: "/admin/reservations",
      description: "Ver reservas",
    },
    {
      label: "Clases llenas",
      value: fullCount,
      icon: "🔴",
      href: "/admin/classes",
      description: "Ver clases",
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group block">
            <Card className="transition-all group-hover:shadow-md group-hover:border-slate-400 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {s.label}
                  <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                    {s.description} →
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {s.icon} {s.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
