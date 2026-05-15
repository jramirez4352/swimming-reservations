"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function requireProfesorOrAdmin() {
  const session = await auth()
  if (!session?.user?.id || !["PROFESOR", "ADMIN"].includes(session.user.role ?? "")) {
    throw new Error("Sin permiso")
  }
  return session.user
}

export async function assignLevel(studentId: string, level: number | null) {
  await requireProfesorOrAdmin()

  await db.user.update({
    where: { id: studentId },
    data: { level },
  })

  revalidatePath(`/admin/students/${studentId}`)
  revalidatePath("/admin/students")
  revalidatePath("/profesor/students")
  revalidatePath("/profesor/classes")
  return { success: true }
}
