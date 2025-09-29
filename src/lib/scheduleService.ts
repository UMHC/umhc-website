import { supabase } from './supabase'
import { ScheduleEvent } from '@/types/schedule'

const CACHE_KEY = 'umhc_schedule_data'
const CACHE_EXPIRY_KEY = 'umhc_schedule_expiry'
const CACHE_DATE_KEY = 'umhc_schedule_cache_date'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

function isCacheValid(forUpcomingOnly: boolean = false): boolean {
  if (typeof window === 'undefined') return false
  
  const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
  if (!expiry) return false
  
  const isTimeValid = Date.now() < parseInt(expiry)
  
  // For upcoming-only requests, also check if we've crossed into a new day
  // which might make previously "upcoming" events now be "past" events
  if (forUpcomingOnly && isTimeValid) {
    const cacheDate = localStorage.getItem(CACHE_DATE_KEY)
    if (cacheDate) {
      const cachedDateStr = cacheDate
      const todayStr = new Date().toISOString().split('T')[0]
      // If the cache is from a previous day, consider it invalid for upcoming events
      return cachedDateStr === todayStr
    }
  }
  
  return isTimeValid
}

function getCachedData(forUpcomingOnly: boolean = false): ScheduleEvent[] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached || !isCacheValid(forUpcomingOnly)) {
      clearCache()
      return null
    }
    
    return JSON.parse(cached)
  } catch {
    clearCache()
    return null
  }
}

function setCachedData(data: ScheduleEvent[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString())
    localStorage.setItem(CACHE_DATE_KEY, today)
  } catch {
    // Silently handle caching error
  }
}

function clearCache(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(CACHE_EXPIRY_KEY)
  localStorage.removeItem(CACHE_DATE_KEY)
}

export async function getScheduleEvents(upcomingOnly: boolean = false): Promise<ScheduleEvent[]> {
  // Check cache first (with date-aware validation for upcoming events)
  const cachedData = getCachedData(upcomingOnly)
  if (cachedData) {
    // Apply date filtering to cached data if requested
    if (upcomingOnly) {
      const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
      return cachedData.filter(event => event.event_date >= today)
    }
    return cachedData
  }

  // Build query with optional date filtering
  let query = supabase
    .from('schedule')
    .select('*')
  
  if (upcomingOnly) {
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    query = query.gte('event_date', today)
  }
  
  query = query.order('event_date', { ascending: true })

  const { data, error } = await query

  if (error) {
    throw error
  }

  const events = data || []
  
  // Cache the fresh data (always cache full dataset)
  setCachedData(events)
  
  // Apply date filtering if requested (in case we cached full data but need filtered results)
  if (upcomingOnly) {
    const today = new Date().toISOString().split('T')[0]
    return events.filter(event => event.event_date >= today)
  }
  
  return events
}

export async function getScheduleEventById(id: number): Promise<ScheduleEvent | null> {
  const { data, error } = await supabase
    .from('schedule')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export function clearScheduleCache(): void {
  clearCache()
}

export function getScheduleEventsFromCache(): ScheduleEvent[] | null {
  return getCachedData()
}

export async function refreshScheduleEvents(upcomingOnly: boolean = false): Promise<ScheduleEvent[]> {
  clearCache()
  return getScheduleEvents(upcomingOnly)
}