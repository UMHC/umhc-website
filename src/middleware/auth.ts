import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeRoles, KindePermissions, KindeUser } from '@kinde-oss/kinde-auth-nextjs/types';
import { hasCommitteePermission, hasFinancePermission, hasTreasurerPermission } from '@/lib/permissions';

/**
 * Standard error response format for all authentication/authorization failures
 */
interface AuthErrorResponse {
  error: string;
  code?: string;
  details?: string;
  timestamp: string;
  path?: string;
}

/**
 * Successful authentication result containing user data and permissions
 */
interface AuthSuccessResult {
  success: true;
  data: {
    user: KindeUser;
    roles: KindeRoles | null;
    permissions: KindePermissions | null;
    hasCommitteeAccess: boolean;
    hasFinanceAccess: boolean;
    hasTreasurerAccess: boolean;
  };
}

/**
 * Failed authentication result with standardized error response
 */
interface AuthFailureResult {
  success: false;
  response: NextResponse<AuthErrorResponse>;
}

/**
 * Combined authentication result type
 */
type AuthResult = AuthSuccessResult | AuthFailureResult;

/**
 * Permission levels in hierarchical order (higher numbers = more permissions)
 */
enum PermissionLevel {
  MEMBER = 0,
  TREASURER = 1,
  COMMITTEE = 2,
  ADMIN = 3
}

/**
 * Get the highest permission level for a user
 */
function getUserPermissionLevel(roles: KindeRoles | null, permissions: KindePermissions | null): PermissionLevel {
  // Committee members have the highest general access
  if (hasCommitteePermission(roles)) {
    return PermissionLevel.COMMITTEE;
  }

  // Treasurers have financial access
  if (hasTreasurerPermission(roles) || permissions?.permissions?.includes('is-treasurer')) {
    return PermissionLevel.TREASURER;
  }

  // Default to member level
  return PermissionLevel.MEMBER;
}

/**
 * Create a standardized error response
 */
function createErrorResponse(
  error: string,
  status: number,
  code?: string,
  details?: string,
  request?: NextRequest
): NextResponse<AuthErrorResponse> {
  const response: AuthErrorResponse = {
    error,
    code,
    details,
    timestamp: new Date().toISOString(),
    path: request?.nextUrl?.pathname
  };

  // Log security events for auditing
  console.warn('Authentication/Authorization failure:', {
    ...response,
    userAgent: request?.headers.get('user-agent'),
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip'),
  });

  return NextResponse.json(response, { status });
}

/**
 * Core authentication check - validates that user is logged in
 */
async function performAuthenticationCheck(request?: NextRequest): Promise<AuthResult> {
  try {
    const { getUser, isAuthenticated, getRoles, getPermissions } = getKindeServerSession();

    // Check if user is authenticated
    if (!isAuthenticated()) {
      return {
        success: false,
        response: createErrorResponse(
          'Authentication required',
          401,
          'AUTH_REQUIRED',
          'You must be logged in to access this resource',
          request
        )
      };
    }

    // Get user data
    const user = await getUser();
    if (!user || !user.email) {
      return {
        success: false,
        response: createErrorResponse(
          'User not found',
          401,
          'USER_NOT_FOUND',
          'Valid user session not found',
          request
        )
      };
    }

    // Get roles and permissions
    const [roles, permissions] = await Promise.all([
      getRoles(),
      getPermissions()
    ]);

    // Calculate permission flags
    const hasCommitteeAccess = hasCommitteePermission(roles);
    const hasFinanceAccess = hasFinancePermission(roles) || permissions?.permissions?.includes('is-treasurer') || false;
    const hasTreasurerAccess = hasTreasurerPermission(roles) || permissions?.permissions?.includes('is-treasurer') || false;

    return {
      success: true,
      data: {
        user,
        roles,
        permissions,
        hasCommitteeAccess,
        hasFinanceAccess,
        hasTreasurerAccess
      }
    };

  } catch (error) {
    console.error('Authentication check failed:', error);
    return {
      success: false,
      response: createErrorResponse(
        'Authentication system error',
        500,
        'AUTH_SYSTEM_ERROR',
        'Failed to verify authentication status',
        request
      )
    };
  }
}

/**
 * Basic authentication middleware - ensures user is logged in
 */
export async function requireAuthentication(request?: NextRequest): Promise<AuthResult> {
  return performAuthenticationCheck(request);
}

/**
 * Committee access middleware - requires committee role
 */
export async function requireCommitteeAccess(request?: NextRequest): Promise<AuthResult> {
  const authResult = await performAuthenticationCheck(request);

  if (!authResult.success) {
    return authResult;
  }

  const { data } = authResult;

  if (!data.hasCommitteeAccess) {
    return {
      success: false,
      response: createErrorResponse(
        'Committee access required',
        403,
        'INSUFFICIENT_PERMISSIONS',
        'This resource requires committee member access',
        request
      )
    };
  }

  return authResult;
}

/**
 * Finance access middleware - requires finance permissions (committee OR treasurer)
 */
export async function requireFinanceAccess(request?: NextRequest): Promise<AuthResult> {
  const authResult = await performAuthenticationCheck(request);

  if (!authResult.success) {
    return authResult;
  }

  const { data } = authResult;

  if (!data.hasFinanceAccess) {
    return {
      success: false,
      response: createErrorResponse(
        'Finance access required',
        403,
        'INSUFFICIENT_PERMISSIONS',
        'This resource requires finance management permissions (committee or treasurer access)',
        request
      )
    };
  }

  return authResult;
}

/**
 * Treasurer access middleware - requires specific treasurer permissions
 */
export async function requireTreasurerAccess(request?: NextRequest): Promise<AuthResult> {
  const authResult = await performAuthenticationCheck(request);

  if (!authResult.success) {
    return authResult;
  }

  const { data } = authResult;

  if (!data.hasTreasurerAccess) {
    return {
      success: false,
      response: createErrorResponse(
        'Treasurer access required',
        403,
        'INSUFFICIENT_PERMISSIONS',
        'This resource requires treasurer-level permissions',
        request
      )
    };
  }

  return authResult;
}

/**
 * Admin access middleware - currently same as committee, but separate for future expansion
 */
export async function requireAdminAccess(request?: NextRequest): Promise<AuthResult> {
  const authResult = await performAuthenticationCheck(request);

  if (!authResult.success) {
    return authResult;
  }

  const { data } = authResult;

  // For now, admin access is same as committee access
  // This can be expanded later with specific admin roles
  if (!data.hasCommitteeAccess) {
    return {
      success: false,
      response: createErrorResponse(
        'Administrative access required',
        403,
        'INSUFFICIENT_PERMISSIONS',
        'This resource requires administrative privileges',
        request
      )
    };
  }

  return authResult;
}

/**
 * Flexible permission middleware - allows specifying minimum permission level
 */
export async function requireMinimumPermission(
  minimumLevel: PermissionLevel,
  request?: NextRequest
): Promise<AuthResult> {
  const authResult = await performAuthenticationCheck(request);

  if (!authResult.success) {
    return authResult;
  }

  const { data } = authResult;
  const userLevel = getUserPermissionLevel(data.roles, data.permissions);

  if (userLevel < minimumLevel) {
    const levelNames = {
      [PermissionLevel.MEMBER]: 'member',
      [PermissionLevel.TREASURER]: 'treasurer',
      [PermissionLevel.COMMITTEE]: 'committee',
      [PermissionLevel.ADMIN]: 'administrator'
    };

    return {
      success: false,
      response: createErrorResponse(
        `Insufficient permissions`,
        403,
        'INSUFFICIENT_PERMISSIONS',
        `This resource requires ${levelNames[minimumLevel]} level access or higher`,
        request
      )
    };
  }

  return authResult;
}

/**
 * Check if user has specific role by key
 */
export function hasRole(roles: KindeRoles | null, roleKey: string): boolean {
  return roles?.some(role => role.key === roleKey) || false;
}

/**
 * Check if user has specific permission by key
 */
export function hasPermission(permissions: KindePermissions | null, permissionKey: string): boolean {
  return permissions?.permissions?.includes(permissionKey) || false;
}

/**
 * Utility function to log security events
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  request?: NextRequest
) {
  const logData = {
    event,
    timestamp: new Date().toISOString(),
    path: request?.nextUrl?.pathname,
    userAgent: request?.headers.get('user-agent'),
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip'),
    ...details
  };

  // In production, this could be sent to a security monitoring service
  console.log('Security Event:', logData);
}

// Export permission level enum for use in API routes
export { PermissionLevel };

// Re-export types for convenience
export type { AuthResult, AuthSuccessResult, AuthFailureResult, AuthErrorResponse };