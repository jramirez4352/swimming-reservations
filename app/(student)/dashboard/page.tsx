import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { DashboardCalendar } from "@/components/DashboardCalendar"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const now = new Date()
  const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, 1)

  const student = await db.user.findUnique({ where: { id: session.user.id }, select: { level: true } })
  const allLevels = await db.level.findMany({ orderBy: { order: "asc" } })
  const studentLevelData = allLevels.find(l => l.id === student?.level) ?? null

  const [classes, myReservations, myWaitlist, activeReservationsWithClass] = await Promise.all([
    // Clases futuras para el calendario
    db.class.findMany({
      where: { datetime: { gte: now, lte: threeMonthsLater } },
      include: {
        reservations: { where: { status: "ACTIVE" }, select: { id: true } },
        _count: { select: { waitlistEntries: true } },
        level: true,
      },
      orderBy: { datetime: "asc" },
    }),
    db.reservation.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { classId: true, id: true },
    }),
    db.waitlistEntry.findMany({
      where: { userId: session.user.id },
      select: { classId: true },
    }),
    // Reservas activas con su clase completa (sin filtro de fecha) para el panel "Mis reservas"
    db.reservation.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: {
        class: {
          include: {
            reservations: { where: { status: "ACTIVE" }, select: { id: true } },
            _count: { select: { waitlistEntries: true } },
            level: true,
          },
        },
      },
      orderBy: { class: { datetime: "asc" } },
    }),
  ])

  const classesWithCount = classes.map(c => ({
    ...c,
    activeReservations: c.reservations.length,
    waitlistCount: c._count.waitlistEntries,
    classLevel: c.level ?? null,
  }))

  const allActiveReservations = activeReservationsWithClass.map(r => ({
    reservationId: r.id,
    cls: {
      ...r.class,
      activeReservations: r.class.reservations.length,
      waitlistCount: r.class._count.waitlistEntries,
      classLevel: r.class.level ?? null,
    },
  }))

  return (
    <DashboardCalendar
      classes={classesWithCount}
      reservations={myReservations}
      waitlist={myWaitlist.map(w => w.classId)}
      userName={session.user.name}
      studentLevel={studentLevelData}
      studentLevelId={student?.level}
      allActiveReservations={allActiveReservations}
    />
  )
}
