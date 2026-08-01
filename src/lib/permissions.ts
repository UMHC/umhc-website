import { KindeRoles, KindePermissions } from '@kinde-oss/kinde-auth-nextjs/types';

/**
 * Check if user has committee permissions
 */
export function hasCommitteePermission(roles: KindeRoles | null): boolean {
  if (!roles) return false;

  return roles.some(role => role.key === 'is-committee');
}

/**
 * Check if user has specific role by key
 */
export function hasSpecificRole(roles: KindeRoles | null, roleKey: string): boolean {
  if (!roles) return false;
  return roles.some(role => role.key === roleKey);
}

/**
 * Check if user has specific permission by key
 */
export function hasSpecificPermission(permissions: KindePermissions | null, permissionKey: string): boolean {
  if (!permissions) return false;
  return permissions.permissions?.includes(permissionKey) || false;
}

/**
 * Get user's role display name for UI
 */
export function getUserRoleDisplay(roles: KindeRoles | null): string {
  if (!roles) return 'Member';

  const hasCommittee = hasCommitteePermission(roles);

  if (hasCommittee) return 'Committee';

  return 'Member';
}

/**
 * Get all roles as a readable string
 */
export function getAllRolesDisplay(roles: KindeRoles | null): string {
  if (!roles || roles.length === 0) return 'Member';

  const roleNames = roles.map(role => {
    switch (role.key) {
      case 'is-committee': return 'Committee';
      default: return role.name || role.key;
    }
  });

  return roleNames.join(', ');
}

/**
 * Check if user has any elevated permissions (beyond basic member)
 */
export function hasElevatedPermissions(
  roles: KindeRoles | null,
  permissions: KindePermissions | null
): boolean {
  return hasCommitteePermission(roles);
}
