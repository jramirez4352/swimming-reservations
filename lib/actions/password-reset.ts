"use server"

import crypto from "crypto"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"

export async function requestPasswordReset(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  if (!email) return { error: "Ingresa tu email" }

  const user = await db.user.findUnique({ where: { email } })

  // Siempre respuesta positiva para no revelar si el email existe
  if (!user) return { success: true }

  // Invalida tokens anteriores no usados
  await db.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  })

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await db.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  })

  const resetUrl = `${process.env.NEXTAUTH_URL ?? "https://swimming-reservations.vercel.app"}/reset-password/${token}`
  await sendPasswordResetEmail({ name: user.name, email: user.email }, resetUrl)

  return { success: true }
}

const ResetSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export async function resetPassword(
  token: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const record = await db.passwordResetToken.findUnique({ where: { token } })

  if (!record || record.used || record.expiresAt < new Date()) {
    return { error: "El enlace es inválido o ya expiró. Solicita uno nuevo." }
  }

  const parsed = ResetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const hashed = await bcrypt.hash(parsed.data.password, 12)

  await db.user.update({ where: { id: record.userId }, data: { password: hashed } })
  await db.passwordResetToken.update({ where: { token }, data: { used: true } })

  return { success: true }
}
