import { auth } from "@/lib/auth"
import { logout } from "@/lib/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") redirect("/login")

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-cyan-400">🏊 Admin Panel</span>
            <Link href="/admin/dashboard" className="text-sm hover:text-cyan-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/classes" className="text-sm hover:text-cyan-300 transition-colors">
              Clases
            </Link>
            <Link href="/admin/reservations" className="text-sm hover:text-cyan-300 transition-colors">
              Reservas
            </Link>
            <Link href="/admin/students" className="text-sm hover:text-cyan-300 transition-colors">
              Alumnos
            </Link>
            <Link href="/admin/reports" className="text-sm hover:text-cyan-300 transition-colors">
              Reportes
            </Link>
            <Link href="/admin/settings" className="text-sm hover:text-cyan-300 transition-colors">
              Configuración
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">{session?.user?.name}</span>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit" className="text-slate-100 border-slate-400 bg-slate-700 hover:bg-slate-600 hover:text-white hover:border-slate-300">
                Salir
              </Button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
