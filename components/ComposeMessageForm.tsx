"use client"

import { useActionState } from "react"
import { sendMessage } from "@/lib/actions/messages"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Student { id: string; name: string; email: string }

export function ComposeMessageForm({ students, defaultToUserId }: { students: Student[]; defaultToUserId?: string }) {
  const [state, action, pending] = useActionState(sendMessage, null)

  if (state?.success) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-green-600 font-semibold text-lg">✅ Mensaje enviado</p>
          <p className="text-muted-foreground text-sm mt-1">El alumno lo verá en su bandeja de entrada.</p>
          <a href="/profesor/messages" className="text-emerald-600 hover:underline text-sm mt-4 block">
            ← Volver a mensajes
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{state.error}</div>
        )}
        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="toUserId">Para</Label>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes alumnos inscritos en tus clases.</p>
            ) : (
              <select
                id="toUserId"
                name="toUserId"
                defaultValue={defaultToUserId ?? ""}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecciona un alumno...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" name="subject" placeholder="Ej: Cambio de horario del martes" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="content">Mensaje</Label>
            <textarea
              id="content"
              name="content"
              required
              rows={5}
              placeholder="Escribe aquí tu mensaje para el alumno..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={pending || students.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {pending ? "Enviando..." : "Enviar mensaje"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
