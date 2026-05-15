import { auth } from "@/lib/auth"
import { logout } from "@/lib/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-blue-600">🏊 AquaReservas</span>
            <Link href="/classes" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Clases
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Mis Reservas
            </Link>
            <Link href="/history" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Historial
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Mi Perfil
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{session?.user?.name}</span>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">Salir</Button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
