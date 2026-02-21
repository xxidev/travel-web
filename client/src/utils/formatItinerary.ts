// ── Types ──────────────────────────────────────────────────────────────────

export type ActivityType = 'accommodation' | 'dining' | 'transport' | 'sightseeing' | 'leisure'

export interface HotelData {
  rank: number
  name: string
  address: string
  rating: string
  priceLevel: string
}

export interface SlotData {
  time: string
  title: string
  items: string[]
  activityType: ActivityType
}

export interface DayData {
  number: number
  area?: string
  slots: SlotData[]
}

export interface ParsedItinerary {
  title: string
  budget: {
    total: string
    daily: string
    allocations: Array<{ label: string; value: string }>
  }
  accommodation: {
    summary: string
    hotels: HotelData[]
    bookingTips: string[]
  }
  routeNote: string
  days: DayData[]
  tips: string[]
  closing: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getActivityType(time: string, title: string): ActivityType {
  const s = (time + ' ' + title).toLowerCase()
  if (s.includes('check in') || s.includes('arrive') || s.includes('arrival')) return 'accommodation'
  if (s.includes('check out') || s.includes('depart') || s.includes('airport') || s.includes('station')) return 'transport'
  if (s.includes('lunch') || s.includes('dinner') || s.includes('breakfast') || s.includes('dining')) return 'dining'
  if (s.includes('shopping') || s.includes('leisure') || s.includes('night walk') || s.includes('nightlife')) return 'leisure'
  return 'sightseeing'
}

// ── Section parsers ────────────────────────────────────────────────────────

function parseBudget(text: string): ParsedItinerary['budget'] {
  const total = text.match(/\*\*Total Budget\*\*:\s*(.+)/)?.[1]?.trim() ?? ''
  const daily = text.match(/\*\*Daily Budget\*\*:\s*(.+)/)?.[1]?.trim() ?? ''
  const allocations: Array<{ label: string; value: string }> = []
  const re = /^- (.+?):\s*(.+?)\s*\(\d+%\)/gm
  let m
  while ((m = re.exec(text)) !== null) {
    allocations.push({ label: m[1].trim(), value: m[2].trim() })
  }
  return { total, daily, allocations }
}

function parseAccommodation(text: string): ParsedItinerary['accommodation'] {
  const summary = text.match(/\*\*Accommodation Budget\*\*:\s*(.+)/)?.[1]?.trim() ?? ''
  const hotels: HotelData[] = []
  const bookingTips: string[] = []
  let currentHotel: Partial<HotelData> | null = null
  let inBookingTips = false

  for (const line of text.split('\n')) {
    const t = line.trim()

    const hotelHeader = t.match(/^\*\*(\d+)\.\s+(.+?)\*\*$/)
    if (hotelHeader) {
      if (currentHotel?.name) hotels.push(currentHotel as HotelData)
      currentHotel = { rank: +hotelHeader[1], name: hotelHeader[2] }
      inBookingTips = false
      continue
    }

    if (/^\*\*Booking Tips\*\*/.test(t)) {
      if (currentHotel?.name) { hotels.push(currentHotel as HotelData); currentHotel = null }
      inBookingTips = true
      continue
    }

    if (currentHotel) {
      const addr = t.match(/^- Address:\s*(.+)/); if (addr) { currentHotel.address = addr[1]; continue }
      const rat  = t.match(/^- Rating:\s*(.+)/);  if (rat)  { currentHotel.rating = rat[1]; continue }
      const pl   = t.match(/^- Price Level:\s*(.+)/); if (pl) { currentHotel.priceLevel = pl[1]; continue }
    }

    if (inBookingTips) {
      const tip = t.match(/^- (.+)/); if (tip) bookingTips.push(tip[1])
    }
  }

  if (currentHotel?.name) hotels.push(currentHotel as HotelData)
  return { summary, hotels, bookingTips }
}

function parseDays(text: string): { routeNote: string; days: DayData[] } {
  const routeNote = text.match(/^> (.+)$/m)?.[1]?.trim() ?? ''
  const days: DayData[] = []
  const chunks = text.split(/^### Day (\d+)/m)

  for (let i = 1; i < chunks.length; i += 2) {
    const num = +chunks[i]
    const content = chunks[i + 1] ?? ''
    const day: DayData = { number: num, slots: [] }
    let currentSlot: SlotData | null = null

    for (const line of content.split('\n')) {
      const t = line.trim()
      if (!t) continue

      // Area badge
      const area = t.match(/^\*\*Area\*\*:\s*(.+)/)
      if (area) { day.area = area[1].replace(/\s*\(.*?\)\s*$/, '').trim(); continue }

      // Time slot header: **Morning 9:00-12:00**: Title
      const slotM = t.match(/^\*\*([^*]+?)\*\*:?\s*(.*)/)
      if (slotM) {
        if (currentSlot) day.slots.push(currentSlot)
        currentSlot = {
          time: slotM[1].trim(),
          title: slotM[2].trim(),
          items: [],
          activityType: getActivityType(slotM[1], slotM[2])
        }
        continue
      }

      // List items (root and indented — trim handles both)
      const itemM = t.match(/^-\s+(.+)/)
      if (itemM && currentSlot) currentSlot.items.push(itemM[1].trim())
    }

    if (currentSlot) day.slots.push(currentSlot)
    days.push(day)
  }

  return { routeNote, days }
}

function parseTips(text: string): { tips: string[]; closing: string } {
  const tips: string[] = []
  let closing = ''
  for (const line of text.split('\n')) {
    const t = line.trim()
    const tip = t.match(/^- (.+)/); if (tip) tips.push(tip[1])
    if (t.startsWith('**Have a wonderful')) closing = t.replace(/\*\*/g, '')
  }
  return { tips, closing }
}

// ── Main export ────────────────────────────────────────────────────────────

export function parseItinerary(text: string): ParsedItinerary {
  const title = text.split('\n')[0]?.replace(/^# /, '').trim() ?? ''
  const sections: Record<string, string> = {}
  let cur = ''

  for (const line of text.split('\n').slice(1)) {
    const m = line.match(/^## (.+)/)
    if (m) { cur = m[1].trim(); sections[cur] = '' }
    else if (cur) sections[cur] += line + '\n'
  }

  const budget        = parseBudget(sections['Budget Overview'] ?? '')
  const accommodation = parseAccommodation(sections['Accommodation Recommendations'] ?? '')
  const { routeNote, days } = parseDays(sections['Detailed Itinerary'] ?? '')
  const { tips, closing }   = parseTips(sections['Travel Tips'] ?? '')

  return { title, budget, accommodation, routeNote, days, tips, closing }
}
