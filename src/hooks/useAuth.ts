import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    getClaim,
    getPermission
  } = useKindeBrowserClient();

  // Check if user has the 'is-committee' role
  const hasCommitteeRole = () => {
    if (!isAuthenticated || !user) return false;
    
    // Get roles from Kinde - roles are stored as a claim
    const roles = getClaim("roles");
    
    // roles is an object with name and value properties
    // We need to check if the value contains 'is-committee'
    if (roles && typeof roles === 'object' && 'value' in roles) {
      // roles.value might be a string or array
      const roleValue = roles.value as string | string[];
      if (typeof roleValue === 'string') {
        return roleValue === 'is-committee';
      }
      if (Array.isArray(roleValue)) {
        return roleValue.includes('is-committee');
      }
    }
    
    return false;
  };

  // Check if user has a specific permission
  const hasPermission = (permission: string) => {
    if (!isAuthenticated) return false;
    return getPermission(permission)?.isGranted || false;
  };

  // Get user role for display purposes
  const getUserRole = () => {
    if (!isAuthenticated || !user) return null;
    
    const roles = getClaim("roles");
    if (roles && typeof roles === 'object' && 'value' in roles) {
      return roles.value || "Member";
    }
    
    return "Member";
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    hasCommitteeRole,
    hasPermission,
    getUserRole
  };
}

export default useAuth;
