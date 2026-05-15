import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ProfesorStudentsPage() {
  const session = await auth()
  if (!session) return null

  const myClasses = await db.class.findMany({
    where: { instructorUserId: session.user.id },
    include: {
      reservations: {
        where: { status: "ACTIVE" },
        include: { user: { select: { id: true, name: true, email: true, phone: true, city: true } } },
      },
    },
  })

  // Unique students across all classes, with the classes they're enrolled in
  const studentMap = new Map<string, {
    user: { id: string; name: string; email: string; phone: string | null; city: string | null }
    classes: string[]
  }>()

  for (const cls of myClasses) {
    for (const r of cls.reservations) {
      if (!studentMap.has(r.user.id)) {
        studentMap.set(r.user.id, { user: r.user, classes: [] })
      }
      studentMap.get(r.user.id)!.classes.push(cls.title)
    }
  }

  const students = Array.from(studentMap.values()).sort((a, b) => a.user.name.localeCompare(b.user.name))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Alumnos ({students.length})</h1>
        <Link href="/profesor/messages/new">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">✉️ Enviar mensaje</Button>
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-muted-foreground">
          <p>No tienes alumnos inscritos en tus clases.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden divide-y">
          {students.map(({ user, classes }) => (
            <div key={user.id} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {classes.map(c => (
                    <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
              <Link href={`/profesor/messages/new?toUserId=${user.id}`}>
                <Button variant="outline" size="sm">✉️</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
