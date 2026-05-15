"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { markMessageRead } from "@/lib/actions/messages"

type Message = {
  id: string
  subject: string
  content: string
  read: boolean
  createdAt: Date
  from: { name: string; role: string }
}

const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

export function MessageInbox({ messages }: { messages: Message[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set(messages.filter(m => m.read).map(m => m.id)))

  async function handleOpen(id: string) {
    setOpenId(openId === id ? null : id)
    if (!readIds.has(id)) {
      setReadIds(prev => new Set([...prev, id]))
      await markMessageRead(id)
    }
  }

  const unread = messages.filter(m => !readIds.has(m.id)).length

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-muted-foreground">
        <p>No tienes mensajes.</p>
        <p className="text-sm mt-1">Aquí aparecerán los mensajes que te envíen tus profesores.</p>
      </div>
    )
  }

  return (
    <div>
      {unread > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          <span className="font-semibold text-blue-600">{unread}</span> mensaje{unread !== 1 ? "s" : ""} sin leer
        </p>
      )}
      <div className="rounded-md border bg-white overflow-hidden divide-y">
        {messages.map(m => {
          const isRead = readIds.has(m.id)
          const isOpen = openId === m.id
          return (
            <div key={m.id}>
              <button
                onClick={() => handleOpen(m.id)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${!isRead ? "bg-blue-50/50" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${!isRead ? "font-semibold" : "font-medium"}`}>{m.subject}</p>
                      {!isRead && <Badge className="bg-blue-600 text-[10px] shrink-0">Nuevo</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      De: {m.from.name} · {fmt.format(new Date(m.createdAt))}
                    </p>
                    {!isOpen && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.content}</p>
                    )}
                  </div>
                  <span className="text-slate-400 shrink-0 mt-0.5">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-2 bg-slate-50 border-t">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{m.content}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
