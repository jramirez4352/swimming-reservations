import { db } from "@/lib/db"
import { NewClassForm } from "@/components/NewClassForm"

export default async function NewClassPage() {
  const professors = await db.user.findMany({
    where: { role: "PROFESOR" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
  return <NewClassForm professors={professors} />
}
