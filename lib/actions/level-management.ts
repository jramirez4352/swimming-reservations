"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Sin permiso")
}

const LevelSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido"),
})

export async function createLevel(
  _prev: { error?: string } | null,
  formData: FormData
) {
  await requireAdmin()

  const parsed = LevelSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const maxOrder = await db.level.aggregate({ _max: { order: true } })
  await db.level.create({
    data: { name: parsed.data.name, color: parsed.data.color, order: (maxOrder._max.order ?? 0) + 1 },
  })

  revalidatePath("/admin/levels")
  return { success: true }
}

export async function updateLevel(id: number, name: string, color: string) {
  await requireAdmin()

  const parsed = LevelSchema.safeParse({ name, color })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await db.level.update({ where: { id }, data: { name, color } })
  revalidatePath("/admin/levels")
  revalidatePath("/admin/students")
  return { success: true }
}

export async function deleteLevel(id: number) {
  await requireAdmin()

  const studentsWithLevel = await db.user.count({ where: { level: id } })
  if (studentsWithLevel > 0) {
    return { error: `${studentsWithLevel} alumno(s) tienen este nivel. Reasígnalos antes de eliminar.` }
  }

  await db.level.delete({ where: { id } })
  revalidatePath("/admin/levels")
  return { success: true }
}

export async function seedDefaultLevels() {
  await requireAdmin()

  const defaults = [
    { name: "Nivel 1", color: "#0ea5e9", order: 1 },
    { name: "Nivel 2", color: "#3b82f6", order: 2 },
    { name: "Nivel 3", color: "#10b981", order: 3 },
    { name: "Nivel 4", color: "#f59e0b", order: 4 },
    { name: "Nivel 5", color: "#f97316", order: 5 },
    { name: "Nivel 6", color: "#9333ea", order: 6 },
  ]

  for (const d of defaults) {
    await db.level.upsert({ where: { id: d.order }, update: {}, create: { id: d.order, ...d } })
  }

  revalidatePath("/admin/levels")
  return { success: true }
}
