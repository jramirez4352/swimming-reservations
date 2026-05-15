"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function requireProfesorOrAdmin() {
  const session = await auth()
  if (!session?.user?.role || !["ADMIN", "PROFESOR"].includes(session.user.role)) {
    throw new Error("Sin permiso")
  }
}

export async function markAttendance(
  reservationId: string,
  status: "attended" | "absent" | "pending"
) {
  await requireProfesorOrAdmin()
  await db.reservation.update({
    where: { id: reservationId },
    data: {
      attended: status === "attended",
      absent:   status === "absent",
    },
  })
  revalidatePath("/admin/classes")
  revalidatePath("/profesor/classes")
}
