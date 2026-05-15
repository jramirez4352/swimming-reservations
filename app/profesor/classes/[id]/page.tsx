import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AttendanceToggle } from "@/components/AttendanceToggle"
import { LevelBadge } from "@/components/LevelBadge"
import { LevelSelector } from "@/components/LevelSelector"
import { EvaluationForm } from "@/components/EvaluationForm"
import Link from "next/link"

type Params = Promise<{ id: string }>

const fmt = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })

export default async function ProfesorClassDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const session = await auth()
  if (!session) return null

  const cls = await db.class.findUnique({
    where: { id },
    include: {
      reservations: {
        where: { status: "ACTIVE" },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, level: true } },
          evaluation: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!cls || cls.instructorUserId !== session.user.id) notFound()

  const levels = await db.level.findMany({ orderBy: { order: "asc" } })

  const isPast = new Date(cls.datetime) < new Date()
  const attendedCount = cls.reservations.filter(r => r.attended).length
  const pct = cls.maxCapacity > 0 ? Math.round((cls.reservations.length / cls.maxCapacity) * 100) : 0
  const editParams = new URLSearchParams({
    title: cls.title, description: cls.description ?? "",
    datetime: cls.datetime.toISOString(), durationMins: String(cls.durationMins), maxCapacity: String(cls.maxCapacity),
  }).toString()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/profesor/classes" className="text-sm text-muted-foreground hover:underline">
          ← Volver a mis clases
        </Link>
        {!isPast && (
          <Link href={`/profesor/classes/${id}/edit?${editParams}`}>
            <Button variant="outline" size="sm">Editar clase</Button>
          </Link>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{cls.title}</h1>
        <p className="text-muted-foreground mt-1 capitalize">{fmt.format(new Date(cls.datetime))}</p>
        <p className="text-sm text-muted-foreground">⏱ {cls.durationMins} min · Capacidad: {cls.maxCapacity}</p>
        {cls.description && <p className="text-sm mt-2 text-slate-600">{cls.description}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Inscritos", value: `${cls.reservations.length}/${cls.maxCapacity}`, color: "" },
          { label: "Asistieron", value: attendedCount, color: "text-green-600" },
          { label: "Ausentes", value: cls.reservations.length - attendedCount, color: "text-slate-400" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-white p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Ocupación</span>
          <span className="font-semibold">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className={`h-3 rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>

      {/* Student list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Lista de alumnos</h2>
          {cls.reservations.length > 0 && (
            <Link href={`/profesor/messages/new?classId=${id}`}>
              <Button size="sm" variant="outline">✉️ Enviar mensaje</Button>
            </Link>
          )}
        </div>

        {cls.reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay alumnos inscritos.</p>
        ) : (
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">✓</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Asistencia</TableHead>
                  {isPast && <TableHead>Evaluación</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cls.reservations.map(r => (
                  <TableRow key={r.id} className={r.attended ? "bg-green-50/50" : ""}>
                    <TableCell className="text-center">
                      <AttendanceToggle reservationId={r.id} initialAttended={r.attended} initialAbsent={r.absent} />
                    </TableCell>
                    <TableCell className="font-medium">{r.user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{r.user.email}</div>
                      {r.user.phone && <div>{r.user.phone}</div>}
                    </TableCell>
                    <TableCell>
                      <LevelSelector studentId={r.user.id} currentLevel={r.user.level} levels={levels} />
                    </TableCell>
                    <TableCell>
                      {r.attended ? (
                        <Badge className="bg-green-600 text-xs">Asistió</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Pendiente</Badge>
                      )}
                    </TableCell>
                    {isPast && (
                      <TableCell>
                        <EvaluationForm
                          reservationId={r.id}
                          initialRating={r.evaluation?.rating}
                          initialComment={r.evaluation?.comment}
                        />
                      </TableCell>
                    )}
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
