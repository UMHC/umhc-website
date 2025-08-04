import { supabase } from './supabase'
import { ScheduleEvent } from '@/types/schedule'

const CACHE_KEY = 'umhc_schedule_data'
const CACHE_EXPIRY_KEY = 'umhc_schedule_expiry'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

function isCacheValid(): boolean {
  if (typeof window === 'undefined') return false
  
  const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
  if (!expiry) return false
  
  return Date.now() < parseInt(expiry)
}

function getCachedData(): ScheduleEvent[] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached || !isCacheValid()) {
      clearCache()
      return null
    }
    
    return JSON.parse(cached)
  } catch (error) {
    clearCache()
    return null
  }
}

function setCachedData(data: ScheduleEvent[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString())
  } catch (error) {
    // Silently handle caching error
  }
}

function clearCache(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(CACHE_EXPIRY_KEY)
}

export async function getScheduleEvents(): Promise<ScheduleEvent[]> {
  // Check cache first
  const cachedData = getCachedData()
  if (cachedData) {
    return cachedData
  }

  // Fetch from database if no valid cache
  const { data, error } = await supabase
    .from('schedule')
    .select('*')
    .order('event_date', { ascending: true })

  if (error) {
    throw error
  }

  const events = data || []
  
  // Cache the fresh data
  setCachedData(events)
  
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

export async function refreshScheduleEvents(): Promise<ScheduleEvent[]> {
  clearCache()
  return getScheduleEvents()
}