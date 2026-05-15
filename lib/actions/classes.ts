"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const ClassSchema = z.object({
  title: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
  instructor: z.string().min(2, "Mínimo 2 caracteres"),
  datetime: z.string().min(1, "Fecha requerida"),
  durationMins: z.coerce.number().int().min(15).max(240),
  maxCapacity: z.coerce.number().int().min(1).max(100),
})

export async function createClass(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Sin permiso" }

  const parsed = ClassSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    instructor: formData.get("instructor"),
    datetime: formData.get("datetime"),
    durationMins: formData.get("durationMins"),
    maxCapacity: formData.get("maxCapacity"),
  })

  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, description, instructor, datetime, durationMins, maxCapacity } = parsed.data

  const instructorUserId = (formData.get("instructorUserId") as string) || null

  const isRecurring = formData.get("isRecurring") === "on"
  const frequency = formData.get("frequency") as "daily" | "weekly"
  const occurrences = Math.min(20, Math.max(2, parseInt(formData.get("occurrences") as string) || 1))

  if (isRecurring && occurrences > 1) {
    const groupId = Math.random().toString(36).slice(2)
    const baseDate = new Date(datetime)
    const stepDays = frequency === "daily" ? 1 : 7

    for (let i = 0; i < occurrences; i++) {
      const d = new Date(baseDate)
      d.setDate(d.getDate() + i * stepDays)
      await db.class.create({
        data: { title, description, instructor, instructorUserId, datetime: d, durationMins, maxCapacity, recurringGroupId: groupId },
      })
    }
  } else {
    await db.class.create({
      data: { title, description, instructor, instructorUserId, datetime: new Date(datetime), durationMins, maxCapacity },
    })
  }

  revalidatePath("/admin/classes")
  revalidatePath("/classes")
  redirect("/admin/classes")
}

export async function updateClass(
  classId: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Sin permiso" }

  const parsed = ClassSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    instructor: formData.get("instructor"),
    datetime: formData.get("datetime"),
    durationMins: formData.get("durationMins"),
    maxCapacity: formData.get("maxCapacity"),
  })

  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { title, description, instructor, datetime, durationMins, maxCapacity } = parsed.data

  const activeReservations = await db.reservation.count({
    where: { classId, status: "ACTIVE" },
  })
  if (maxCapacity < activeReservations) {
    return {
      error: `La capacidad mínima es ${activeReservations} (reservas activas actuales)`,
    }
  }

  await db.class.update({
    where: { id: classId },
    data: { title, description, instructor, datetime: new Date(datetime), durationMins, maxCapacity },
  })

  revalidatePath("/admin/classes")
  revalidatePath("/classes")
  redirect("/admin/classes")
}

export async function deleteClass(classId: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Sin permiso" }

  await db.waitlistEntry.deleteMany({ where: { classId } })
  await db.reservation.deleteMany({ where: { classId } })
  await db.class.delete({ where: { id: classId } })

  revalidatePath("/admin/classes")
  revalidatePath("/classes")
  return { success: true }
}
