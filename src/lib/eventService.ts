import { supabaseAdmin } from './supabase-admin';
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

export interface UpdateEventData extends Partial<CreateEventData> {
  id: number;
}

export class EventService {
  static async createEvent(eventData: CreateEventData): Promise<ScheduleEvent> {
    // Clean the data - convert empty strings to null for optional fields
    const cleanedData = {
      ...eventData,
      event_time: eventData.event_time?.trim() === '' ? null : eventData.event_time,
      description: eventData.description?.trim() === '' ? null : eventData.description,
      full_address: eventData.full_address?.trim() === '' ? null : eventData.full_address,
      what3words: eventData.what3words?.trim() === '' ? null : eventData.what3words,
      su_website_url: eventData.su_website_url?.trim() === '' ? null : eventData.su_website_url,
      accessibility_notes: eventData.accessibility_notes?.trim() === '' ? null : eventData.accessibility_notes,
      event_image: eventData.event_image?.trim() === '' ? null : eventData.event_image,
    };

    const { data, error } = await supabaseAdmin
      .from('schedule')
      .insert([cleanedData])
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
    
    // First, check if the event exists
    const { data: existingEvent, error: fetchError } = await supabaseAdmin
      .from('schedule')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }

    // Clean the data - convert empty strings to null for optional fields
    const cleanedData = {
      ...updateData,
      event_time: updateData.event_time?.trim() === '' ? null : updateData.event_time,
      description: updateData.description?.trim() === '' ? null : updateData.description,
      full_address: updateData.full_address?.trim() === '' ? null : updateData.full_address,
      what3words: updateData.what3words?.trim() === '' ? null : updateData.what3words,
      su_website_url: updateData.su_website_url?.trim() === '' ? null : updateData.su_website_url,
      accessibility_notes: updateData.accessibility_notes?.trim() === '' ? null : updateData.accessibility_notes,
      event_image: updateData.event_image?.trim() === '' ? null : updateData.event_image,
      updated_at: new Date().toISOString()
    };

    // Perform the update
    const { data, error } = await supabaseAdmin
      .from('schedule')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Update operation completed but no data returned');
    }

    // Clear cache to ensure fresh data
    clearScheduleCache();
    
    return data;
  }

  static async deleteEvent(id: number): Promise<void> {
    const { error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
