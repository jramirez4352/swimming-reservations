"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendReservationConfirmation, sendReservationCancellation } from "@/lib/email"
import { notifyWaitlist } from "@/lib/actions/waitlist"

export async function reserveClass(classId: string) {
  const session = await auth()
  if (!session) return { error: "No autenticado" }

  const [cls, user] = await Promise.all([
    db.class.findUnique({
      where: { id: classId },
      include: {
        reservations: { where: { status: "ACTIVE" } },
        level: true,
      },
    }),
    db.user.findUnique({ where: { id: session.user.id }, select: { level: true, name: true, email: true } }),
  ])

  if (!cls) return { error: "Clase no encontrada" }
  if (cls.reservations.length >= cls.maxCapacity) return { error: "La clase está llena" }

  // Level check
  if (cls.levelId !== null && cls.levelId !== undefined) {
    if (!user?.level) {
      return { error: `Esta clase es para ${cls.level?.name ?? `Nivel ${cls.levelId}`}. Aún no tienes un nivel asignado. Contacta a tu profesor.` }
    }
    if (user.level !== cls.levelId) {
      return { error: `Esta clase es para ${cls.level?.name ?? `Nivel ${cls.levelId}`}. Tu nivel actual es diferente. Contacta a tu profesor si crees que hay un error.` }
    }
  }

  const existing = await db.reservation.findUnique({
    where: { userId_classId: { userId: session.user.id, classId } },
  })

  if (existing) {
    if (existing.status === "ACTIVE") return { error: "Ya tienes una reserva activa para esta clase" }
    await db.reservation.update({ where: { id: existing.id }, data: { status: "ACTIVE" } })
  } else {
    await db.reservation.create({ data: { userId: session.user.id, classId } })
  }

  // Remove from waitlist if they were on it
  await db.waitlistEntry.deleteMany({ where: { userId: session.user.id, classId } })

  if (user) await sendReservationConfirmation(user, { ...cls, datetime: new Date(cls.datetime) })

  revalidatePath("/classes")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function cancelReservation(reservationId: string) {
  const session = await auth()
  if (!session) return { error: "No autenticado" }

  const reservation = await db.reservation.findUnique({
    where: { id: reservationId },
    include: { class: true, user: true },
  })
  if (!reservation) return { error: "Reserva no encontrada" }
  if (reservation.userId !== session.user.id) return { error: "Sin permiso" }

  await db.reservation.update({ where: { id: reservationId }, data: { status: "CANCELLED" } })

  await sendReservationCancellation(reservation.user, {
    ...reservation.class,
    datetime: new Date(reservation.class.datetime),
  })

  await notifyWaitlist(reservation.classId)

  revalidatePath("/dashboard")
  revalidatePath("/classes")
  return { success: true }
}

// ── Admin actions ─────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Sin permiso")
}

export async function adminSetReservationStatus(reservationId: string, status: "ACTIVE" | "CANCELLED") {
  await requireAdmin()

  const reservation = await db.reservation.findUnique({
    where: { id: reservationId },
    include: { class: { include: { reservations: { where: { status: "ACTIVE" } } } } },
  })
  if (!reservation) return { error: "Reserva no encontrada" }

  if (status === "ACTIVE") {
    if (reservation.class.reservations.length >= reservation.class.maxCapacity) {
      return { error: "La clase ya está llena, no se puede reactivar" }
    }
  }

  await db.reservation.update({ where: { id: reservationId }, data: { status } })

  if (status === "CANCELLED") {
    await notifyWaitlist(reservation.classId)
  }

  revalidatePath("/admin/reservations")
  revalidatePath("/classes")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function adminDeleteReservation(reservationId: string) {
  await requireAdmin()
  const reservation = await db.reservation.findUnique({ where: { id: reservationId } })
  await db.reservation.delete({ where: { id: reservationId } })
  if (reservation) await notifyWaitlist(reservation.classId)
  revalidatePath("/admin/reservations")
  revalidatePath("/admin/dashboard")
  revalidatePath("/classes")
  return { success: true }
}
