"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Sin permiso")
}

const CreateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["STUDENT", "ADMIN"]),
})

export async function createUser(
  _prev: { error?: string } | null,
  formData: FormData
) {
  await requireAdmin()

  const parsed = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { error: "Este email ya está registrado" }

  const hashed = await bcrypt.hash(parsed.data.password, 12)
  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      role: parsed.data.role,
    },
  })

  revalidatePath("/admin/students")
  redirect("/admin/students")
}

export async function changeUserRole(userId: string, role: string) {
  await requireAdmin()
  await db.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/students")
  revalidatePath(`/admin/students/${userId}`)
  return { success: true }
}

export async function toggleRegistration(enabled: boolean) {
  await requireAdmin()
  await db.settings.upsert({
    where: { id: "main" },
    update: { allowRegistration: enabled },
    create: { id: "main", allowRegistration: enabled },
  })
  revalidatePath("/admin/settings")
  revalidatePath("/register")
  return { success: true }
}
