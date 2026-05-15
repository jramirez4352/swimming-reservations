import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CancelButton } from "@/components/CancelButton"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const reservations = await db.reservation.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: { class: true },
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
        <div className="space-y-3">
          {reservations.map((r) => {
            const dateStr = new Intl.DateTimeFormat("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(r.class.datetime))

            return (
              <Card key={r.id}>
                <CardHeader className="py-3 pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{r.class.title}</CardTitle>
                    <Badge variant="default" className="bg-green-600">Activa</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-3 flex items-end justify-between gap-4">
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>👤 {r.class.instructor}</p>
                    <p>📅 {dateStr}</p>
                    <p>⏱ {r.class.durationMins} min</p>
                  </div>
                  <CancelButton reservationId={r.id} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
