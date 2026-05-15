import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AttendanceToggle } from "@/components/AttendanceToggle"
import Link from "next/link"

type Params = Promise<{ id: string }>

const fmt = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota",
  weekday: "long", day: "numeric", month: "long", year: "numeric",
  hour: "2-digit", minute: "2-digit",
})

export default async function ClassAttendancePage({ params }: { params: Params }) {
  const { id } = await params

  const cls = await db.class.findUnique({
    where: { id },
    include: {
      reservations: {
        where: { status: "ACTIVE" },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!cls) notFound()

  const total = cls.reservations.length
  const attendedCount = cls.reservations.filter((r) => r.attended).length
  const occupancyPct = cls.maxCapacity > 0 ? Math.round((total / cls.maxCapacity) * 100) : 0
  const isPast = new Date(cls.datetime) < new Date()

  return (
    <div className="max-w-3xl">
      <Link href="/admin/classes" className="text-sm text-muted-foreground hover:underline block mb-6">
        ← Volver a clases
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{cls.title}</h1>
        <p className="text-muted-foreground mt-1 capitalize">{fmt.format(new Date(cls.datetime))}</p>
        <p className="text-sm text-muted-foreground">👤 {cls.instructor} · ⏱ {cls.durationMins} min</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-2xl font-bold">{total}/{cls.maxCapacity}</p>
          <p className="text-xs text-muted-foreground mt-1">Inscritos</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{attendedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Asistieron</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{total - attendedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Ausentes</p>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="mb-6 rounded-xl border bg-white p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Ocupación</span>
          <span className="font-semibold">{occupancyPct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${occupancyPct >= 100 ? "bg-red-500" : occupancyPct >= 75 ? "bg-amber-500" : "bg-blue-500"}`}
            style={{ width: `${Math.min(occupancyPct, 100)}%` }}
          />
        </div>
        {isPast && total > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Asistencia real: {attendedCount}/{total} ({Math.round((attendedCount / total) * 100)}%)
          </p>
        )}
      </div>

      {/* Attendance list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Lista de asistencia</h2>
          {!isPast && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">Clase futura</Badge>
          )}
        </div>

        {cls.reservations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay alumnos inscritos en esta clase.</p>
        ) : (
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">✓</TableHead>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cls.reservations.map((r) => (
                  <TableRow key={r.id} className={r.attended ? "bg-green-50/50" : ""}>
                    <TableCell className="text-center">
                      <AttendanceToggle reservationId={r.id} initialAttended={r.attended} initialAbsent={r.absent} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/students/${r.user.id}`} className="font-medium hover:underline text-blue-600">
                        {r.user.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.user.email}</TableCell>
                    <TableCell>
                      {r.attended ? (
                        <Badge className="bg-green-600 text-xs">Asistió</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Pendiente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
