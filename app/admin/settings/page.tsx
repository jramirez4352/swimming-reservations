import { db } from "@/lib/db"
import { RegistrationToggle } from "@/components/RegistrationToggle"

export default async function AdminSettingsPage() {
  const settings = await db.settings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", allowRegistration: true },
  })

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <div>
        <h2 className="text-base font-semibold mb-3">Registro de usuarios</h2>
        <RegistrationToggle initialValue={settings.allowRegistration} />
      </div>
    </div>
  )
}
