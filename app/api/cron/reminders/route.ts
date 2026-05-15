import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendClassReminder } from "@/lib/email"

export async function GET(req: NextRequest) {
  // Verify cron secret in production
  if (process.env.NODE_ENV === "production") {
    const auth = req.headers.get("authorization")
    if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const now = new Date()
  // Find classes happening between 23h and 25h from now
  const from = new Date(now.getTime() + 23 * 60 * 60 * 1000)
  const to   = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const classes = await db.class.findMany({
    where: { datetime: { gte: from, lte: to } },
    include: {
      reservations: {
        where: { status: "ACTIVE" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  })

  let sent = 0
  for (const cls of classes) {
    for (const r of cls.reservations) {
      await sendClassReminder(r.user, cls)
      sent++
    }
  }

  return NextResponse.json({ ok: true, classes: classes.length, reminders: sent, timestamp: now.toISOString() })
}
