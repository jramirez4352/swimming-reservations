"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
}

interface Props {
  classes: ClassData[]
  reservations: { classId: string; id: string }[]
  waitlist: string[]
}

const DAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

function getMondayOf(d: Date): Date {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  return date
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d)
  date.setDate(date.getDate() + n)
  return date
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function ClassSlot({
  cls,
  reservationId,
  onWaitlist,
}: {
  cls: ClassData
  reservationId?: string
  onWaitlist: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const available = cls.maxCapacity - cls.activeReservations
  const isFull = available <= 0
  const isReserved = !!reservationId

  const timeStr = new Intl.DateTimeFormat("es-MX", {
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
    <div
      className={`rounded border p-2 text-xs space-y-1.5 ${
        isReserved
          ? "bg-green-50 border-green-300"
          : isFull
          ? "bg-slate-50 border-slate-200"
          : "bg-white border-slate-200 hover:border-slate-300"
      }`}
    >
      <p className="font-semibold text-slate-800 leading-tight">{cls.title}</p>
      <p className="text-slate-500">
        {timeStr} · {cls.durationMins}min
      </p>
      <p className="text-slate-500 truncate">👤 {cls.instructor}</p>

      {isReserved ? (
        <>
          <Badge className="bg-green-600 text-[10px] h-4 px-1.5">Reservado</Badge>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-6 text-[10px]"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? "..." : "Cancelar"}
          </Button>
        </>
      ) : isFull ? (
        <>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Lleno</Badge>
          <WaitlistButton classId={cls.id} onWaitlist={onWaitlist} />
        </>
      ) : (
        <>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            {available} lugar{available !== 1 ? "es" : ""}
          </Badge>
          <Button
            size="sm"
            className="w-full h-6 text-[10px]"
            onClick={handleReserve}
            disabled={loading}
          >
            {loading ? "..." : "Reservar"}
          </Button>
        </>
      )}
      {msg && <p className="text-red-600 mt-1">{msg}</p>}
    </div>
  )
}

export function WeekCalendar({ classes, reservations, waitlist }: Props) {
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()))

  const reservationMap = new Map(reservations.map((r) => [r.classId, r.id]))
  const waitlistSet = new Set(waitlist)

  const today = new Date()
  const weekEnd = addDays(weekStart, 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const isCurrentWeek = isSameDay(getMondayOf(today), weekStart)

  const startFmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(weekStart)
  const endFmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(addDays(weekStart, 6))
  const weekLabel = `${startFmt} – ${endFmt}`

  const byDay = days.map((day) => ({
    day,
    items: classes
      .filter((c) => {
        const d = new Date(c.datetime)
        return d >= weekStart && d < weekEnd && isSameDay(d, day)
      })
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()),
  }))

  const totalThisWeek = byDay.reduce((sum, d) => sum + d.items.length, 0)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setWeekStart((w) => addDays(w, -7))}>
          ← Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => setWeekStart((w) => addDays(w, 7))}>
          Siguiente →
        </Button>
        {!isCurrentWeek && (
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(getMondayOf(new Date()))}>
            Hoy
          </Button>
        )}
        <span className="text-sm text-muted-foreground ml-1">{weekLabel}</span>
        {totalThisWeek === 0 && (
          <span className="text-sm text-muted-foreground ml-2">— Sin clases esta semana</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1.5 min-w-[700px]">
          {byDay.map(({ day, items }, i) => {
            const isToday = isSameDay(day, today)
            const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric" }).format(day)
            const monthShort = new Intl.DateTimeFormat("es-MX", { month: "short" }).format(day)

            return (
              <div key={i} className="flex flex-col gap-1">
                <div
                  className={`rounded py-1.5 px-1 text-center text-xs font-medium mb-0.5 ${
                    isToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <div className="uppercase tracking-wide">{DAY_SHORT[i]}</div>
                  <div className="text-base font-bold leading-tight">{dayNum}</div>
                  <div className="text-[10px] opacity-70 capitalize">{monthShort}</div>
                </div>

                {items.length === 0 ? (
                  <div className="rounded border border-dashed border-slate-200 min-h-[64px]" />
                ) : (
                  <div className="space-y-1">
                    {items.map((cls) => (
                      <ClassSlot
                        key={cls.id}
                        cls={cls}
                        reservationId={reservationMap.get(cls.id)}
                        onWaitlist={waitlistSet.has(cls.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
