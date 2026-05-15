"use client"

import { useActionState } from "react"
import { updateClass } from "@/lib/actions/classes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { use } from "react"

// Pre-filled values come via URL search params (set by the Edit button)
export default function EditClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    title?: string
    description?: string
    instructor?: string
    datetime?: string
    durationMins?: string
    maxCapacity?: string
  }>
}) {
  const { id } = use(params)
  const sp = use(searchParams)

  const boundAction = updateClass.bind(null, id)
  const [state, action, pending] = useActionState(boundAction, null)

  // Format datetime for input[type=datetime-local]
  const datetimeValue = sp.datetime
    ? new Date(sp.datetime).toISOString().slice(0, 16)
    : ""

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/classes" className="text-sm text-muted-foreground hover:underline">
          ← Volver a clases
        </Link>
        <h1 className="text-2xl font-bold">Editar Clase</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modificar datos de la clase</CardTitle>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{state.error}</div>
          )}
          <form action={action} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" defaultValue={sp.title ?? ""} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" name="description" defaultValue={sp.description ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="instructor">Instructor</Label>
              <Input id="instructor" name="instructor" defaultValue={sp.instructor ?? ""} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="datetime">Fecha y hora</Label>
              <Input id="datetime" name="datetime" type="datetime-local" defaultValue={datetimeValue} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="durationMins">Duración (min)</Label>
                <Input id="durationMins" name="durationMins" type="number" defaultValue={sp.durationMins ?? "60"} min={15} max={240} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxCapacity">Capacidad máxima</Label>
                <Input id="maxCapacity" name="maxCapacity" type="number" defaultValue={sp.maxCapacity ?? "15"} min={1} max={100} required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
