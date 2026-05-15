import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProfesorNewClassForm } from "@/components/ProfesorNewClassForm"

export default async function ProfesorNewClassPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { canCreateClasses: true, role: true, name: true },
  })

  if (!user?.canCreateClasses && user?.role !== "ADMIN") redirect("/profesor/classes")

  const levels = await db.level.findMany({ orderBy: { order: "asc" } })

  return <ProfesorNewClassForm instructorName={user.name} levels={levels} />
}
