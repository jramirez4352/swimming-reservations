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

export async function sendLevelUpEmail(user: User, levelName: string, color: string) {
  await send(
    user.email,
    `🎉 ¡Subiste al ${levelName}! — AquaReservas`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb;margin-bottom:4px">🏊 AquaReservas</h2>
      <div style="text-align:center;margin:24px 0">
        <div style="display:inline-block;background:${color};color:white;font-size:18px;font-weight:700;padding:12px 32px;border-radius:999px">
          ${levelName}
        </div>
      </div>
      <h3 style="text-align:center;margin-top:0">¡Felicitaciones, ${user.name}!</h3>
      <p style="text-align:center;color:#374151">
        Tu esfuerzo y dedicación han dado frutos. Tu profesor te ha asignado el <strong>${levelName}</strong> en AquaReservas. 🏆
      </p>
      <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:6px;margin:20px 0">
        <p style="margin:0;color:#166534;font-size:15px">
          Sigue así — cada clase que tomas te acerca más a tu mejor versión. ¡No te detengas! 💪
        </p>
      </div>
      <p style="color:#6b7280;font-size:14px;text-align:center">
        Ingresa a la app para ver tus clases disponibles para este nivel.
      </p>
    </div>
    `
  )
}

export async function sendPasswordResetEmail(user: User, resetUrl: string) {
  await send(
    user.email,
    `🔐 Restablecer contraseña — AquaReservas`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb;margin-bottom:4px">🏊 AquaReservas</h2>
      <h3 style="margin-top:0">Restablecer contraseña</h3>
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetUrl}"
           style="background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
          Restablecer contraseña →
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px">
        Este enlace expira en <strong>1 hora</strong>. Si no solicitaste el cambio, ignora este correo — tu contraseña no será modificada.
      </p>
      <p style="color:#9ca3af;font-size:12px;word-break:break-all">
        Si el botón no funciona, copia este enlace en tu navegador:<br>${resetUrl}
      </p>
    </div>
    `
  )
}

export async function sendWelcomeEmail(user: User) {
  await send(
    user.email,
    `¡Bienvenido/a a AquaReservas, ${user.name}! 🏊`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb;margin-bottom:4px">🏊 AquaReservas</h2>
      <h3 style="margin-top:0">¡Tu cuenta está lista!</h3>
      <p>Hola <strong>${user.name}</strong>, bienvenido/a a AquaReservas.</p>
      <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
      <ul style="color:#374151;line-height:1.8">
        <li>Explorar las clases disponibles</li>
        <li>Reservar tu lugar en cualquier clase</li>
        <li>Ver tu historial y progreso</li>
        <li>Unirte a listas de espera cuando una clase está llena</li>
      </ul>
      <div style="text-align:center;margin:24px 0">
        <a href="https://swimming-reservations.vercel.app/classes"
           style="background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
          Ver clases disponibles →
        </a>
      </div>
      <p style="color:#6b7280;font-size:14px">
        Si tienes alguna duda, contacta a tu academia de natación.
      </p>
    </div>
    `
  )
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
