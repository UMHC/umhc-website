import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/eventService';
import { requireCommitteeAccess } from '@/middleware/auth';
import { validateRequestBody, duplicateEventSchema } from '@/lib/validation';

// POST - Duplicate event
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization using centralized middleware
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.data;

    // Validate request body using Zod schema
    const validationResult = await validateRequestBody(request, duplicateEventSchema);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { id: eventId } = validationResult.data;

    // Duplicate event
    const duplicatedEvent = await EventService.duplicateEvent(eventId);

    // Log the action for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log(`Event duplicated: ${duplicatedEvent.title} by ${user.email} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      event: duplicatedEvent,
      message: 'Event duplicated successfully'
    });

  } catch (error) {
    console.error('Event duplication error:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate event' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}