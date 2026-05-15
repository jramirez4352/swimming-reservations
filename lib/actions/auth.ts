"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { signIn, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

const RegisterSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export async function register(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, email, password } = parsed.data
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: "Este email ya está registrado" }

  const hashed = await bcrypt.hash(password, 12)
  await db.user.create({ data: { name, email, password: hashed } })

  redirect("/login?registered=1")
}

export async function login(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const user = await db.user.findUnique({ where: { email } })
  if (!user) return { error: "Email o contraseña incorrectos" }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: "Email o contraseña incorrectos" }

  if (user.suspended) return { error: "Tu cuenta ha sido suspendida. Contacta al administrador." }

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch (err) {
    if (err instanceof AuthError) return { error: "Email o contraseña incorrectos" }
    throw err
  }

  redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard")
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}
