import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

export default async function ProfesorMessagesPage() {
  const session = await auth()
  if (!session) return null

  const [sent, received] = await Promise.all([
    db.message.findMany({
      where: { fromUserId: session.user.id },
      include: { to: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.message.findMany({
      where: { toUserId: session.user.id },
      include: { from: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mensajes</h1>
        <Link href="/profesor/messages/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">+ Nuevo mensaje</Button>
        </Link>
      </div>

      {received.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-2">Recibidos</h2>
          <div className="rounded-md border bg-white overflow-hidden divide-y">
            {received.map(m => (
              <div key={m.id} className={`px-4 py-3 ${!m.read ? "bg-emerald-50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{m.subject} {!m.read && <Badge className="bg-emerald-600 text-[10px] ml-1">Nuevo</Badge>}</p>
                    <p className="text-xs text-muted-foreground">De: {m.from.name}</p>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{m.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{fmt.format(new Date(m.createdAt))}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold mb-2">Enviados ({sent.length})</h2>
        {sent.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-center text-muted-foreground text-sm">
            No has enviado ningún mensaje. Usa "Nuevo mensaje" para contactar a tus alumnos.
          </div>
        ) : (
          <div className="rounded-md border bg-white overflow-hidden divide-y">
            {sent.map(m => (
              <div key={m.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{m.subject}</p>
                    <p className="text-xs text-muted-foreground">Para: {m.to.name} ({m.to.email})</p>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{m.content}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">{fmt.format(new Date(m.createdAt))}</span>
                    {m.read
                      ? <Badge variant="secondary" className="text-[10px]">Leído</Badge>
                      : <Badge variant="outline"  className="text-[10px]">Sin leer</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
