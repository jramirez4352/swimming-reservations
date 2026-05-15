import nodemailer from "nodemailer"

type User = { name: string; email: string }
type Cls  = { title: string; instructor: string; datetime: Date; durationMins: number }

// Transporter — se crea una sola vez por instancia del servidor
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

async function send(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    // Sin credenciales: muestra en consola (útil en desarrollo)
    console.log("[EMAIL]", { to, subject, html })
    return
  }
  await transporter.sendMail({
    from: `"AquaReservas 🏊" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  }).format(d)
}

export async function sendReservationConfirmation(user: User, cls: Cls) {
  await send(
    user.email,
    `✅ Reserva confirmada: ${cls.title}`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb;margin-bottom:4px">🏊 AquaReservas</h2>
      <h3 style="margin-top:0">¡Reserva confirmada!</h3>
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Tu reserva está confirmada. Aquí los detalles:</p>
      <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:6px;margin:16px 0">
        <p style="margin:4px 0"><strong>Clase:</strong> ${cls.title}</p>
        <p style="margin:4px 0"><strong>Instructor:</strong> ${cls.instructor}</p>
        <p style="margin:4px 0"><strong>Fecha:</strong> ${fmtDate(cls.datetime)}</p>
        <p style="margin:4px 0"><strong>Duración:</strong> ${cls.durationMins} min</p>
      </div>
      <p style="color:#6b7280;font-size:14px">Si necesitas cancelar, hazlo con anticipación desde la app.</p>
    </div>
    `
  )
}

export async function sendReservationCancellation(user: User, cls: Cls) {
  await send(
    user.email,
    `❌ Reserva cancelada: ${cls.title}`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb;margin-bottom:4px">🏊 AquaReservas</h2>
      <h3 style="margin-top:0">Reserva cancelada</h3>
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Tu reserva para la siguiente clase ha sido cancelada:</p>
      <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:6px;margin:16px 0">
        <p style="margin:4px 0"><strong>Clase:</strong> ${cls.title}</p>
        <p style="margin:4px 0"><strong>Fecha:</strong> ${fmtDate(cls.datetime)}</p>
      </div>
      <p style="color:#6b7280;font-size:14px">Puedes explorar otras clases disponibles en la app.</p>
    </div>
    `
  )
}

export async function sendWaitlistNotification(user: User, cls: Cls) {
  await send(
    user.email,
    `🎉 ¡Lugar disponible! ${cls.title}`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb;margin-bottom:4px">🏊 AquaReservas</h2>
      <h3 style="margin-top:0">¡Se liberó un lugar!</h3>
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Se liberó un lugar en la clase que estabas esperando:</p>
      <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:6px;margin:16px 0">
        <p style="margin:4px 0"><strong>Clase:</strong> ${cls.title}</p>
        <p style="margin:4px 0"><strong>Instructor:</strong> ${cls.instructor}</p>
        <p style="margin:4px 0"><strong>Fecha:</strong> ${fmtDate(cls.datetime)}</p>
      </div>
      <p><strong>Entra a la app y reserva antes de que se llene.</strong></p>
    </div>
    `
  )
}

export async function sendWaitlistConfirmation(user: User, cls: Cls) {
  await send(
    user.email,
    `⏳ En lista de espera: ${cls.title}`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb;margin-bottom:4px">🏊 AquaReservas</h2>
      <h3 style="margin-top:0">Lista de espera confirmada</h3>
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Te has unido a la lista de espera para:</p>
      <div style="background:#fefce8;border-left:4px solid #eab308;padding:16px;border-radius:6px;margin:16px 0">
        <p style="margin:4px 0"><strong>Clase:</strong> ${cls.title}</p>
        <p style="margin:4px 0"><strong>Instructor:</strong> ${cls.instructor}</p>
        <p style="margin:4px 0"><strong>Fecha:</strong> ${fmtDate(cls.datetime)}</p>
      </div>
      <p style="color:#6b7280;font-size:14px">Te notificaremos por correo si se libera un lugar.</p>
    </div>
    `
  )
}

export async function sendClassReminder(user: User, cls: Cls) {
  await send(
    user.email,
    `⏰ Recuerda: ${cls.title} mañana`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb;margin-bottom:4px">🏊 AquaReservas</h2>
      <h3 style="margin-top:0">Recordatorio de clase</h3>
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Te recordamos que mañana tienes clase:</p>
      <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:6px;margin:16px 0">
        <p style="margin:4px 0"><strong>Clase:</strong> ${cls.title}</p>
        <p style="margin:4px 0"><strong>Instructor:</strong> ${cls.instructor}</p>
        <p style="margin:4px 0"><strong>Fecha:</strong> ${fmtDate(cls.datetime)}</p>
        <p style="margin:4px 0"><strong>Duración:</strong> ${cls.durationMins} min</p>
      </div>
      <p>¡Te esperamos!</p>
    </div>
    `
  )
}
