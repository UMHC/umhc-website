import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { EventType } from '@/types/schedule'

const EVENT_TYPES: EventType[] = ['hike', 'social', 'residential', 'other']

function escapeICSText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

function formatDateTime(date: string, time: string | null): string {
  const dateTime = new Date(`${date}T${time || '09:00:00'}`)
  return dateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function formatEndDateTime(date: string, time: string | null): string {
  const dateTime = new Date(`${date}T${time || '09:00:00'}`)
  dateTime.setHours(dateTime.getHours() + 2)
  return dateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export async function GET(request: NextRequest) {
  const requestedTypes = request.nextUrl.searchParams.get('types')?.split(',') || EVENT_TYPES
  const eventTypes = requestedTypes.filter((type): type is EventType => EVENT_TYPES.includes(type as EventType))

  if (eventTypes.length === 0) {
    return new Response('No event categories selected', { status: 400 })
  }

  const { data, error } = await supabase
    .from('schedule')
    .select('id, title, description, event_type, event_date, event_time, full_address, su_website_url')
    .in('event_type', eventTypes)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })

  if (error) {
    return new Response('Unable to load calendar events', { status: 500 })
  }

  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const events = (data || []).map((event) => {
    const start = formatDateTime(event.event_date, event.event_time)
    const end = formatEndDateTime(event.event_date, event.event_time)
    const description = event.description || 'UMHC event'
    const location = event.full_address || 'Manchester'

    return [
      'BEGIN:VEVENT',
      `UID:schedule-${event.id}@umhc.org.uk`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeICSText(event.title)}`,
      `DESCRIPTION:${escapeICSText(description)}`,
      `LOCATION:${escapeICSText(location)}`,
      event.su_website_url ? `URL:${event.su_website_url}` : '',
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