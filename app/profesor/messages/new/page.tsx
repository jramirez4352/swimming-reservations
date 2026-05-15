import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ComposeMessageForm } from "@/components/ComposeMessageForm"
import Link from "next/link"

type SearchParams = Promise<{ toUserId?: string; classId?: string }>

export default async function NewMessagePage({ searchParams }: { searchParams: SearchParams }) {
  const { toUserId, classId } = await searchParams
  const session = await auth()
  if (!session) return null

  // Fetch all unique enrolled students across professor's classes
  const myClasses = await db.class.findMany({
    where: { instructorUserId: session.user.id },
    include: {
      reservations: {
        where: { status: "ACTIVE" },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  const studentMap = new Map<string, { id: string; name: string; email: string }>()
  for (const cls of myClasses) {
    for (const r of cls.reservations) {
      if (!studentMap.has(r.user.id)) studentMap.set(r.user.id, r.user)
    }
  }
  const students = Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="max-w-lg">
      <Link href="/profesor/messages" className="text-sm text-muted-foreground hover:underline block mb-6">
        ← Volver a mensajes
      </Link>
      <h1 className="text-2xl font-bold mb-6">Nuevo mensaje</h1>
      <ComposeMessageForm students={students} defaultToUserId={toUserId} />
    </div>
  )
}
