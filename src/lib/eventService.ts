import { supabase } from './supabase';
import { ScheduleEvent } from '@/types/schedule';
import { clearScheduleCache } from './scheduleService';

export interface CreateEventData {
  title: string;
  description?: string;
  event_type: 'hike' | 'social' | 'residential' | 'other';
  event_date: string;
  event_time?: string;
  full_address?: string;
  what3words?: string;
  su_website_url?: string;
  dda_compliant_ramp_access?: boolean;
  lift_access_within_building?: boolean;
  accessible_toilets?: boolean;
  gender_neutral_toilets?: boolean;
  seating_available?: boolean;
  alcohol_served?: boolean;
  accessibility_notes?: string;
  event_image?: string;
}

export interface UpdateEventData extends CreateEventData {
  id: number;
}

export class EventService {
  static async createEvent(eventData: CreateEventData): Promise<ScheduleEvent> {
    const { data, error } = await supabase
      .from('schedule')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Clear cache to ensure fresh data
    clearScheduleCache();
    
    return data;
  }

  static async updateEvent(eventData: UpdateEventData): Promise<ScheduleEvent> {
    const { id, ...updateData } = eventData;
    
    const { data, error } = await supabase
      .from('schedule')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Clear cache to ensure fresh data
    clearScheduleCache();
    
    return data;
  }

  static async deleteEvent(id: number): Promise<void> {
    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Clear cache to ensure fresh data
    clearScheduleCache();
  }

  static async getEventById(id: number): Promise<ScheduleEvent | null> {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async duplicateEvent(id: number): Promise<ScheduleEvent> {
    const originalEvent = await this.getEventById(id);
    if (!originalEvent) {
      throw new Error('Event not found');
    }

    // Remove fields that shouldn't be duplicated
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _created_at, updated_at: _updated_at, ...eventData } = originalEvent;
    
    // Update the title to indicate it's a copy
    const duplicatedEventData: CreateEventData = {
      ...eventData,
      title: `${eventData.title} (Copy)`,
      description: eventData.description || undefined,
      event_time: eventData.event_time || undefined,
      full_address: eventData.full_address || undefined,
      what3words: eventData.what3words || undefined,
      su_website_url: eventData.su_website_url || undefined,
      accessibility_notes: eventData.accessibility_notes || undefined,
      event_image: eventData.event_image || undefined,
    };

    return this.createEvent(duplicatedEventData);
  }
}
