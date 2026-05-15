"use client"

import { useActionState } from "react"
import { requestPasswordReset } from "@/lib/actions/password-reset"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, null)

  if (state?.success) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">📧</div>
          <CardTitle>Revisa tu correo</CardTitle>
          <CardDescription>
            Si el email está registrado, recibirás un enlace para restablecer tu contraseña. El enlace expira en 1 hora.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login" className="text-blue-600 hover:underline text-sm">
            ← Volver al inicio de sesión
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">🔐</div>
        <CardTitle className="text-2xl">Olvidé mi contraseña</CardTitle>
        <CardDescription>
          Ingresa tu email y te enviaremos un enlace para crear una nueva contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{state.error}</div>
        )}
        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">← Volver al inicio de sesión</Link>
        </p>
      </CardContent>
    </Card>
  )
}
