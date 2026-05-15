"use client"

import { useActionState, useState } from "react"
import { createClass } from "@/lib/actions/classes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewClassPage() {
  const [state, action, pending] = useActionState(createClass, null)
  const [isRecurring, setIsRecurring] = useState(false)

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/classes" className="text-sm text-muted-foreground hover:underline">
          ← Volver a clases
        </Link>
        <h1 className="text-2xl font-bold">Nueva Clase</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la clase</CardTitle>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{state.error}</div>
          )}
          <form action={action} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" placeholder="Natación para principiantes" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" name="description" placeholder="Breve descripción de la clase" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="instructor">Instructor</Label>
              <Input id="instructor" name="instructor" placeholder="Nombre del instructor" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="datetime">Fecha y hora de la primera clase</Label>
              <Input id="datetime" name="datetime" type="datetime-local" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="durationMins">Duración (min)</Label>
                <Input id="durationMins" name="durationMins" type="number" defaultValue={60} min={15} max={240} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxCapacity">Capacidad máxima</Label>
                <Input id="maxCapacity" name="maxCapacity" type="number" defaultValue={15} min={1} max={100} required />
              </div>
            </div>

            {/* Recurring section */}
            <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Clase recurrente</span>
              </label>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="frequency">Frecuencia</Label>
                    <select
                      id="frequency"
                      name="frequency"
                      className="h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm"
                    >
                      <option value="weekly">Semanal</option>
                      <option value="daily">Diaria</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="occurrences">Número de clases</Label>
                    <Input id="occurrences" name="occurrences" type="number" defaultValue={8} min={2} max={20} />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? "Creando..."
                : isRecurring
                ? "Crear serie de clases"
                : "Crear clase"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
