import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { hasCommitteePermission } from "@/lib/permissions";
import { EventService, CreateEventData, UpdateEventData } from '@/lib/eventService';

// GET - Fetch all events (same as regular schedule but with committee auth)
export async function GET() {
  try {
    const { getUser, getRoles } = getKindeServerSession();
    const user = await getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const roles = await getRoles();
    const hasAccess = hasCommitteePermission(roles);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Committee access required' },
        { status: 403 }
      );
    }

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
    const { getUser, getRoles } = getKindeServerSession();
    const user = await getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const roles = await getRoles();
    const hasAccess = hasCommitteePermission(roles);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Committee access required' },
        { status: 403 }
      );
    }

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
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PATCH - Update existing event
export async function PATCH(request: NextRequest) {
  try {
    const { getUser, getRoles } = getKindeServerSession();
    const user = await getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const roles = await getRoles();
    const hasAccess = hasCommitteePermission(roles);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Committee access required' },
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
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const { getUser, getRoles } = getKindeServerSession();
    const user = await getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const roles = await getRoles();
    const hasAccess = hasCommitteePermission(roles);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Committee access required' },
        { status: 403 }
      );
    }

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
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}