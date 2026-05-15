import { db } from "@/lib/db"
import { NewClassForm } from "@/components/NewClassForm"

export default async function NewClassPage() {
  const [professors, levels] = await Promise.all([
    db.user.findMany({ where: { role: "PROFESOR" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.level.findMany({ orderBy: { order: "asc" } }),
  ])
  return <NewClassForm professors={professors} levels={levels} />
}
