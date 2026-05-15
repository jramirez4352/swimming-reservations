import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReservationActions } from "@/components/ReservationActions"
import Link from "next/link"

type SearchParams = Promise<{ status?: string }>

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d)

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(d)

export default async function AdminReservationsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams
  const filter = status === "ACTIVE" || status === "CANCELLED" ? status : undefined

  const reservations = await db.reservation.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      class: { select: { title: true, datetime: true } },
    },
  })

  const activeCount = await db.reservation.count({ where: { status: "ACTIVE" } })
  const cancelledCount = await db.reservation.count({ where: { status: "CANCELLED" } })

  const tabs = [
    { label: `Todas (${activeCount + cancelledCount})`, value: undefined },
    { label: `Activas (${activeCount})`, value: "ACTIVE" },
    { label: `Canceladas (${cancelledCount})`, value: "CANCELLED" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reservas</h1>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const href = tab.value ? `/admin/reservations?status=${tab.value}` : "/admin/reservations"
          const active = filter === tab.value
          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-300 hover:border-slate-500"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {reservations.length === 0 ? (
        <p className="text-muted-foreground">No hay reservas con este filtro.</p>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Clase</TableHead>
                <TableHead>Fecha clase</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Reservado el</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.user.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.user.email}</TableCell>
                  <TableCell>{r.class.title}</TableCell>
                  <TableCell className="text-sm">{fmt(new Date(r.class.datetime))}</TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status === "ACTIVE" ? "default" : "secondary"}
                      className={r.status === "ACTIVE" ? "bg-green-600" : ""}
                    >
                      {r.status === "ACTIVE" ? "Activa" : "Cancelada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(new Date(r.createdAt))}</TableCell>
                  <TableCell className="text-right">
                    <ReservationActions reservationId={r.id} currentStatus={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
