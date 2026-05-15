"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendLevelUpEmail } from "@/lib/email"

async function requireProfesorOrAdmin() {
  const session = await auth()
  if (!session?.user?.id || !["PROFESOR", "ADMIN"].includes(session.user.role ?? "")) {
    throw new Error("Sin permiso")
  }
  return session.user
}

export async function assignLevel(studentId: string, level: number | null) {
  await requireProfesorOrAdmin()

  const [prevStudent] = await Promise.all([
    db.user.findUnique({ where: { id: studentId }, select: { level: true, name: true, email: true } }),
  ])

  await db.user.update({ where: { id: studentId }, data: { level } })

  // Enviar email solo cuando se asigna o sube de nivel (no al quitar)
  if (level !== null && level !== prevStudent?.level) {
    const levelData = await db.level.findUnique({ where: { id: level } })
    if (levelData && prevStudent?.email) {
      await sendLevelUpEmail(
        { name: prevStudent.name, email: prevStudent.email },
        levelData.name,
        levelData.color
      ).catch(() => {/* no bloquea si el email falla */})
    }
  }

  revalidatePath(`/admin/students/${studentId}`)
  revalidatePath("/admin/students")
  revalidatePath("/profesor/students")
  revalidatePath("/profesor/classes")
  return { success: true }
}
