"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function requireProfesor() {
  const session = await auth()
  if (!session?.user?.id || !["PROFESOR", "ADMIN"].includes(session.user.role ?? "")) {
    throw new Error("Sin permiso")
  }
  return session.user.id
}

const MessageSchema = z.object({
  toUserId: z.string().min(1, "Selecciona un alumno"),
  subject: z.string().min(2, "El asunto es requerido"),
  content: z.string().min(5, "El mensaje es muy corto"),
})

export async function sendMessage(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const fromUserId = await requireProfesor()

  const parsed = MessageSchema.safeParse({
    toUserId: formData.get("toUserId"),
    subject: formData.get("subject"),
    content: formData.get("content"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Verify recipient is enrolled in one of the professor's classes
  const myClasses = await db.class.findMany({
    where: { instructorUserId: fromUserId },
    select: { id: true },
  })
  const myClassIds = myClasses.map((c) => c.id)

  const isEnrolled = await db.reservation.findFirst({
    where: {
      userId: parsed.data.toUserId,
      classId: { in: myClassIds },
      status: "ACTIVE",
    },
  })
  if (!isEnrolled) return { error: "El alumno no está inscrito en ninguna de tus clases" }

  await db.message.create({
    data: {
      fromUserId,
      toUserId: parsed.data.toUserId,
      subject: parsed.data.subject,
      content: parsed.data.content,
    },
  })

  revalidatePath("/profesor/messages")
  revalidatePath("/messages")
  return { success: true }
}

export async function markMessageRead(messageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Sin permiso")

  await db.message.updateMany({
    where: { id: messageId, toUserId: session.user.id },
    data: { read: true },
  })
  revalidatePath("/messages")
}
