import { KindeRoles, KindePermissions } from '@kinde-oss/kinde-auth-nextjs/types';

/**
 * Check if user has permission to manage finances (committee or treasurer)
 */
export function hasFinancePermission(roles: KindeRoles | null): boolean {
  if (!roles) return false;

  const hasCommitteeRole = roles.some(role => role.key === 'is-committee');
  const hasTreasurerRole = roles.some(role => role.key === 'is-treasurer');

  return hasCommitteeRole || hasTreasurerRole;
}

/**
 * Check if user has committee permissions
 */
export function hasCommitteePermission(roles: KindeRoles | null): boolean {
  if (!roles) return false;

  return roles.some(role => role.key === 'is-committee');
}

/**
 * Check if user has treasurer permissions
 */
export function hasTreasurerPermission(roles: KindeRoles | null): boolean {
  if (!roles) return false;

  return roles.some(role => role.key === 'is-treasurer');
}

/**
 * Enhanced finance permission check including Kinde permissions
 */
export function hasEnhancedFinancePermission(
  roles: KindeRoles | null,
  permissions: KindePermissions | null
): boolean {
  if (!roles && !permissions) return false;

  const hasFinanceRole = hasFinancePermission(roles);
  const hasTreasurerPermission = permissions?.permissions?.includes('is-treasurer') || false;

  return hasFinanceRole || hasTreasurerPermission;
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
  const hasTreasurer = hasTreasurerPermission(roles);

  if (hasCommittee && hasTreasurer) return 'Committee & Treasurer';
  if (hasCommittee) return 'Committee';
  if (hasTreasurer) return 'Treasurer';

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
      case 'is-treasurer': return 'Treasurer';
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
  return hasCommitteePermission(roles) ||
         hasTreasurerPermission(roles) ||
         hasSpecificPermission(permissions, 'is-treasurer');
}
