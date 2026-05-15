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
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["STUDENT", "PROFESOR", "ADMIN"]),
})

export async function createUser(
  _prev: { error?: string } | null,
  formData: FormData
) {
  await requireAdmin()

  const parsed = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    city: formData.get("city") || undefined,
    address: formData.get("address") || undefined,
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
      phone: parsed.data.phone,
      city: parsed.data.city,
      address: parsed.data.address,
      password: hashed,
      role: parsed.data.role,
    },
  })

  revalidatePath("/admin/students")
  redirect("/admin/students")
}

const SetPasswordSchema = z.object({
  newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export async function adminSetPassword(
  userId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  await requireAdmin()

  const parsed = SetPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
  await db.user.update({ where: { id: userId }, data: { password: hashed } })
  return { success: true }
}

const UpdateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
})

export async function adminUpdateUser(
  userId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  await requireAdmin()

  const parsed = UpdateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    city: formData.get("city") || undefined,
    address: formData.get("address") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const emailTaken = await db.user.findFirst({
    where: { email: parsed.data.email, NOT: { id: userId } },
  })
  if (emailTaken) return { error: "Ese email ya está en uso por otro usuario" }

  await db.user.update({ where: { id: userId }, data: parsed.data })
  revalidatePath(`/admin/students/${userId}`)
  revalidatePath("/admin/students")
  return { success: true }
}

export async function changeUserRole(userId: string, role: string) {
  await requireAdmin()
  await db.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/students")
  revalidatePath(`/admin/students/${userId}`)
  return { success: true }
}

export async function toggleCanCreateClasses(userId: string, enabled: boolean) {
  await requireAdmin()
  await db.user.update({ where: { id: userId }, data: { canCreateClasses: enabled } })
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
