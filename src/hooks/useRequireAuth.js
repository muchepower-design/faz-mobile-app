// src/hooks/useRequireAuth.js
import { useCallback } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

/**
 * Returns a guard(action, options) function.
 *
 * Uses navigation.dispatch so the action bubbles up through parent navigators
 * (ScannerStack → MainTabs → RootStack, etc.) until a navigator that has the
 * target screen handles it. This means AuthPrompt works from ANY screen,
 * regardless of how deeply nested.
 */
export function useRequireAuth() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);

  return useCallback(
    (action, opts = {}) => {
      if (user) {
        if (!opts.roles || hasAnyRole(opts.roles)) {
          action?.();
          return true;
        }
        // Logged-in but wrong role
        navigation.dispatch(
          CommonActions.navigate({
            name: 'AuthPrompt',
            params: { reason: 'insufficient_role', requiredRoles: opts.roles },
          }),
        );
        return false;
      }
      // Not logged in
      navigation.dispatch(
        CommonActions.navigate({
          name: 'AuthPrompt',
          params: { reason: opts.reason || 'generic', afterLogin: opts.afterLogin },
        }),
      );
      return false;
    },
    [user, hasAnyRole, navigation],
  );
}