import { ParsedItinerary, ActivityType } from './formatItinerary'

// ── Color map (matches app UI) ─────────────────────────────────────────────

const TAG_COLORS: Record<ActivityType, { bg: string; color: string }> = {
  accommodation: { bg: '#DBEAFE', color: '#1E40AF' },
  dining:        { bg: '#FEF3C7', color: '#B45309' },
  transport:     { bg: '#EDE9FE', color: '#6D28D9' },
  sightseeing:   { bg: '#D1FAE5', color: '#065F46' },
  leisure:       { bg: '#FCE7F3', color: '#9D174D' },
}

const BORDER_COLORS: Record<ActivityType, string> = {
  accommodation: '#3B82F6',
  dining:        '#F59E0B',
  transport:     '#8B5CF6',
  sightseeing:   '#10B981',
  leisure:       '#EC4899',
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  accommodation: '🏨 Stay',
  dining:        '🍽️ Dining',
  transport:     '✈️ Transit',
  sightseeing:   '🗺️ Explore',
  leisure:       '🌙 Leisure',
}

// ── HTML generators ────────────────────────────────────────────────────────

function renderItems(items: string[]): string {
  return items.map(item => {
    if (item.startsWith('Address:'))
      return `<li style="color:#6b7280;font-size:0.82rem">📍 ${item.replace('Address:', '').trim()}</li>`
    if (item.startsWith('Rating:'))
      return `<li style="color:#6b7280;font-size:0.82rem">⭐ ${item.replace('Rating:', '').trim()}</li>`
    if (item.startsWith('Check in at:'))
      return `<li style="font-weight:600">🏨 ${item.replace('Check in at:', '').trim()}</li>`
    if (item.startsWith('Recommended:'))
      return `<li style="font-weight:600">🍽️ ${item.replace('Recommended:', '').trim()}</li>`
    return `<li>${item}</li>`
  }).join('\n')
}

function renderDay(day: ParsedItinerary['days'][number]): string {
  const slots = day.slots.map(slot => {
    const tc = TAG_COLORS[slot.activityType]
    const bc = BORDER_COLORS[slot.activityType]
    const label = ACTIVITY_LABELS[slot.activityType]
    const itemsHtml = slot.items.length
      ? `<ul style="margin:8px 0 0;padding-left:16px;display:flex;flex-direction:column;gap:4px">${renderItems(slot.items)}</ul>`
      : ''
    return `
      <div style="border-left:3px solid ${bc};border-radius:12px;padding:12px 16px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.05);border:1px solid #f0f0f4;border-left-width:3px;margin-bottom:10px">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
          <span style="background:${tc.bg};color:${tc.color};padding:2px 10px;border-radius:100px;font-size:0.7rem;font-weight:600">${slot.time}</span>
          <span style="background:${tc.bg};color:${tc.color};padding:2px 10px;border-radius:100px;font-size:0.7rem;font-weight:600">${label}</span>
        </div>
        ${slot.title ? `<p style="margin:0 0 4px;font-weight:600;font-size:0.9rem">${slot.title}</p>` : ''}
        ${itemsHtml}
      </div>`
  }).join('')

  const areaBadge = day.area
    ? `<span style="font-size:0.72rem;background:#eff6ff;color:#3b82f6;padding:3px 10px;border-radius:100px;margin-left:10px">📍 ${day.area}</span>`
    : ''

  return `
    <div style="display:flex;gap:18px;margin-bottom:24px">
      <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:38px">
        <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#7209b7);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px rgba(67,97,238,0.3)">${day.number}</div>
        <div style="flex:1;width:2px;background:linear-gradient(to bottom,rgba(67,97,238,0.18),rgba(67,97,238,0.03));margin:6px 0;min-height:16px"></div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;min-height:38px;margin-bottom:12px">
          <h3 style="margin:0;font-size:1rem;font-weight:700">Day ${day.number}</h3>
          ${areaBadge}
        </div>
        ${slots}
      </div>
    </div>`
}

function renderHotel(h: ParsedItinerary['accommodation']['hotels'][number]): string {
  const rating = parseFloat(h.rating)
  const ratingHtml = !isNaN(rating)
    ? `<div style="font-size:0.82rem;margin:4px 0">⭐ <strong>${h.rating}</strong></div>`
    : ''
  const priceHtml = h.priceLevel
    ? `<span style="display:inline-block;background:#d1fae5;color:#065f46;font-size:0.7rem;font-weight:700;padding:2px 10px;border-radius:100px;margin:4px 0">${h.priceLevel}</span>`
    : ''
  const addrHtml = h.address
    ? `<p style="margin:6px 0 0;font-size:0.75rem;color:#9ca3af">📍 ${h.address}</p>`
    : ''

  return `
    <div style="flex-shrink:0;width:200px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:16px">
      <div style="font-size:0.68rem;font-weight:700;color:#9ca3af;margin-bottom:4px">#${h.rank}</div>
      <h4 style="margin:0 0 4px;font-size:0.88rem;font-weight:700;line-height:1.3">${h.name}</h4>
      ${ratingHtml}
      ${priceHtml}
      ${addrHtml}
    </div>`
}

function tipLine(text: string): string {
  const m = text.match(/^\*\*(.+?)\*\*:\s*(.+)/)
  if (m) return `<li><strong>${m[1]}</strong>: ${m[2]}</li>`
  return `<li>${text.replace(/\*\*/g, '')}</li>`
}

// ── Main generator ─────────────────────────────────────────────────────────

function generateHTML(data: ParsedItinerary): string {
  const { title, budget, accommodation, routeNote, days, tips, closing } = data

  const budgetSection = (budget.total || budget.allocations.length) ? `
    <div style="background:#fff;border-radius:16px;padding:24px 28px;box-shadow:0 2px 12px rgba(0,0,0,0.05);border:1px solid #e5e7eb;margin-bottom:16px">
      <h2 style="margin:0 0 16px;font-size:1rem;font-weight:700">💰 Budget Overview</h2>
      <div style="display:flex;gap:24px;margin-bottom:14px;flex-wrap:wrap">
        ${budget.total ? `<div><div style="font-size:0.68rem;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">Total Budget</div><div style="font-size:1.3rem;font-weight:700">${budget.total}</div></div>` : ''}
        ${budget.daily ? `<div><div style="font-size:0.68rem;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">Daily Budget</div><div style="font-size:1.3rem;font-weight:700">${budget.daily}</div></div>` : ''}
      </div>
      ${budget.allocations.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px">${budget.allocations.map(a => `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:#f3f4f6;border-radius:100px;font-size:0.76rem"><span style="color:#6b7280">${a.label}</span><strong>${a.value}</strong></span>`).join('')}</div>` : ''}
    </div>` : ''

  const hotelsHtml = accommodation.hotels.length
    ? `<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px">${accommodation.hotels.map(renderHotel).join('')}</div>`
    : ''

  const tipsHtml = accommodation.bookingTips.length
    ? `<div style="display:flex;gap:10px;margin-top:16px;padding:14px 18px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px"><span style="font-size:1rem;flex-shrink:0">💡</span><ul style="margin:0;padding-left:16px;display:flex;flex-direction:column;gap:4px">${accommodation.bookingTips.map(t => `<li style="font-size:0.82rem;color:#78350f">${t}</li>`).join('')}</ul></div>`
    : ''

  const accomSection = (accommodation.hotels.length || accommodation.bookingTips.length) ? `
    <div style="background:#fff;border-radius:16px;padding:24px 28px;box-shadow:0 2px 12px rgba(0,0,0,0.05);border:1px solid #e5e7eb;margin-bottom:16px">
      <h2 style="margin:0 0 ${accommodation.summary ? '8px' : '16px'};font-size:1rem;font-weight:700">🏨 Accommodation</h2>
      ${accommodation.summary ? `<p style="margin:0 0 16px;font-size:0.85rem;color:#6b7280">${accommodation.summary}</p>` : ''}
      ${hotelsHtml}
      ${tipsHtml}
    </div>` : ''

  const routeNoteHtml = routeNote
    ? `<p style="font-size:0.8rem;color:#9ca3af;padding:8px 12px;background:#eff6ff;border-radius:8px;margin:0 0 18px">📍 ${routeNote}</p>`
    : ''

  const timelineSection = days.length ? `
    <div style="background:#fff;border-radius:16px;padding:24px 28px;box-shadow:0 2px 12px rgba(0,0,0,0.05);border:1px solid #e5e7eb;margin-bottom:16px">
      <h2 style="margin:0 0 20px;font-size:1rem;font-weight:700">🗓️ Day-by-Day Itinerary</h2>
      ${routeNoteHtml}
      ${days.map(renderDay).join('')}
    </div>` : ''

  const tipsSection = tips.length ? `
    <div style="background:#fff;border-radius:16px;padding:24px 28px;box-shadow:0 2px 12px rgba(0,0,0,0.05);border:1px solid #e5e7eb;margin-bottom:16px">
      <h2 style="margin:0 0 16px;font-size:1rem;font-weight:700">✨ Travel Tips</h2>
      <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px">${tips.map(tipLine).join('')}</ul>
      ${closing ? `<p style="margin:16px 0 0;font-weight:600;text-align:center;padding:12px;background:linear-gradient(135deg,rgba(67,97,238,0.06),rgba(6,214,160,0.06));border-radius:10px">${closing}</p>` : ''}
    </div>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8f9fa;
      color: #1a1a2e;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .page { max-width: 780px; margin: 0 auto; padding: 48px 32px 64px; }
    .page-header { margin-bottom: 28px; }
    .page-badge {
      display: inline-block;
      padding: 4px 14px;
      background: rgba(6,214,160,0.1);
      color: #06d6a0;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border-radius: 100px;
      margin-bottom: 12px;
    }
    .page-title {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.2;
    }
    .page-footer {
      margin-top: 32px;
      text-align: center;
      font-size: 0.75rem;
      color: #9ca3af;
    }
    @media print {
      body { background: #fff; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="page-header">
      <div class="page-badge">✈️ Travel Itinerary</div>
      <h1 class="page-title">${title}</h1>
    </div>
    ${budgetSection}
    ${accomSection}
    ${timelineSection}
    ${tipsSection}
    <div class="page-footer">
      Generated by Voyager · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
  </div>
</body>
</html>`
}

// ── Public export ──────────────────────────────────────────────────────────

export function downloadItinerary(data: ParsedItinerary): void {
  const html = generateHTML(data)
  const filename = `${(data.title || 'itinerary').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.html`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
