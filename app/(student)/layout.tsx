import { auth } from "@/lib/auth"
import { StudentNav } from "@/components/StudentNav"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <StudentNav name={session?.user?.name} />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
