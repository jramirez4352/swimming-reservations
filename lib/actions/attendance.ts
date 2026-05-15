"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Sin permiso")
}

export async function markAttendance(reservationId: string, attended: boolean) {
  await requireAdmin()
  await db.reservation.update({ where: { id: reservationId }, data: { attended } })
  revalidatePath("/admin/classes")
}
