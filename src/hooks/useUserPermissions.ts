'use client';

import { useState, useEffect } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface UserPermissions {
  canEditFinances: boolean;
  isCommittee: boolean;
  isTreasurer: boolean;
  isLoading: boolean;
}

export const useUserPermissions = (): UserPermissions => {
  const { user, isLoading: userLoading, isAuthenticated, getClaim, getPermission } = useKindeBrowserClient();
  const [permissionsData, setPermissionsData] = useState<UserPermissions>({
    canEditFinances: false,
    isCommittee: false,
    isTreasurer: false,
    isLoading: true
  });

  useEffect(() => {
    if (!userLoading && user && isAuthenticated) {
      // Check if user has committee role
      const roles = getClaim("roles");
      let isCommittee = false;
      
      if (roles && typeof roles === 'object' && 'value' in roles) {
        const roleValue = roles.value as string | string[];
        if (typeof roleValue === 'string') {
          isCommittee = roleValue === 'is-committee';
        }
        if (Array.isArray(roleValue)) {
          isCommittee = roleValue.includes('is-committee');
        }
      }

      // Check if user has treasurer permission
      const isTreasurer = getPermission('is-treasurer')?.isGranted || false;
      const canEditFinances = isCommittee || isTreasurer;

      setPermissionsData({
        canEditFinances,
        isCommittee,
        isTreasurer,
        isLoading: false
      });
    } else if (!userLoading && (!user || !isAuthenticated)) {
      setPermissionsData({
        canEditFinances: false,
        isCommittee: false,
        isTreasurer: false,
        isLoading: false
      });
    }
  }, [user, userLoading, isAuthenticated, getClaim, getPermission]);

  return permissionsData;
};
