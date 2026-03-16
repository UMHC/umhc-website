/**
 * Example: Refactored committee events API route using the new auth middleware
 * This demonstrates different middleware functions and usage patterns
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  requireCommitteeAccess,
  requireAuthentication,
  logSecurityEvent,
  PermissionLevel,
  requireMinimumPermission
} from '@/middleware/auth';
import { EventService, CreateEventData, UpdateEventData } from '@/lib/eventService';

// GET - Fetch all events (committee access required)
export async function GET(request: NextRequest) {
  try {
    // Method 1: Using specific committee access middleware
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user, hasCommitteeAccess } = authResult.data;

    // Log access for audit trail
    logSecurityEvent('committee_events_accessed', {
      userId: user.id,
      userEmail: user.email,
      hasCommitteeAccess
    }, request);

    // For now, we'll use the existing schedule service to get events
    const { getScheduleEvents } = await import('@/lib/scheduleService');
    const events = await getScheduleEvents();

    return NextResponse.json({
      success: true,
      events: events
    });

  } catch (error) {
    console.error('Committee events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    // Method 2: Using minimum permission level approach
    const authResult = await requireMinimumPermission(PermissionLevel.COMMITTEE, request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user, roles, permissions } = authResult.data;

    // Log event creation attempt
    logSecurityEvent('event_creation_attempt', {
      userId: user.id,
      userEmail: user.email,
      userRoles: roles?.map(r => r.key) || [],
      userPermissions: permissions?.permissions || []
    }, request);

    const body: CreateEventData = await request.json();

    // Validate required fields
    if (!body.title || !body.event_date || !body.event_type) {
      return NextResponse.json(
        { error: 'Title, date, and event type are required' },
        { status: 400 }
      );
    }

    // Validate event type
    const validTypes = ['hike', 'social', 'residential', 'other'];
    if (!validTypes.includes(body.event_type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Validate date format
    const eventDate = new Date(body.event_date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Create event
    const event = await EventService.createEvent(body);

    // Log successful event creation
    logSecurityEvent('event_created', {
      userId: user.id,
      userEmail: user.email,
      eventId: event.id,
      eventTitle: event.title,
      eventType: event.event_type,
      eventDate: event.event_date
    }, request);

    // Log the action for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log(`Event created: ${event.title} by ${user.email} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      event: event,
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('Event creation error:', error);

    // Log error for security monitoring
    logSecurityEvent('event_creation_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, request);

    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PATCH - Update existing event
export async function PATCH(request: NextRequest) {
  try {
    // Method 3: Using general authentication first, then custom permission check
    const authResult = await requireAuthentication(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user, hasCommitteeAccess } = authResult.data;

    // Custom permission check with detailed error message
    if (!hasCommitteeAccess) {
      logSecurityEvent('unauthorized_event_update_attempt', {
        userId: user.id,
        userEmail: user.email,
        hasCommitteeAccess
      }, request);

      return NextResponse.json(
        {
          error: 'Committee access required',
          details: 'Only committee members can modify events'
        },
        { status: 403 }
      );
    }

    const body: UpdateEventData = await request.json();

    // Validate required fields
    if (!body.id || !body.title || !body.event_date || !body.event_type) {
      return NextResponse.json(
        { error: 'ID, title, date, and event type are required' },
        { status: 400 }
      );
    }

    // Validate that ID is a number
    const eventId = typeof body.id === 'string' ? parseInt(body.id, 10) : body.id;
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Validate event type
    const validTypes = ['hike', 'social', 'residential', 'other'];
    if (!validTypes.includes(body.event_type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Validate date format
    const eventDate = new Date(body.event_date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Update event with proper ID
    const event = await EventService.updateEvent({ ...body, id: eventId });

    // Log successful event update
    logSecurityEvent('event_updated', {
      userId: user.id,
      userEmail: user.email,
      eventId: event.id,
      eventTitle: event.title
    }, request);

    // Log the action for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log(`Event updated: ${event.title} by ${user.email} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      event: event,
      message: 'Event updated successfully'
    });

  } catch (error) {
    console.error('Event update error:', error);

    logSecurityEvent('event_update_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, request);

    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
  try {
    // Demonstrate the most concise approach
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.data;

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get event details for logging before deletion
    const event = await EventService.getEventById(parseInt(eventId));
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete event
    await EventService.deleteEvent(parseInt(eventId));

    // Log event deletion
    logSecurityEvent('event_deleted', {
      userId: user.id,
      userEmail: user.email,
      eventId: parseInt(eventId),
      eventTitle: event.title
    }, request);

    // Log the action for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log(`Event deleted: ${event.title} by ${user.email} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Event deletion error:', error);

    logSecurityEvent('event_deletion_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, request);

    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}