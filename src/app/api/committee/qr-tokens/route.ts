import { NextRequest, NextResponse } from 'next/server';
import { requireCommitteeAccess } from '@/middleware/auth';
import {
  createQRToken,
  getQRTokens,
  toggleQRToken,
  deleteQRToken
} from '@/lib/qr-tokens';

// Add no-cache headers for security
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get all QR tokens
export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    // Check authentication and authorization
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const tokens = await getQRTokens();

    return NextResponse.json({
      success: true,
      tokens
    }, { headers });

  } catch (error) {
    console.error('QR tokens API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

// POST - Create new QR token
export async function POST(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    // Check authentication and authorization
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'QR token name is required' },
        { status: 400, headers }
      );
    }

    const token = await createQRToken(
      name.trim(),
      authResult.data.user.email || undefined
    );

    if (!token) {
      return NextResponse.json(
        { error: 'Failed to create QR token' },
        { status: 500, headers }
      );
    }

    console.log(`QR token created by ${authResult.data.user.email}: ${name}`);

    return NextResponse.json({
      success: true,
      token,
      message: 'QR token created successfully'
    }, { headers });

  } catch (error) {
    console.error('QR token creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

// PATCH - Toggle QR token enabled/disabled
export async function PATCH(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    // Check authentication and authorization
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const body = await request.json();
    const { tokenId, enabled } = body;

    if (!tokenId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Token ID and enabled status are required' },
        { status: 400, headers }
      );
    }

    const success = await toggleQRToken(tokenId, enabled);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update QR token' },
        { status: 500, headers }
      );
    }

    console.log(`QR token ${enabled ? 'enabled' : 'disabled'} by ${authResult.data.user.email}: ${tokenId}`);

    return NextResponse.json({
      success: true,
      message: `QR token ${enabled ? 'enabled' : 'disabled'} successfully`
    }, { headers });

  } catch (error) {
    console.error('QR token toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

// DELETE - Delete QR token
export async function DELETE(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    // Check authentication and authorization
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const body = await request.json();
    const { tokenId } = body;

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400, headers }
      );
    }

    const success = await deleteQRToken(tokenId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete QR token' },
        { status: 500, headers }
      );
    }

    console.log(`QR token deleted by ${authResult.data.user.email}: ${tokenId}`);

    return NextResponse.json({
      success: true,
      message: 'QR token deleted successfully'
    }, { headers });

  } catch (error) {
    console.error('QR token deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}