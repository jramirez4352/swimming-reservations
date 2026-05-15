import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("No autorizado", { status: 401 })
  }

  const [classes, students] = await Promise.all([
    db.class.findMany({
      include: {
        reservations: { where: { status: "ACTIVE" } },
        _count: { select: { waitlistEntries: true } },
      },
      orderBy: { datetime: "desc" },
    }),
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            reservations: { where: { status: "ACTIVE" } },
          },
        },
      },
    }),
  ])

  const fmt = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // Build instructor map
  const instructorMap = new Map<string, { reservations: number; classes: number; capacity: number }>()
  for (const c of classes) {
    const cur = instructorMap.get(c.instructor) ?? { reservations: 0, classes: 0, capacity: 0 }
    instructorMap.set(c.instructor, {
      reservations: cur.reservations + c.reservations.length,
      classes: cur.classes + 1,
      capacity: cur.capacity + c.maxCapacity,
    })
  }

  const rows: string[] = []
  const now = new Date()
  rows.push(`AQUARESERVAS - Reporte generado el ${fmt.format(now)}`)
  rows.push("")

  // Section: Classes
  rows.push("CLASES")
  rows.push("Clase,Instructor,Fecha,Reservas Activas,Capacidad,Lista de Espera,Ocupación %")
  for (const c of classes) {
    const pct = Math.round((c.reservations.length / c.maxCapacity) * 100)
    rows.push(
      [
        `"${c.title.replace(/"/g, '""')}"`,
        `"${c.instructor.replace(/"/g, '""')}"`,
        `"${fmt.format(new Date(c.datetime))}"`,
        c.reservations.length,
        c.maxCapacity,
        c._count.waitlistEntries,
        `${pct}%`,
      ].join(",")
    )
  }

  rows.push("")

  // Section: Instructors
  rows.push("INSTRUCTORES")
  rows.push("Instructor,Clases,Reservas Activas,Capacidad Total,Ocupación %")
  for (const [name, stats] of Array.from(instructorMap.entries()).sort(
    (a, b) => b[1].reservations - a[1].reservations
  )) {
    const pct = stats.capacity > 0 ? Math.round((stats.reservations / stats.capacity) * 100) : 0
    rows.push(
      [
        `"${name.replace(/"/g, '""')}"`,
        stats.classes,
        stats.reservations,
        stats.capacity,
        `${pct}%`,
      ].join(",")
    )
  }

  rows.push("")

  // Section: Students
  rows.push("ALUMNOS")
  rows.push("Nombre,Email,Estado,Reservas Activas,Fecha de Registro")
  for (const s of students) {
    rows.push(
      [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.email}"`,
        s.suspended ? "Suspendido" : "Activo",
        s._count.reservations,
        `"${fmt.format(new Date(s.createdAt))}"`,
      ].join(",")
    )
  }

  const filename = `reporte-aquareservas-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.csv`

  // UTF-8 BOM for Excel compatibility
  const csv = "﻿" + rows.join("\r\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
