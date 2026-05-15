import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { StudentNav } from "@/components/StudentNav"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  const unreadMessages = session?.user?.id
    ? await db.message.count({ where: { toUserId: session.user.id, read: false } })
    : 0

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <StudentNav name={session?.user?.name} unreadMessages={unreadMessages} />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
