"use client"

import { useActionState } from "react"
import { createUser } from "@/lib/actions/admin-users"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewUserPage() {
  const [state, action, pending] = useActionState(createUser, null)

  return (
    <div className="max-w-md">
      <Link href="/admin/students" className="text-sm text-muted-foreground hover:underline block mb-6">
        ← Volver a alumnos
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Crear usuario</CardTitle>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {state.error}
            </div>
          )}
          <form action={action} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" name="name" placeholder="Juan Pérez" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="usuario@email.com" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" type="tel" placeholder="55 1234 5678" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" placeholder="CDMX" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="address">
                Dirección <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Input id="address" name="address" placeholder="Calle, número, colonia" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Contraseña temporal</Label>
              <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                name="role"
                defaultValue="STUDENT"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="STUDENT">Alumno</option>
                <option value="PROFESOR">Profesor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={pending} className="flex-1">
                {pending ? "Creando..." : "Crear usuario"}
              </Button>
              <Link href="/admin/students">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
