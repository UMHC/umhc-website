# Authorization Middleware Guide

This directory contains centralized authorization middleware for standardizing role-based access control across all API routes.

## Overview

The authorization middleware provides a consistent, secure way to handle authentication and authorization in API routes, replacing the inconsistent patterns previously used throughout the codebase.

## Key Benefits

1. **Standardized Error Responses**: Consistent error format across all endpoints
2. **Simplified API Routes**: Reduces auth code from ~30 lines to 1-3 lines
3. **Security Auditing**: Built-in logging for all authentication events
4. **Type Safety**: Full TypeScript support with proper types
5. **Flexible Permission System**: Multiple approaches for different use cases

## Available Middleware Functions

### `requireAuthentication(request?: NextRequest)`
Basic authentication check - ensures user is logged in.

```typescript
export async function GET(request: NextRequest) {
  const authResult = await requireAuthentication(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { user, roles, permissions } = authResult.data;
  // User is authenticated - proceed with business logic
}
```

### `requireCommitteeAccess(request?: NextRequest)`
Requires committee member role.

```typescript
export async function POST(request: NextRequest) {
  const authResult = await requireCommitteeAccess(request);
  if (!authResult.success) {
    return authResult.response;
  }

  // User has committee access
  const { user } = authResult.data;
}
```

### `requireFinanceAccess(request?: NextRequest)`
Requires finance permissions (committee OR treasurer access).

```typescript
export async function POST(request: NextRequest) {
  const authResult = await requireFinanceAccess(request);
  if (!authResult.success) {
    return authResult.response;
  }

  // User has finance access
  const { user, hasCommitteeAccess, hasTreasurerAccess } = authResult.data;
}
```

### `requireTreasurerAccess(request?: NextRequest)`
Requires specific treasurer permissions.

```typescript
export async function POST(request: NextRequest) {
  const authResult = await requireTreasurerAccess(request);
  if (!authResult.success) {
    return authResult.response;
  }

  // User has treasurer access
  const { user } = authResult.data;
}
```

### `requireAdminAccess(request?: NextRequest)`
Requires administrative access (currently same as committee, expandable).

```typescript
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdminAccess(request);
  if (!authResult.success) {
    return authResult.response;
  }

  // User has admin access
}
```

### `requireMinimumPermission(level: PermissionLevel, request?: NextRequest)`
Flexible permission checking with minimum level requirement.

```typescript
import { PermissionLevel } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  const authResult = await requireMinimumPermission(PermissionLevel.COMMITTEE, request);
  if (!authResult.success) {
    return authResult.response;
  }

  // User meets minimum permission level
}
```

## Permission Hierarchy

The system uses a hierarchical permission model:

```typescript
enum PermissionLevel {
  MEMBER = 0,      // Basic authenticated user
  TREASURER = 1,   // Finance access
  COMMITTEE = 2,   // Committee member access
  ADMIN = 3        // Administrative access (future expansion)
}
```

## AuthResult Structure

All middleware functions return a standardized result:

```typescript
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

interface AuthFailureResult {
  success: false;
  response: NextResponse<AuthErrorResponse>;
}
```

## Error Response Format

All authentication/authorization errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": "Additional context",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

Common error codes:
- `AUTH_REQUIRED`: User not logged in
- `USER_NOT_FOUND`: Valid session but user data missing
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `AUTH_SYSTEM_ERROR`: Authentication system failure

## Security Auditing

The middleware includes built-in security event logging:

```typescript
import { logSecurityEvent } from '@/middleware/auth';

// Log custom security events
logSecurityEvent('custom_action_attempted', {
  userId: user.id,
  userEmail: user.email,
  additionalData: 'value'
}, request);
```

## Migration Examples

### Before (Old Pattern)
```typescript
export async function POST(request: NextRequest) {
  try {
    const { getUser, isAuthenticated, getRoles, getPermissions } = getKindeServerSession();

    if (!isAuthenticated()) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const [roles, permissions] = await Promise.all([getRoles(), getPermissions()]);
    const hasCommitteeRole = roles?.some(role => role.key === 'is-committee');
    const hasTreasurerPermission = permissions?.permissions?.includes('is-treasurer') ?? false;

    if (!hasCommitteeRole && !hasTreasurerPermission) {
      return NextResponse.json({
        error: 'Insufficient permissions. Committee or treasurer access required.'
      }, { status: 403 });
    }

    // Business logic here...
  } catch (error) {
    // Error handling...
  }
}
```

### After (New Pattern)
```typescript
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireFinanceAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.data;
    // Business logic here...
  } catch (error) {
    // Error handling...
  }
}
```

## Integration with Existing Code

The middleware is designed to work alongside existing `/src/lib/permissions.ts` functions:

```typescript
import { hasCommitteePermission, hasFinancePermission } from '@/lib/permissions';
import { requireAuthentication } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  const authResult = await requireAuthentication(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { roles } = authResult.data;

  // Still use existing permission functions if needed
  if (hasCommitteePermission(roles)) {
    // Committee-specific logic
  }
}
```

## Best Practices

1. **Choose the Right Middleware**: Use the most specific middleware for your needs
2. **Handle Errors Consistently**: Always check `authResult.success` first
3. **Log Security Events**: Use `logSecurityEvent` for audit trails
4. **Validate Input**: Auth middleware only handles authentication, still validate business logic
5. **Use TypeScript**: Take advantage of the full type safety provided

## Testing

Test your API routes with different user permission levels:

```bash
# Test with different user roles
curl -H "Authorization: Bearer <committee-token>" /api/committee/events
curl -H "Authorization: Bearer <treasurer-token>" /api/finance/transactions
curl -H "Authorization: Bearer <member-token>" /api/finance/transactions # Should fail
```

## Future Enhancements

The middleware is designed to be easily extensible:

1. **Role-Based Access Control (RBAC)**: Add more granular role checking
2. **Resource-Level Permissions**: Check permissions on specific resources
3. **Rate Limiting**: Add rate limiting by user/role
4. **Session Management**: Enhanced session tracking and management
5. **Audit Dashboard**: Web interface for reviewing security logs