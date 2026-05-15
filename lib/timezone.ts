export const TZ = "America/Bogota"
export const LOCALE = "es-CO"

// Returns midnight in Bogotá as a UTC Date (COT = UTC-5, no DST)
export function startOfTodayBogota(): Date {
  const now = new Date()
  const COT_MS = 5 * 60 * 60 * 1000
  const cotNow = new Date(now.getTime() - COT_MS)
  cotNow.setUTCHours(0, 0, 0, 0)
  return new Date(cotNow.getTime() + COT_MS)
}

// Shorthand formatters
export const fmtShort = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ, weekday: "short", day: "numeric", month: "short",
  hour: "2-digit", minute: "2-digit",
})

export const fmtLong = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ, weekday: "long", day: "numeric", month: "long",
  year: "numeric", hour: "2-digit", minute: "2-digit",
})

export const fmtDate = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ, day: "numeric", month: "short", year: "numeric",
})

export const fmtDateTime = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
})
