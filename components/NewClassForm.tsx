"use client"

import { useActionState, useState } from "react"
import { createClass } from "@/lib/actions/classes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Prof { id: string; name: string }

export function NewClassForm({ professors }: { professors: Prof[] }) {
  const [state, action, pending] = useActionState(createClass, null)
  const [isRecurring, setIsRecurring] = useState(false)

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/classes" className="text-sm text-muted-foreground hover:underline">← Volver a clases</Link>
        <h1 className="text-2xl font-bold">Nueva Clase</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Datos de la clase</CardTitle></CardHeader>
        <CardContent>
          {state?.error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{state.error}</div>}

          {professors.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <p className="font-medium">No hay profesores registrados.</p>
              <p className="mt-1">Primero crea un usuario con rol <strong>Profesor</strong> en la sección{" "}
                <Link href="/admin/students/new" className="underline hover:text-amber-900">Usuarios → Crear</Link>.
              </p>
            </div>
          ) : (
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
                <Label htmlFor="instructorUserId">Instructor</Label>
                <select
                  id="instructorUserId"
                  name="instructorUserId"
                  defaultValue=""
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>Selecciona un profesor...</option>
                  {professors.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">El profesor podrá ver y gestionar esta clase en su panel.</p>
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

              <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isRecurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-medium">Clase recurrente</span>
                </label>
                {isRecurring && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label htmlFor="frequency">Frecuencia</Label>
                      <select id="frequency" name="frequency" className="h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm">
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
                {pending ? "Creando..." : isRecurring ? "Crear serie de clases" : "Crear clase"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
