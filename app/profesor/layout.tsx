import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfesorNav } from "@/components/ProfesorNav"

export default async function ProfesorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || !["PROFESOR", "ADMIN"].includes(session.user.role ?? "")) redirect("/login")

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <ProfesorNav name={session.user.name} />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
