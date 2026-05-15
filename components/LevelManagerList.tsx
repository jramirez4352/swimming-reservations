"use client"

import { useState, useActionState } from "react"
import { createLevel, updateLevel, deleteLevel } from "@/lib/actions/level-management"
import { textColor } from "@/lib/levels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Level = { id: number; name: string; color: string; order: number }

interface Props {
  levels: Level[]
  countMap: Record<number, number>
}

function EditRow({ level, studentCount }: { level: Level; studentCount: number }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(level.name)
  const [color, setColor] = useState(level.color)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateLevel(level.id, name, color)
      setEditing(false)
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${level.name}"?`)) return
    setDeleting(true)
    const res = await deleteLevel(level.id)
    if (res?.error) { setError(res.error); setDeleting(false) }
  }

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center gap-3">
        {/* Color preview */}
        <span
          className="w-8 h-8 rounded-full shrink-0 border border-white shadow-sm"
          style={{ backgroundColor: color }}
        />

        {editing ? (
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-8 text-sm w-40"
            />
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-8 rounded border cursor-pointer p-0.5"
              title="Elige un color"
            />
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "..." : "Guardar"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setName(level.name); setColor(level.color) }}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1">
            <span
              className="text-sm font-semibold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: color, color: textColor(color) }}
            >
              {name}
            </span>
            <span className="text-xs text-muted-foreground">{color}</span>
            {studentCount > 0 && (
              <span className="text-xs text-muted-foreground">· {studentCount} alumno{studentCount !== 1 ? "s" : ""}</span>
            )}
            <div className="flex gap-1.5 ml-auto">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Editar</Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "..." : "Eliminar"}
              </Button>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 pl-11">{error}</p>}
    </div>
  )
}

function AddLevelForm() {
  const [state, action, pending] = useActionState(createLevel, null)
  const [color, setColor] = useState("#6366f1")

  return (
    <form action={action} className="p-4 border-t bg-slate-50 rounded-b-md space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nuevo nivel</p>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs">Nombre</Label>
          <Input id="name" name="name" placeholder="Nivel 7" className="h-8 text-sm w-36" required />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-8 rounded border cursor-pointer p-0.5"
            />
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: color, color: textColor(color) }}
            >
              Vista previa
            </span>
          </div>
        </div>
        <Button type="submit" size="sm" disabled={pending} className="mb-0.5">
          {pending ? "Creando..." : "+ Agregar nivel"}
        </Button>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  )
}

export function LevelManagerList({ levels, countMap }: Props) {
  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <div className="divide-y">
        {levels.map(l => (
          <EditRow key={l.id} level={l} studentCount={countMap[l.id] ?? 0} />
        ))}
      </div>
      <AddLevelForm />
    </div>
  )
}
