import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/AdminNav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") redirect("/login")

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <AdminNav name={session?.user?.name} />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
