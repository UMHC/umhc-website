import { NextRequest, NextResponse } from 'next/server';
import { getBannerMessages } from '@/lib/bannerService';
import { requireCommitteeAccess } from '@/middleware/auth';

// GET endpoint - fetch banner messages (public)
export async function GET() {
  try {
    const messages = await getBannerMessages();
    
    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching banner messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch banner messages',
      },
      { status: 500 }
    );
  }
}

// PUT endpoint - update banner messages (committee only)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and authorization using centralized middleware
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.data;

    // Get the new messages from request body
    const { messages } = await request.json();

    // Validate messages structure
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid messages format',
        },
        { status: 400 }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (typeof msg.text !== 'string' || typeof msg.order !== 'number') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid message structure',
          },
          { status: 400 }
        );
      }
    }

    // Update Edge Config via Vercel API
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_API_TOKEN;

    if (!edgeConfigId || !vercelToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Edge Config not properly configured',
        },
        { status: 500 }
      );
    }

    // Update the banner_messages key in Edge Config
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'upsert',
              key: 'banner_messages',
              value: messages,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update Edge Config:', errorText);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update banner messages',
        },
        { status: 500 }
      );
    }

    // Log the action for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log(`Banner messages updated by ${user.email} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Banner messages updated successfully',
    });
  } catch (error) {
    console.error('Error updating banner messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
