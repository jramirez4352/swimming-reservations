"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autenticado")
  return session.user.id
}

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().min(8, "Ingresa un número de teléfono válido"),
  city: z.string().min(2, "Ingresa tu ciudad"),
  address: z.string().optional(),
})

export async function updateName(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const userId = await requireAuth()

  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    address: formData.get("address") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await db.user.update({ where: { id: userId }, data: parsed.data })
  revalidatePath("/profile")
  return { success: true }
}

const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export async function updatePassword(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const userId = await requireAuth()

  const parsed = UpdatePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "Usuario no encontrado" }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password)
  if (!valid) return { error: "La contraseña actual es incorrecta" }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
  await db.user.update({ where: { id: userId }, data: { password: hashed } })

  return { success: true }
}
