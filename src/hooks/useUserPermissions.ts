'use client';

import { useState, useEffect } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface UserPermissions {
  isCommittee: boolean;
  isLoading: boolean;
}

export const useUserPermissions = (): UserPermissions => {
  const { user, isLoading: userLoading, isAuthenticated, getClaim, getPermission } = useKindeBrowserClient();
  const [permissionsData, setPermissionsData] = useState<UserPermissions>({
    isCommittee: false,
    isLoading: true
  });

  useEffect(() => {
    if (!userLoading && user && isAuthenticated) {
      // Check for committee permission
      const isCommittee = getPermission('is-committee')?.isGranted || false;

      setPermissionsData({
        isCommittee,
        isLoading: false
      });
    } else if (!userLoading && (!user || !isAuthenticated)) {
      setPermissionsData({
        isCommittee: false,
        isLoading: false
      });
    }
  }, [user, userLoading, isAuthenticated, getClaim, getPermission]);

  return permissionsData;
};
