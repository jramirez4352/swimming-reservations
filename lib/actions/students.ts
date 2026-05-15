"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Sin permiso")
}

export async function suspendStudent(userId: string) {
  await requireAdmin()
  await db.user.update({ where: { id: userId }, data: { suspended: true } })
  revalidatePath("/admin/students")
  return { success: true }
}

export async function unsuspendStudent(userId: string) {
  await requireAdmin()
  await db.user.update({ where: { id: userId }, data: { suspended: false } })
  revalidatePath("/admin/students")
  return { success: true }
}
