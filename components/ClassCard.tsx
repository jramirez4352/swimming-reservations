"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WaitlistButton } from "@/components/WaitlistButton"
import { reserveClass, cancelReservation } from "@/lib/actions/reservation"

type ClassData = {
  id: string
  title: string
  description: string | null
  instructor: string
  datetime: Date
  durationMins: number
  maxCapacity: number
  activeReservations: number
  waitlistCount?: number
}

interface ClassCardProps {
  cls: ClassData
  reservationId?: string
  onWaitlist?: boolean
}

export function ClassCard({ cls, reservationId, onWaitlist = false }: ClassCardProps) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const available = cls.maxCapacity - cls.activeReservations
  const occupancyPct = Math.min(Math.round((cls.activeReservations / cls.maxCapacity) * 100), 100)
  const isFull = available <= 0
  const isReserved = !!reservationId

  const barColor =
    occupancyPct >= 100 ? "bg-red-500" : occupancyPct >= 75 ? "bg-amber-500" : "bg-blue-500"
  const pctColor =
    occupancyPct >= 100 ? "text-red-600" : occupancyPct >= 75 ? "text-amber-600" : "text-blue-600"

  const dateShort = new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(cls.datetime))

  const dateFull = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(cls.datetime))

  async function handleReserve() {
    setLoading(true)
    setMsg(null)
    const res = await reserveClass(cls.id)
    if (res.error) setMsg(res.error)
    setLoading(false)
  }

  async function handleCancel() {
    if (!reservationId) return
    setLoading(true)
    setMsg(null)
    const res = await cancelReservation(reservationId)
    if (res.error) setMsg(res.error)
    setLoading(false)
  }

  return (
    <>
      {/* Card with hover mini-chart */}
      <div className="group cursor-pointer" onClick={() => setShowDetail(true)}>
        <Card className="flex flex-col h-full transition-all group-hover:shadow-md group-hover:border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base leading-snug">{cls.title}</CardTitle>
              {isReserved ? (
                <Badge className="shrink-0 bg-green-600">Reservado</Badge>
              ) : isFull ? (
                <Badge variant="destructive" className="shrink-0">Lleno</Badge>
              ) : (
                <Badge variant="secondary" className="shrink-0">{available} lugares</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-1 text-sm text-muted-foreground">
            {cls.description && <p className="line-clamp-2">{cls.description}</p>}
            <p>👤 {cls.instructor}</p>
            <p>📅 {dateShort}</p>
            <p>⏱ {cls.durationMins} min</p>

            {/* Mini chart — visible on hover */}
            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex justify-between text-xs mb-1">
                <span>{cls.activeReservations}/{cls.maxCapacity} inscritos</span>
                <span className={pctColor}>{occupancyPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${occupancyPct}%` }} />
              </div>
              <p className="text-center text-[11px] mt-1.5 text-slate-400">Clic para ver detalles →</p>
            </div>
          </CardContent>

          <CardFooter
            className="flex flex-col gap-2 pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            {msg && <p className="text-xs text-red-600 w-full">{msg}</p>}
            {isReserved ? (
              <Button variant="outline" size="sm" className="w-full" onClick={handleCancel} disabled={loading}>
                {loading ? "Cancelando..." : "Cancelar reserva"}
              </Button>
            ) : isFull ? (
              <WaitlistButton classId={cls.id} onWaitlist={onWaitlist} />
            ) : (
              <Button size="sm" className="w-full" onClick={handleReserve} disabled={loading}>
                {loading ? "Reservando..." : "Reservar"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetail(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{cls.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">👤 {cls.instructor}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-slate-400 hover:text-slate-700 text-xl leading-none shrink-0 mt-0.5"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {isReserved && <Badge className="bg-green-600">Reservado</Badge>}
                {isFull && !isReserved && <Badge variant="destructive">Sin lugares</Badge>}
                {onWaitlist && <Badge variant="outline">En lista de espera</Badge>}
                {!isReserved && !isFull && !onWaitlist && (
                  <Badge variant="secondary">{available} lugares disponibles</Badge>
                )}
              </div>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              {cls.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Descripción</p>
                  <p className="text-sm text-slate-700">{cls.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Fecha y hora</p>
                  <p className="text-sm font-medium capitalize">{dateFull}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Duración</p>
                  <p className="text-sm font-medium">{cls.durationMins} minutos</p>
                </div>
              </div>

              {/* Occupancy chart */}
              <div className="rounded-lg border p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ocupación</p>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Inscritos</span>
                  <span className="font-semibold">{cls.activeReservations} / {cls.maxCapacity}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${barColor}`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span>
                    {available > 0
                      ? `${available} lugar${available !== 1 ? "es" : ""} disponible${available !== 1 ? "s" : ""}`
                      : "Sin lugares disponibles"}
                  </span>
                  <span className={`font-medium ${pctColor}`}>{occupancyPct}%</span>
                </div>
                {cls.waitlistCount !== undefined && cls.waitlistCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                    🕐 {cls.waitlistCount} {cls.waitlistCount === 1 ? "persona" : "personas"} en lista de espera
                  </p>
                )}
              </div>

              {/* Action */}
              <div>
                {msg && <p className="text-xs text-red-600 mb-2">{msg}</p>}
                {isReserved ? (
                  <Button variant="outline" className="w-full" onClick={handleCancel} disabled={loading}>
                    {loading ? "Cancelando..." : "Cancelar reserva"}
                  </Button>
                ) : isFull ? (
                  <WaitlistButton classId={cls.id} onWaitlist={onWaitlist} />
                ) : (
                  <Button className="w-full" onClick={handleReserve} disabled={loading}>
                    {loading ? "Reservando..." : "Reservar clase"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
