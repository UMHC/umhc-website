export type EventType = 'hike' | 'social' | 'residential' | 'other'

export interface ScheduleEvent {
  id: number
  title: string
  description: string | null
  event_type: EventType
  event_date: string
  event_time: string | null
  full_address: string | null
  what3words: string | null
  su_website_url: string | null
  dda_compliant_ramp_access: boolean
  lift_access_within_building: boolean
  accessible_toilets: boolean
  gender_neutral_toilets: boolean
  seating_available: boolean
  alcohol_served: boolean
  accessibility_notes: string | null
  event_image: string | null
  created_at: string
  updated_at: string
}