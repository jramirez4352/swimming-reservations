import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EvaluationDisplay } from "@/components/EvaluationDisplay"

export default async function HistoryPage() {
  const session = await auth()
  if (!session) return null

  const reservations = await db.reservation.findMany({
    where: {
      userId: session.user.id,
      class: { datetime: { lt: new Date() } },
    },
    include: {
      class: true,
      evaluation: {
        include: { profesor: { select: { name: true } } },
      },
    },
    orderBy: { class: { datetime: "desc" } },
  })

  const attended  = reservations.filter(r => r.status === "ACTIVE").length
  const cancelled = reservations.filter(r => r.status === "CANCELLED").length

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Historial de clases</h1>
      <p className="text-muted-foreground mb-6">
        {reservations.length} clase(s) en total · {attended} asistidas · {cancelled} canceladas
      </p>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aún no tienes clases pasadas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const dateStr = new Intl.DateTimeFormat("es-MX", {
              weekday: "long", day: "numeric", month: "long",
              year: "numeric", hour: "2-digit", minute: "2-digit",
            }).format(new Date(r.class.datetime))

            return (
              <Card key={r.id} className={r.status === "CANCELLED" ? "opacity-60" : ""}>
                <CardHeader className="py-3 pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{r.class.title}</CardTitle>
                    <Badge
                      variant={r.status === "ACTIVE" ? "default" : "secondary"}
                      className={r.status === "ACTIVE" ? "bg-blue-600" : ""}
                    >
                      {r.status === "ACTIVE" ? "Asistida" : "Cancelada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-3 text-sm text-muted-foreground space-y-2">
                  <div className="space-y-0.5">
                    <p>👤 {r.class.instructor}</p>
                    <p>📅 {dateStr}</p>
                    <p>⏱ {r.class.durationMins} min</p>
                  </div>
                  {r.evaluation && r.status === "ACTIVE" && (
                    <EvaluationDisplay
                      rating={r.evaluation.rating}
                      comment={r.evaluation.comment}
                      profesorName={r.evaluation.profesor.name}
                    />
                  )}
                  {r.status === "ACTIVE" && !r.evaluation && (
                    <p className="text-xs text-slate-400 italic">Sin evaluación aún</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
