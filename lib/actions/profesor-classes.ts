"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireProfesor() {
  const session = await auth()
  if (!session?.user?.id || !["PROFESOR", "ADMIN"].includes(session.user.role ?? "")) {
    throw new Error("Sin permiso")
  }
  return session.user.id
}

const EditSchema = z.object({
  title: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
  datetime: z.string().min(1, "Fecha requerida"),
  durationMins: z.coerce.number().int().min(15).max(240),
  maxCapacity: z.coerce.number().int().min(1).max(100),
})

export async function updateProfesorClass(
  classId: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  const userId = await requireProfesor()

  const cls = await db.class.findUnique({ where: { id: classId } })
  if (!cls || cls.instructorUserId !== userId) return { error: "No tienes permiso para editar esta clase" }

  const parsed = EditSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    datetime: formData.get("datetime"),
    durationMins: formData.get("durationMins"),
    maxCapacity: formData.get("maxCapacity"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const activeReservations = await db.reservation.count({ where: { classId, status: "ACTIVE" } })
  if (parsed.data.maxCapacity < activeReservations) {
    return { error: `La capacidad mínima es ${activeReservations} (reservas activas actuales)` }
  }

  await db.class.update({
    where: { id: classId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      datetime: new Date(parsed.data.datetime),
      durationMins: parsed.data.durationMins,
      maxCapacity: parsed.data.maxCapacity,
    },
  })

  revalidatePath("/profesor/classes")
  revalidatePath("/classes")
  redirect("/profesor/classes")
}
