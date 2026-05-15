"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendWaitlistNotification, sendWaitlistConfirmation } from "@/lib/email"

export async function joinWaitlist(classId: string) {
  const session = await auth()
  if (!session) return { error: "No autenticado" }

  const existing = await db.waitlistEntry.findUnique({
    where: { userId_classId: { userId: session.user.id, classId } },
  })
  if (existing) return { error: "Ya estás en la lista de espera" }

  const reservation = await db.reservation.findUnique({
    where: { userId_classId: { userId: session.user.id, classId } },
  })
  if (reservation?.status === "ACTIVE") return { error: "Ya tienes una reserva activa" }

  const cls = await db.class.findUnique({ where: { id: classId } })
  if (!cls) return { error: "Clase no encontrada" }

  await db.waitlistEntry.create({ data: { userId: session.user.id, classId } })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user) await sendWaitlistConfirmation(user, { ...cls, datetime: new Date(cls.datetime) })

  revalidatePath("/classes")
  return { success: true }
}

export async function leaveWaitlist(classId: string) {
  const session = await auth()
  if (!session) return { error: "No autenticado" }

  await db.waitlistEntry.deleteMany({
    where: { userId: session.user.id, classId },
  })

  revalidatePath("/classes")
  return { success: true }
}

export async function notifyWaitlist(classId: string) {
  const first = await db.waitlistEntry.findFirst({
    where: { classId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      class: { select: { title: true, instructor: true, datetime: true, durationMins: true } },
    },
  })
  if (!first) return

  await sendWaitlistNotification(first.user, {
    ...first.class,
    datetime: new Date(first.class.datetime),
  })

  await db.waitlistEntry.delete({ where: { id: first.id } })
}
