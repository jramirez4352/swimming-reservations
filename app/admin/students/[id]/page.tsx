import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { StudentActions } from "@/components/StudentActions"

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ history?: string }>

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { id } = await params
  const { history: historyFilter } = await searchParams

  const student = await db.user.findFirst({
    where: { id, role: "STUDENT" },
    include: {
      reservations: {
        include: { class: true },
        orderBy: { class: { datetime: "desc" } },
      },
      waitlistEntries: {
        include: { class: { select: { title: true, datetime: true } } },
      },
    },
  })

  if (!student) notFound()

  const now = new Date()
  const active = student.reservations.filter(
    (r) => r.status === "ACTIVE" && new Date(r.class.datetime) >= now
  )
  // History = past reservations (any status) + future cancelled reservations
  const allHistory = student.reservations.filter(
    (r) => new Date(r.class.datetime) < now || r.status === "CANCELLED"
  )

  const filteredHistory =
    historyFilter === "attended"
      ? allHistory.filter((r) => r.status === "ACTIVE")
      : historyFilter === "cancelled"
      ? allHistory.filter((r) => r.status === "CANCELLED")
      : allHistory

  const attendedCount = allHistory.filter((r) => r.status === "ACTIVE").length
  const cancelledCount = allHistory.filter((r) => r.status === "CANCELLED").length

  return (
    <div className="max-w-3xl">
      <Link href="/admin/students" className="text-sm text-muted-foreground hover:underline block mb-6">
        ← Volver a alumnos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground">{student.email}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Registrado el {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(new Date(student.createdAt))}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {student.suspended ? (
            <Badge variant="destructive">Suspendido</Badge>
          ) : (
            <Badge className="bg-green-600">Activo</Badge>
          )}
          <StudentActions userId={student.id} suspended={student.suspended} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Reservas activas", value: active.length },
          { label: "Clases asistidas", value: attendedCount },
          { label: "En lista de espera", value: student.waitlistEntries.length },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground font-medium">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active reservations */}
      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Reservas activas</h2>
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clase</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.class.title}</TableCell>
                    <TableCell>{r.class.instructor}</TableCell>
                    <TableCell className="text-sm">
                      {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(r.class.datetime))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Waitlist */}
      {student.waitlistEntries.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Lista de espera</h2>
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clase</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.waitlistEntries.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.class.title}</TableCell>
                    <TableCell className="text-sm">
                      {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(w.class.datetime))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-semibold">
            Historial ({allHistory.length})
          </h2>
          {/* Filter tabs */}
          <div className="flex gap-1.5">
            {[
              { label: `Todas (${allHistory.length})`, value: undefined },
              { label: `Asistidas (${attendedCount})`, value: "attended" },
              { label: `Canceladas (${cancelledCount})`, value: "cancelled" },
            ].map((tab) => {
              const href = tab.value
                ? `/admin/students/${id}?history=${tab.value}`
                : `/admin/students/${id}`
              const isActive = historyFilter === tab.value
              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-500"
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>

        {allHistory.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sin historial de clases.</p>
        ) : filteredHistory.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay registros con este filtro.</p>
        ) : (
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clase</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((r) => {
                  const isPast = new Date(r.class.datetime) < now
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.class.title}</TableCell>
                      <TableCell>{r.class.instructor}</TableCell>
                      <TableCell className="text-sm">
                        {new Intl.DateTimeFormat("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(r.class.datetime))}
                        {!isPast && (
                          <span className="ml-1.5 text-[10px] text-amber-600 font-medium">futura</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={r.status === "ACTIVE" ? "default" : "secondary"}
                          className={r.status === "ACTIVE" ? "bg-blue-600" : ""}
                        >
                          {r.status === "ACTIVE" ? (isPast ? "Asistida" : "Activa") : "Cancelada"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
