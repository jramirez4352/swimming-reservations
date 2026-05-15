"use client"

import { useActionState } from "react"
import { register } from "@/lib/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, null)

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">🏊</div>
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para reservar clases de natación</CardDescription>
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
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono celular</Label>
              <Input id="phone" name="phone" type="tel" placeholder="55 1234 5678" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" placeholder="Ciudad de México" required />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="address">
              Dirección <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Input id="address" name="address" placeholder="Calle, número, colonia" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
