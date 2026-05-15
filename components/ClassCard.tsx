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
}

interface ClassCardProps {
  cls: ClassData
  reservationId?: string
  onWaitlist?: boolean
}

export function ClassCard({ cls, reservationId, onWaitlist = false }: ClassCardProps) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const available = cls.maxCapacity - cls.activeReservations
  const isFull = available <= 0
  const isReserved = !!reservationId

  const dateStr = new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
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
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{cls.title}</CardTitle>
          {isReserved ? (
            <Badge variant="default" className="shrink-0 bg-green-600">Reservado</Badge>
          ) : isFull ? (
            <Badge variant="destructive" className="shrink-0">Lleno</Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">{available} lugares</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-1 text-sm text-muted-foreground">
        {cls.description && <p>{cls.description}</p>}
        <p>👤 {cls.instructor}</p>
        <p>📅 {dateStr}</p>
        <p>⏱ {cls.durationMins} min</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-2">
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
  )
}
