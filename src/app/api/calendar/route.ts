import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { EventType } from '@/types/schedule'

const EVENT_TYPES: EventType[] = ['hike', 'social', 'residential', 'other']

function escapeICSText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

function formatDate(date: string): string {
  return date.replace(/-/g, '')
}

function getNextDate(date: string): string {
  const nextDate = new Date(`${date}T12:00:00Z`)
  nextDate.setUTCDate(nextDate.getUTCDate() + 1)
  return nextDate.toISOString().slice(0, 10).replace(/-/g, '')
}

function formatLocalDateTime(date: string, time: string): string {
  return `${formatDate(date)}T${time.replace(/:/g, '')}00`
}

function getTimedEnd(date: string, time: string, eventEndDate: string): { date: string; time: string } {
  if (eventEndDate !== date) {
    return { date: eventEndDate, time }
  }

  const end = new Date(`${date}T${time}`)
  end.setHours(end.getHours() + 2)
  return {
    date: end.toISOString().slice(0, 10),
    time: end.toISOString().slice(11, 16),
  }
}

function getAccessibilityDescription(event: {
  dda_compliant_ramp_access: boolean
  lift_access_within_building: boolean
  accessible_toilets: boolean
  gender_neutral_toilets: boolean
  seating_available: boolean
  alcohol_served: boolean
  accessibility_notes: string | null
}): string {
  const features = [
    ['DDA Compliant Ramp Access', event.dda_compliant_ramp_access],
    ['Lift Access within the Building', event.lift_access_within_building],
    ['Accessible Toilets', event.accessible_toilets],
    ['Gender Neutral Toilets', event.gender_neutral_toilets],
    ['Seating Available', event.seating_available],
    ['Alcohol will be served', event.alcohol_served],
  ]

  const accessibility = features
    .map(([label, available]) => `${label}: ${available ? 'Yes' : 'No'}`)
    .join('\n')

  return [
    'Accessibility',
    accessibility,
    event.accessibility_notes ? `Further Information: ${event.accessibility_notes}` : '',
  ].filter(Boolean).join('\n')
}

export async function GET(request: NextRequest) {
  const requestedTypes = request.nextUrl.searchParams.get('types')?.split(',') || EVENT_TYPES
  const eventTypes = requestedTypes.filter((type): type is EventType => EVENT_TYPES.includes(type as EventType))

  if (eventTypes.length === 0) {
    return new Response('No event categories selected', { status: 400 })
  }

  const { data, error } = await supabase
    .from('schedule')
    .select('id, title, description, event_type, event_date, event_end_date, event_time, full_address, su_website_url, dda_compliant_ramp_access, lift_access_within_building, accessible_toilets, gender_neutral_toilets, seating_available, alcohol_served, accessibility_notes')
    .in('event_type', eventTypes)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })

  if (error) {
    return new Response('Unable to load calendar events', { status: 500 })
  }

  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const events = (data || []).map((event) => {
    const eventEndDate = event.event_end_date || event.event_date
    const isAllDay = event.event_type === 'hike' || !event.event_time
    const timedEnd = event.event_time ? getTimedEnd(event.event_date, event.event_time, eventEndDate) : null
    const start = isAllDay
      ? `DTSTART;VALUE=DATE:${formatDate(event.event_date)}`
      : `DTSTART;TZID=Europe/London:${formatLocalDateTime(event.event_date, event.event_time)}`
    const end = isAllDay
      ? `DTEND;VALUE=DATE:${getNextDate(eventEndDate)}`
      : `DTEND;TZID=Europe/London:${formatLocalDateTime(timedEnd!.date, timedEnd!.time)}`
    const description = [event.description || 'UMHC event', getAccessibilityDescription(event)].join('\n\n')
    const category = event.event_type === 'hike'
      ? 'DAY HIKES'
      : event.event_type === 'social'
        ? 'SOCIALS'
        : event.event_type === 'residential'
          ? 'WEEKEND TRIPS'
          : 'OTHER'

    return [
      'BEGIN:VEVENT',
      `UID:schedule-${event.id}@umhc.org.uk`,
      `DTSTAMP:${now}`,
      start,
      end,
      `SUMMARY:${escapeICSText(event.title)}`,
      `DESCRIPTION:${escapeICSText(description)}`,
      event.full_address ? `LOCATION:${escapeICSText(event.full_address)}` : '',
      event.su_website_url ? `URL:${event.su_website_url}` : '',
      `CATEGORIES:${category}`,
      'COLOR:#2E4E39',
      'BEGIN:VALARM',
      'TRIGGER:-P10D',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICSText(`${event.title} is in 10 days`)}`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICSText(`${event.title} is tomorrow`)}`,
      'END:VALARM',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
    ].filter(Boolean).join('\r\n')
  })

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UMHC//Schedule Subscription//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:UMHC Schedule',
    'COLOR:#2E4E39',
    'X-APPLE-CALENDAR-COLOR:#2E4E39',
    'X-WR-TIMEZONE:Europe/London',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/London',
    'X-LIC-LOCATION:Europe/London',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0000',
    'TZOFFSETTO:+0100',
    'TZNAME:BST',
    'DTSTART:19700329T010000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0000',
    'TZNAME:GMT',
    'DTSTART:19701025T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n') + '\r\n'

  return new Response(calendar, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="umhc-schedule.ics"',
      'Cache-Control': 'public, max-age=900, s-maxage=900',
    },
  })
}