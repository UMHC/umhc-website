import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { hasCommitteePermission } from "@/lib/permissions";
import { EventService } from '@/lib/eventService';

// POST - Duplicate event
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

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Duplicate event
    const duplicatedEvent = await EventService.duplicateEvent(parseInt(eventId));

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