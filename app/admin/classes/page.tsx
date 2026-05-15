import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { DeleteClassButton } from "@/components/DeleteClassButton"

export default async function AdminClassesPage() {
  const classes = await db.class.findMany({
    orderBy: { datetime: "asc" },
    include: { reservations: { where: { status: "ACTIVE" } } },
  })

  // Count instances per recurringGroupId to show "2/8" labels
  const groupCounts: Record<string, number> = {}
  const groupIndices: Record<string, number> = {}
  for (const cls of classes) {
    if (cls.recurringGroupId) {
      groupCounts[cls.recurringGroupId] = (groupCounts[cls.recurringGroupId] ?? 0) + 1
    }
  }
  // Assign index within group
  const seenGroups: Record<string, number> = {}
  const classIndexMap: Record<string, number> = {}
  for (const cls of classes) {
    if (cls.recurringGroupId) {
      seenGroups[cls.recurringGroupId] = (seenGroups[cls.recurringGroupId] ?? 0) + 1
      classIndexMap[cls.id] = seenGroups[cls.recurringGroupId]
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clases ({classes.length})</h1>
        <Link href="/admin/classes/new">
          <Button>+ Nueva clase</Button>
        </Link>
      </div>

      {classes.length === 0 ? (
        <p className="text-muted-foreground">No hay clases creadas todavía.</p>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clase</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Ocupación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => {
                const occupied = cls.reservations.length
                const isFull = occupied >= cls.maxCapacity
                const dateStr = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(cls.datetime))

                const editParams = new URLSearchParams({
                  title: cls.title,
                  description: cls.description ?? "",
                  instructor: cls.instructor,
                  datetime: cls.datetime.toISOString(),
                  durationMins: String(cls.durationMins),
                  maxCapacity: String(cls.maxCapacity),
                }).toString()

                return (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cls.title}</span>
                        {cls.recurringGroupId && (
                          <Badge variant="outline" className="text-xs">
                            Serie {classIndexMap[cls.id]}/{groupCounts[cls.recurringGroupId]}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{cls.instructor}</TableCell>
                    <TableCell className="text-sm">{dateStr}</TableCell>
                    <TableCell>{cls.durationMins} min</TableCell>
                    <TableCell>
                      <Badge variant={isFull ? "destructive" : "secondary"}>
                        {occupied}/{cls.maxCapacity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/classes/${cls.id}`}>
                          <Button variant="outline" size="sm">Asistencia</Button>
                        </Link>
                        <Link href={`/admin/classes/${cls.id}/edit?${editParams}`}>
                          <Button variant="outline" size="sm">Editar</Button>
                        </Link>
                        <DeleteClassButton classId={cls.id} />
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
