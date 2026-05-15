import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StudentActions } from "@/components/StudentActions"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminStudentsPage() {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          reservations: true,
        },
      },
      reservations: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Alumnos ({students.length})</h1>
        <Link href="/admin/students/new">
          <Button>+ Crear usuario</Button>
        </Link>
      </div>

      {students.length === 0 ? (
        <p className="text-muted-foreground">No hay alumnos registrados.</p>
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
                      <Badge variant="default" className="bg-green-600">Activo</Badge>
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
