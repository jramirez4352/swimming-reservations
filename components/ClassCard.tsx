"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WaitlistButton } from "@/components/WaitlistButton"
import { reserveClass, cancelReservation } from "@/lib/actions/reservation"
import { textColor } from "@/lib/levels"

type ClassLevel = { id: number; name: string; color: string }

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
  classLevel?: ClassLevel | null
}

interface ClassCardProps {
  cls: ClassData
  reservationId?: string
  onWaitlist?: boolean
  studentLevel?: number | null
}

export function ClassCard({ cls, reservationId, onWaitlist = false, studentLevel }: ClassCardProps) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [hovered, setHovered] = useState(false)

  const available = cls.maxCapacity - cls.activeReservations
  const occupancyPct = Math.min(Math.round((cls.activeReservations / cls.maxCapacity) * 100), 100)
  const isFull = available <= 0
  const isReserved = !!reservationId

  // Level mismatch: class has a level and student's level doesn't match
  const levelMismatch = !isReserved && cls.classLevel !== null && cls.classLevel !== undefined
    && studentLevel !== null && studentLevel !== undefined
    && cls.classLevel.id !== studentLevel

  const accentColor = isReserved ? "bg-green-500" : isFull ? "bg-red-400" : levelMismatch ? "bg-slate-300" : "bg-blue-500"
  const barColor = occupancyPct >= 100 ? "bg-red-500" : occupancyPct >= 75 ? "bg-amber-500" : "bg-blue-500"
  const pctColor = occupancyPct >= 100 ? "text-red-600" : occupancyPct >= 75 ? "text-amber-600" : "text-blue-600"

  const dateShort = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota",
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(cls.datetime))

  const dateFull = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota",
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(cls.datetime))

  async function handleReserve() {
    setLoading(true); setMsg(null)
    const res = await reserveClass(cls.id)
    if (res.error) setMsg(res.error)
    setLoading(false)
  }

  async function handleCancel() {
    if (!reservationId) return
    setLoading(true); setMsg(null)
    const res = await cancelReservation(reservationId)
    if (res.error) setMsg(res.error)
    setLoading(false)
  }

  return (
    <>
      {/* ── Card ── */}
      <div
        className={`relative flex flex-col rounded-xl border bg-white overflow-hidden cursor-pointer transition-all duration-200 ${
          hovered ? "shadow-lg -translate-y-1 border-blue-200" : "shadow-sm"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setShowDetail(true)}
      >
        {/* Colored top accent */}
        <div className={`h-1 w-full ${accentColor}`} />

        {/* Header */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-snug">{cls.title}</h3>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              {cls.classLevel && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: cls.classLevel.color, color: textColor(cls.classLevel.color) }}
                >
                  {cls.classLevel.name}
                </span>
              )}
              {isReserved ? (
                <Badge className="bg-green-600 text-xs">Reservado</Badge>
              ) : isFull ? (
                <Badge variant="destructive" className="text-xs">Lleno</Badge>
              ) : levelMismatch ? (
                <Badge variant="secondary" className="text-xs bg-slate-200">Nivel distinto</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">{available} lugares</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pb-3 flex-1 space-y-1 text-sm text-muted-foreground">
          <p>👤 {cls.instructor}</p>
          <p>📅 {dateShort}</p>
          <p>⏱ {cls.durationMins} min</p>
        </div>

        {/* Occupancy bar — siempre visible */}
        <div className="px-4 pb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{cls.activeReservations}/{cls.maxCapacity} inscritos</span>
            <span className={`font-semibold ${pctColor}`}>{occupancyPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${occupancyPct}%` }} />
          </div>
        </div>

        {/* Hover preview overlay — cubre solo el contenido, no el footer */}
        <div
          className={`absolute inset-x-0 top-1 bottom-[68px] bg-white/96 px-4 py-3 flex flex-col pointer-events-none transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Vista previa</p>
          {cls.description ? (
            <p className="text-sm text-slate-600 line-clamp-3 mb-3">{cls.description}</p>
          ) : (
            <p className="text-sm text-slate-400 italic mb-3">Sin descripción adicional</p>
          )}
          <div className="mt-auto space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">{cls.activeReservations} de {cls.maxCapacity} lugares</span>
                <span className={`font-bold ${pctColor}`}>{occupancyPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${barColor}`} style={{ width: `${occupancyPct}%` }} />
              </div>
            </div>
            {!!cls.waitlistCount && cls.waitlistCount > 0 && (
              <p className="text-xs text-amber-600 font-medium">
                🕐 {cls.waitlistCount} {cls.waitlistCount === 1 ? "persona" : "personas"} en lista de espera
              </p>
            )}
            <p className="text-xs text-blue-500 font-semibold">Clic para ver todos los detalles →</p>
          </div>
        </div>

        {/* Footer — siempre visible y clickeable */}
        <div
          className="relative z-10 px-4 pb-4 pt-3 border-t bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          {msg && <p className="text-xs text-red-600 mb-2">{msg}</p>}
          {levelMismatch ? (
            <div className="w-full rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-center">
              <p className="text-xs font-semibold text-amber-700">Nivel incompatible</p>
              <p className="text-[11px] text-amber-600 mt-0.5">
                Esta clase es para <strong>{cls.classLevel!.name}</strong>
              </p>
            </div>
          ) : isReserved ? (
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
        </div>
      </div>

      {/* ── Modal de detalle ── */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetail(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-1.5 w-full rounded-t-2xl ${accentColor}`} />

            {/* Modal header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{cls.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">👤 {cls.instructor}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-slate-400 hover:text-slate-700 text-xl leading-none shrink-0"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {isReserved && <Badge className="bg-green-600">Reservado</Badge>}
                {isFull && !isReserved && <Badge variant="destructive">Sin lugares</Badge>}
                {onWaitlist && <Badge variant="outline">En lista de espera</Badge>}
                {!isReserved && !isFull && !onWaitlist && (
                  <Badge variant="secondary">{available} lugar{available !== 1 ? "es" : ""} disponible{available !== 1 ? "s" : ""}</Badge>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {cls.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Descripción</p>
                  <p className="text-sm text-slate-700">{cls.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Fecha y hora</p>
                  <p className="text-sm font-medium capitalize">{dateFull}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Duración</p>
                  <p className="text-sm font-medium">{cls.durationMins} minutos</p>
                </div>
              </div>

              {/* Occupancy chart */}
              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ocupación</p>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Inscritos</span>
                  <span className="font-bold">{cls.activeReservations} / {cls.maxCapacity}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4">
                  <div className={`h-4 rounded-full ${barColor}`} style={{ width: `${occupancyPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>
                    {available > 0
                      ? `${available} lugar${available !== 1 ? "es" : ""} disponible${available !== 1 ? "s" : ""}`
                      : "Sin lugares disponibles"}
                  </span>
                  <span className={`font-semibold ${pctColor}`}>{occupancyPct}%</span>
                </div>
                {!!cls.waitlistCount && cls.waitlistCount > 0 && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-amber-600">
                    <span>🕐</span>
                    <span>{cls.waitlistCount} {cls.waitlistCount === 1 ? "persona" : "personas"} en lista de espera</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div>
                {msg && <p className="text-xs text-red-600 mb-2">{msg}</p>}
                {levelMismatch ? (
                  <div className="w-full rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-amber-700">Nivel incompatible</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Esta clase es para <strong>{cls.classLevel!.name}</strong>. Tu nivel actual es diferente. Contacta a tu profesor si crees que hay un error.
                    </p>
                  </div>
                ) : isReserved ? (
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
