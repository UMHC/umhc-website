import { KindeRoles } from '@kinde-oss/kinde-auth-nextjs/types';

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
