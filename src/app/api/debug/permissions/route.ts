import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  try {
    const { getUser, isAuthenticated, getRoles, getPermissions } = getKindeServerSession();
    
    if (!isAuthenticated()) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUser();
    const roles = await getRoles();
    const permissions = await getPermissions();

    return NextResponse.json({
      user: {
        id: user?.id,
        email: user?.email,
        given_name: user?.given_name,
        family_name: user?.family_name
      },
      roles: roles,
      permissions: permissions,
      // Check specific permissions
      hasCommitteeRole: roles?.some(role => role.key === 'is-committee') || false,
      hasTreasurerPermission: permissions?.permissions?.includes('is-treasurer') || false,
    });
  } catch (error) {
    console.error('Error checking permissions:', error);
    return NextResponse.json(
      { error: 'Failed to check permissions', details: error },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
