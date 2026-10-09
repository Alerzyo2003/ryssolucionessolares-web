type Fbq = (...args: unknown[]) => void

export function track(event: string, data?: Record<string, unknown>, eventId?: string) {
  if (typeof window === 'undefined') return
  const fbq = (window as unknown as { fbq?: Fbq }).fbq
  if (!fbq) return
  if (eventId) fbq('track', event, data, { eventID: eventId })
  else fbq('track', event, data)
}