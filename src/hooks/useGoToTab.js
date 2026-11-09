// src/hooks/useGoToTab.js
import { useCallback } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';

/**
 * useGoToTab() returns a function you can use to jump anywhere in the
 * app by route name. It uses a dispatch-based navigation action so the
 * navigator tree decides which level can handle it.
 *
 *   const goToTab = useGoToTab();
 *   goToTab('ScannerTab', 'Home');
 *   goToTab('TicketsTab', 'MatchesList');
 *   goToTab('MyOrders');               // drawer screen
 */
export function useGoToTab() {
  const navigation = useNavigation();

  return useCallback(
    (routeName, innerScreen, innerParams) => {
      try {
        if (innerScreen) {
          navigation.dispatch(
            CommonActions.navigate({
              name: routeName,
              params: innerParams
                ? { screen: innerScreen, params: innerParams }
                : { screen: innerScreen },
            }),
          );
        } else {
          navigation.dispatch(CommonActions.navigate({ name: routeName }));
        }
      } catch (e) {
        console.warn('[useGoToTab] could not navigate to', routeName, e?.message);
      }
    },
    [navigation],
  );
}