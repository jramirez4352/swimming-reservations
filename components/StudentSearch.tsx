"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

export function StudentSearch() {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    startTransition(() => {
      if (q) {
        router.replace(`/admin/students?q=${encodeURIComponent(q)}`)
      } else {
        router.replace("/admin/students")
      }
    })
  }

  return (
    <input
      type="search"
      placeholder="Buscar por nombre o email..."
      defaultValue={params.get("q") ?? ""}
      onChange={handleChange}
      className="w-full sm:w-72 rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  )
}
