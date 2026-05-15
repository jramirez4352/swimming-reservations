import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { ClassCard } from "@/components/ClassCard"
import { ClassFilters } from "@/components/ClassFilters"
import { WeekCalendar } from "@/components/WeekCalendar"
import { Suspense } from "react"

type SearchParams = Promise<{ q?: string; instructor?: string; day?: string; view?: string }>

export default async function ClassesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, instructor, day, view } = await searchParams
  const isCalendar = view === "calendar"
  const session = await auth()
  const now = new Date()

  // Build Prisma where clause
  const where: Record<string, unknown> = { datetime: { gte: now } }
  if (q) where.title = { contains: q }
  if (instructor) where.instructor = instructor

  const studentUser = session
    ? await db.user.findUnique({ where: { id: session.user.id }, select: { level: true } })
    : null

  const classes = await db.class.findMany({
    where,
    orderBy: { datetime: "asc" },
    include: {
      reservations: { where: { status: "ACTIVE" } },
      _count: { select: { waitlistEntries: true } },
      level: true,
    },
  })

  // Filter by day-of-week client-side (SQLite doesn't support strftime in Prisma easily)
  // In calendar view we skip the day filter so all days of the week are visible
  const filtered = day && !isCalendar
    ? classes.filter((cls) => {
        const d = new Date(cls.datetime).getDay() // 0=Sun, 1=Mon…
        const mapped = d === 0 ? 7 : d // convert to 1=Mon…7=Sun
        return mapped === parseInt(day)
      })
    : classes

  const myReservations = session
    ? await db.reservation.findMany({
        where: { userId: session.user.id, status: "ACTIVE" },
        select: { classId: true, id: true },
      })
    : []

  const myWaitlist = session
    ? await db.waitlistEntry.findMany({
        where: { userId: session.user.id },
        select: { classId: true },
      })
    : []

  // Unique instructors for filter select
  const instructors = [...new Set(classes.map((c) => c.instructor))].sort()

  const classesWithCount = filtered.map((cls) => ({
    ...cls,
    activeReservations: cls.reservations.length,
    waitlistCount: cls._count.waitlistEntries,
    classLevel: cls.level ?? null,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clases Disponibles</h1>
      <Suspense>
        <ClassFilters instructors={instructors} />
      </Suspense>

      {isCalendar ? (
        <WeekCalendar
          classes={classesWithCount}
          reservations={myReservations.map((r) => ({ classId: r.classId, id: r.id }))}
          waitlist={myWaitlist.map((w) => w.classId)}
        />
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No hay clases que coincidan con los filtros.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesWithCount.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              reservationId={myReservations.find((r) => r.classId === cls.id)?.id}
              onWaitlist={myWaitlist.some((w) => w.classId === cls.id)}
              studentLevel={studentUser?.level}
            />
          ))}
        </div>
      )}
    </div>
  )
}
