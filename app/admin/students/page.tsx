import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StudentActions } from "@/components/StudentActions"
import { StudentSearch } from "@/components/StudentSearch"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

type SearchParams = Promise<{ q?: string; role?: string }>

const ROLE_TABS = [
  { value: "",          label: "Todos"      },
  { value: "STUDENT",   label: "Alumnos"    },
  { value: "PROFESOR",  label: "Profesores" },
  { value: "ADMIN",     label: "Admins"     },
]

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  STUDENT:  { label: "Alumno",    className: "bg-blue-600" },
  PROFESOR: { label: "Profesor",  className: "bg-emerald-600" },
  ADMIN:    { label: "Admin",     className: "bg-slate-700" },
}

const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" })

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, role } = await searchParams

  const users = await db.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { reservations: true } },
      reservations: { where: { status: "ACTIVE" }, select: { id: true } },
    },
  })

  function tabHref(value: string) {
    const params = new URLSearchParams()
    if (value) params.set("role", value)
    if (q) params.set("q", q)
    const s = params.toString()
    return `/admin/students${s ? `?${s}` : ""}`
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">
          Usuarios {q ? `— "${q}" (${users.length})` : `(${users.length})`}
        </h1>
        <div className="flex items-center gap-3">
          <Suspense>
            <StudentSearch />
          </Suspense>
          <Link href="/admin/students/new">
            <Button>+ Crear</Button>
          </Link>
        </div>
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {ROLE_TABS.map(tab => {
          const isActive = (role ?? "") === tab.value
          return (
            <Link
              key={tab.value}
              href={tabHref(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
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

      {users.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {q ? `No se encontraron usuarios con "${q}".` : "No hay usuarios registrados."}
        </p>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Reservas activas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const roleBadge = ROLE_BADGE[u.role] ?? { label: u.role, className: "bg-slate-500" }
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/students/${u.id}`} className="hover:underline text-blue-600">
                        {u.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge className={`${roleBadge.className} text-xs`}>{roleBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.reservations.length}</Badge>
                    </TableCell>
                    <TableCell>
                      {u.suspended ? (
                        <Badge variant="destructive">Suspendido</Badge>
                      ) : (
                        <Badge className="bg-green-600">Activo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt.format(new Date(u.createdAt))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/students/${u.id}`}>
                          <Button variant="outline" size="sm">Ver</Button>
                        </Link>
                        <StudentActions userId={u.id} suspended={u.suspended} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
