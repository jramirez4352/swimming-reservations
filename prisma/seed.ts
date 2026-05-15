import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"

const adapter = new PrismaBetterSqlite3({ url: path.resolve("dev.db") })
const db = new PrismaClient({ adapter })

async function main() {
  const adminHash = await bcrypt.hash("admin123", 12)
  const studentHash = await bcrypt.hash("alumno123", 12)

  const admin = await db.user.upsert({
    where: { email: "admin@pool.com" },
    update: {},
    create: { name: "Administrador", email: "admin@pool.com", password: adminHash, role: "ADMIN" },
  })

  const student1 = await db.user.upsert({
    where: { email: "juan@example.com" },
    update: {},
    create: { name: "Juan García", email: "juan@example.com", password: studentHash },
  })

  const student2 = await db.user.upsert({
    where: { email: "maria@example.com" },
    update: {},
    create: { name: "María López", email: "maria@example.com", password: studentHash },
  })

  const now = new Date()
  const day = (offset: number, hour: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() + offset)
    d.setHours(hour, 0, 0, 0)
    return d
  }

  const classes = await Promise.all([
    db.class.create({
      data: {
        title: "Natación para principiantes",
        description: "Aprende las técnicas básicas de natación en un ambiente relajado",
        instructor: "Carlos Méndez",
        datetime: day(1, 9),
        durationMins: 60,
        maxCapacity: 10,
      },
    }),
    db.class.create({
      data: {
        title: "Natación avanzada",
        description: "Perfecciona tu estilo y mejora tu velocidad",
        instructor: "Ana Torres",
        datetime: day(1, 11),
        durationMins: 90,
        maxCapacity: 8,
      },
    }),
    db.class.create({
      data: {
        title: "Aqua aeróbics",
        description: "Ejercicio cardiovascular divertido en el agua",
        instructor: "Laura Vega",
        datetime: day(2, 10),
        durationMins: 45,
        maxCapacity: 15,
      },
    }),
    db.class.create({
      data: {
        title: "Nado libre",
        description: "Sesión de natación libre con instructor disponible",
        instructor: "Carlos Méndez",
        datetime: day(3, 8),
        durationMins: 60,
        maxCapacity: 20,
      },
    }),
    db.class.create({
      data: {
        title: "Natación terapéutica",
        description: "Indicada para rehabilitación y movilidad",
        instructor: "Dr. Roberto Soto",
        datetime: day(4, 16),
        durationMins: 50,
        maxCapacity: 6,
      },
    }),
  ])

  await Promise.all([
    db.reservation.upsert({
      where: { userId_classId: { userId: student1.id, classId: classes[0].id } },
      update: { status: "ACTIVE" },
      create: { userId: student1.id, classId: classes[0].id },
    }),
    db.reservation.upsert({
      where: { userId_classId: { userId: student1.id, classId: classes[2].id } },
      update: { status: "ACTIVE" },
      create: { userId: student1.id, classId: classes[2].id },
    }),
    db.reservation.upsert({
      where: { userId_classId: { userId: student2.id, classId: classes[0].id } },
      update: { status: "ACTIVE" },
      create: { userId: student2.id, classId: classes[0].id },
    }),
    db.reservation.upsert({
      where: { userId_classId: { userId: student2.id, classId: classes[1].id } },
      update: { status: "ACTIVE" },
      create: { userId: student2.id, classId: classes[1].id },
    }),
  ])

  console.log("✅ Seed completado")
  console.log("  Admin:   admin@pool.com / admin123")
  console.log("  Alumno1: juan@example.com / alumno123")
  console.log("  Alumno2: maria@example.com / alumno123")
  console.log(`  Clases creadas: ${classes.length}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
