import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { ClassCard } from "@/components/ClassCard"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const reservations = await db.reservation.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: {
      class: {
        include: {
          reservations: { where: { status: "ACTIVE" }, select: { id: true } },
          _count: { select: { waitlistEntries: true } },
        },
      },
    },
    orderBy: { class: { datetime: "asc" } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Mis Reservas</h1>
      <p className="text-muted-foreground mb-6">
        Hola, <strong>{session.user.name}</strong>. Tienes {reservations.length} reserva(s) activa(s).
      </p>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tienes reservas activas.{" "}
            <a href="/classes" className="text-blue-600 hover:underline">Ver clases disponibles</a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations.map((r) => (
            <ClassCard
              key={r.id}
              cls={{
                ...r.class,
                activeReservations: r.class.reservations.length,
                waitlistCount: r.class._count.waitlistEntries,
              }}
              reservationId={r.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
