// Email stub — logs to console.
// To activate real emails with Resend:
//   1. npm install resend
//   2. Set RESEND_API_KEY and EMAIL_FROM in .env
//   3. Replace the console.log blocks with Resend API calls

type User = { name: string; email: string }
type Cls = { title: string; instructor: string; datetime: Date; durationMins: number }

export async function sendReservationConfirmation(user: User, cls: Cls) {
  console.log("[EMAIL] Confirmación de reserva →", user.email, {
    subject: `✅ Reserva confirmada: ${cls.title}`,
    body: `Hola ${user.name}, tu reserva para "${cls.title}" con ${cls.instructor} el ${cls.datetime.toLocaleString("es-MX")} (${cls.durationMins} min) está confirmada.`,
  })
}

export async function sendReservationCancellation(user: User, cls: Cls) {
  console.log("[EMAIL] Cancelación de reserva →", user.email, {
    subject: `❌ Reserva cancelada: ${cls.title}`,
    body: `Hola ${user.name}, tu reserva para "${cls.title}" el ${cls.datetime.toLocaleString("es-MX")} ha sido cancelada.`,
  })
}

export async function sendWaitlistNotification(user: User, cls: Cls) {
  console.log("[EMAIL] Lugar disponible en lista de espera →", user.email, {
    subject: `🎉 Lugar disponible: ${cls.title}`,
    body: `Hola ${user.name}, se liberó un lugar en "${cls.title}" con ${cls.instructor} el ${cls.datetime.toLocaleString("es-MX")}. Inicia sesión para reservar tu lugar antes de que se llene.`,
  })
}

export async function sendWaitlistConfirmation(user: User, cls: Cls) {
  console.log("[EMAIL] Confirmación lista de espera →", user.email, {
    subject: `⏳ En lista de espera: ${cls.title}`,
    body: `Hola ${user.name}, te has unido a la lista de espera para "${cls.title}" el ${cls.datetime.toLocaleString("es-MX")}. Te notificaremos si se libera un lugar.`,
  })
}
