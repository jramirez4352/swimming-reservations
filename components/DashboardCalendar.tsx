"use client"

import { useState } from "react"
import { ClassCard } from "@/components/ClassCard"
import { LevelBadge } from "@/components/LevelBadge"
import { LevelData } from "@/lib/levels"
import Link from "next/link"

const DAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

type ClassItem = {
  id: string
  title: string
  description: string | null
  instructor: string
  datetime: Date
  durationMins: number
  maxCapacity: number
  activeReservations: number
  waitlistCount: number
}

interface Props {
  classes: ClassItem[]
  reservations: { classId: string; id: string }[]
  waitlist: string[]
  userName?: string | null
  studentLevel?: LevelData | null
  studentLevelId?: number | null
}

function getMonthOffset(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday-first
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function DashboardCalendar({ classes, reservations, waitlist, userName, studentLevel, studentLevelId }: Props) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate())
  const [showAll, setShowAll] = useState(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const offset = getMonthOffset(year, month)
  const isThisMonth = year === today.getFullYear() && month === today.getMonth()

  // Map day → classes that day
  const classByDay = new Map<number, ClassItem[]>()
  for (const cls of classes) {
    const d = new Date(cls.datetime)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!classByDay.has(day)) classByDay.set(day, [])
      classByDay.get(day)!.push(cls)
    }
  }

  // Days where user has a reservation (in the viewed month)
  const reservationMap = new Map(reservations.map(r => [r.classId, r.id]))
  const waitlistSet = new Set(waitlist)

  const reservedDays = new Set<number>()
  for (const r of reservations) {
    const cls = classes.find(c => c.id === r.classId)
    if (!cls) continue
    const d = new Date(cls.datetime)
    if (d.getFullYear() === year && d.getMonth() === month) {
      reservedDays.add(d.getDate())
    }
  }

  // Classes for selected day, sorted by time
  const selectedClasses = (classByDay.get(selectedDay) ?? [])
    .slice()
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

  // All active reservations sorted by date (for showAll mode)
  const allReservedClasses = reservations
    .map(r => ({ reservationId: r.id, cls: classes.find(c => c.id === r.classId) }))
    .filter((r): r is { reservationId: string; cls: ClassItem } => !!r.cls)
    .sort((a, b) => new Date(a.cls.datetime).getTime() - new Date(b.cls.datetime).getTime())

  const monthLabel = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", month: "long", year: "numeric" }).format(viewDate)
  const selectedLabel = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota",
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date(year, month, selectedDay))

  const totalActive = reservations.length

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">Inicio</h1>
          {studentLevel && <LevelBadge level={studentLevel} size="lg" />}
        </div>
        <p className="text-muted-foreground mt-1">
          Hola, <strong>{userName}</strong>.{" "}
          {totalActive > 0 ? (
            <>
              Tienes{" "}
              <button
                onClick={() => setShowAll(true)}
                className="text-blue-600 hover:underline font-semibold"
              >
                {totalActive} reserva{totalActive !== 1 ? "s" : ""} activa{totalActive !== 1 ? "s" : ""}
              </button>
              .
            </>
          ) : (
            "No tienes reservas activas."
          )}
        </p>
        </div>

      {/* Calendar card */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6 mb-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedDay(1) }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-lg"
          >
            ‹
          </button>
          <h2 className="text-base font-semibold capitalize">{monthLabel}</h2>
          <button
            onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedDay(1) }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-lg"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} />)}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const isToday = isThisMonth && day === today.getDate()
            const hasClasses = classByDay.has(day)
            const hasReservation = reservedDays.has(day)
            const isSelected = selectedDay === day
            const count = classByDay.get(day)?.length ?? 0

            return (
              <button
                key={day}
                onClick={() => { setSelectedDay(day); setShowAll(false) }}
                disabled={!hasClasses}
                className={`
                  relative flex flex-col items-center justify-center rounded-xl
                  min-h-[48px] sm:min-h-[56px] transition-all duration-150
                  ${isSelected
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : isToday
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-300 font-semibold"
                    : hasClasses
                    ? "hover:bg-slate-50 text-slate-800 cursor-pointer"
                    : "text-slate-300 cursor-default"
                  }
                `}
              >
                <span className="text-sm font-medium leading-none">{day}</span>

                {/* Dots */}
                {hasClasses && (
                  <div className="flex gap-0.5 mt-1">
                    {hasReservation && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-green-300" : "bg-green-500"}`} />
                    )}
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/60" : "bg-blue-400"}`} />
                  </div>
                )}

                {/* Class count badge */}
                {count > 1 && (
                  <span className={`text-[9px] leading-none mt-0.5 ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                    {count} clases
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" /> Hay clases
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /> Tienes reserva
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-lg border-2 border-blue-300 bg-blue-50 shrink-0" /> Hoy
          </span>
        </div>
      </div>

      {/* Day detail / All reservations */}
      {showAll ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Mis reservas activas</h2>
            <button
              onClick={() => setShowAll(false)}
              className="text-xs text-muted-foreground hover:text-slate-700 flex items-center gap-1"
            >
              ← Volver al calendario
            </button>
          </div>
          {allReservedClasses.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-center">
              <p className="text-muted-foreground text-sm">No tienes reservas activas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allReservedClasses.map(({ reservationId, cls }) => (
                <ClassCard
                  key={reservationId}
                  cls={cls}
                  reservationId={reservationId}
                  onWaitlist={waitlistSet.has(cls.id)}
                  studentLevel={studentLevelId}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold capitalize">{selectedLabel}</h2>
            {selectedClasses.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {selectedClasses.length} clase{selectedClasses.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {selectedClasses.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-center">
              <p className="text-muted-foreground text-sm mb-2">No hay clases este día.</p>
              <Link href="/classes" className="text-sm text-blue-600 hover:underline">
                Ver todas las clases →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedClasses.map(cls => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  reservationId={reservationMap.get(cls.id)}
                  onWaitlist={waitlistSet.has(cls.id)}
                  studentLevel={studentLevelId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
