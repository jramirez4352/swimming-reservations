import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MessageInbox } from "@/components/MessageInbox"

export default async function StudentMessagesPage() {
  const session = await auth()
  if (!session) return null

  const messages = await db.message.findMany({
    where: { toUserId: session.user.id },
    include: { from: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mensajes</h1>
      <MessageInbox messages={messages} />
    </div>
  )
}
