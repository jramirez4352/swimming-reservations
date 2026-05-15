"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const EvalSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

export async function saveEvaluation(
  reservationId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.id || !["PROFESOR", "ADMIN"].includes(session.user.role ?? "")) {
    return { error: "Sin permiso" }
  }

  const parsed = EvalSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Professors can only evaluate their own classes
  if (session.user.role === "PROFESOR") {
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: { class: { select: { instructorUserId: true } } },
    })
    if (reservation?.class.instructorUserId !== session.user.id) {
      return { error: "Solo puedes calificar alumnos de tus propias clases" }
    }
  }

  await db.classEvaluation.upsert({
    where: { reservationId },
    update: { rating: parsed.data.rating, comment: parsed.data.comment ?? null, profesorId: session.user.id },
    create: { reservationId, rating: parsed.data.rating, comment: parsed.data.comment ?? null, profesorId: session.user.id },
  })

  revalidatePath("/profesor/classes")
  revalidatePath("/history")
  revalidatePath("/admin/students")
  return { success: true }
}
