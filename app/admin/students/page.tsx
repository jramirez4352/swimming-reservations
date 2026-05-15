import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StudentActions } from "@/components/StudentActions"
import { StudentSearch } from "@/components/StudentSearch"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

type SearchParams = Promise<{ q?: string }>

export default async function AdminStudentsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams

  const students = await db.user.findMany({
    where: {
      role: "STUDENT",
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          Alumnos {q ? `— "${q}" (${students.length})` : `(${students.length})`}
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

      {students.length === 0 ? (
        <p className="text-muted-foreground">
          {q ? `No se encontraron alumnos con "${q}".` : "No hay alumnos registrados."}
        </p>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Reservas activas</TableHead>
                <TableHead>Total reservas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/students/${s.id}`} className="hover:underline text-blue-600">
                      {s.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{s.reservations.length}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s._count.reservations}</TableCell>
                  <TableCell>
                    {s.suspended ? (
                      <Badge variant="destructive">Suspendido</Badge>
                    ) : (
                      <Badge className="bg-green-600">Activo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(new Date(s.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/students/${s.id}`}>
                        <Button variant="outline" size="sm">Ver</Button>
                      </Link>
                      <StudentActions userId={s.id} suspended={s.suspended} />
                    </div>
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
