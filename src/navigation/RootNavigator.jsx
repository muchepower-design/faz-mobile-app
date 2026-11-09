// src/navigation/RootNavigator.jsx
import React from 'react';
import { ActivityIndicator, View, Alert, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Feather from 'react-native-vector-icons/Feather';

import { useAuthStore } from '../store/authStore';
import { logout as authLogout } from '../services/authService';
import { colors } from '../theme/colors';
import { LOGOS } from '../assets/images';

// Auth
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { AuthPromptScreen } from '../screens/auth/AuthPromptScreen';
import { GuestAccountScreen } from '../screens/auth/GuestAccountScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { DeviceSetupScreen } from '../screens/DeviceSetupScreen';

// Home
import { HomeDashboardScreen } from '../screens/HomeDashboardScreen';

// Profile
import { ProfileStack } from './DrawerStacks';

// Drawer-only stacks
import {
  TicketingDrawerStack,
  ShopDrawerStack,
  AccreditationDrawerStack,
  OrdersStack,
  CardsStack,
  ScannerDrawerStack,
  SettingsDrawerStack,
  AdminStack,
  ClubStack,
} from './DrawerStacks';

// Drawer extras
import { DrawerContent } from './DrawerContent';
import { DrawerToggleButton } from './DrawerToggleButton';
import { HelpScreen } from '../screens/HelpScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

const RootStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

/* ─── Header with FAZ logo + logout ──────────────────────────────── */
function LogoutButton() {
  const handle = () =>
    Alert.alert('Sign out', 'You will need to sign in again to use this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => authLogout().catch(() => {}) },
    ]);
  return (
    <TouchableOpacity onPress={handle} style={styles.headerBtn}>
      <Image source={LOGOS.faz} style={styles.headerLogo} resizeMode="contain" />
      <Feather name="log-out" size={18} color={colors.danger} />
      <Text style={styles.headerBtnText}>Logout</Text>
    </TouchableOpacity>
  );
}

/* ─── Guest tabs ─────────────────────────────────────────────────── */
import { MatchesScreen } from '../screens/ticketing/MatchesScreen';
import { MatchDetailScreen } from '../screens/ticketing/MatchDetailScreen';
import { MyTicketsScreen } from '../screens/ticketing/MyTicketsScreen';
import { TicketPaymentScreen } from '../screens/ticketing/TicketPaymentScreen';
import { OrderScreen } from '../screens/ticketing/OrderScreen';
import { ShopHomeScreen } from '../screens/shop/ShopHomeScreen';
import { ShopBrowseScreen } from '../screens/shop/ShopBrowseScreen';
import { AdvertDetailScreen } from '../screens/shop/AdvertDetailScreen';
import { CheckoutScreen } from '../screens/shop/CheckoutScreen';
import { ShopPaymentScreen } from '../screens/shop/ShopPaymentScreen';
import { ShopOrdersScreen } from '../screens/shop/ShopOrdersScreen';
import { ShopOrderScreen } from '../screens/shop/ShopOrderScreen';
import { AccreditationHomeScreen } from '../screens/accreditation/AccreditationHomeScreen';
import { ApplyAccreditationScreen } from '../screens/accreditation/ApplyAccreditationScreen';
import { MyAccreditationsScreen } from '../screens/accreditation/MyAccreditationsScreen';
import { AccreditationCardScreen } from '../screens/accreditation/AccreditationCardScreen';

function GuestTicketingStack() {
  const S = createNativeStackNavigator();
  return (
    <S.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { color: colors.ink, fontWeight: '800' },
        headerTintColor: colors.primary,
      }}
    >
      <S.Screen name="MatchesList"   component={MatchesScreen}       options={{ title: 'Matches' }} />
      <S.Screen name="MatchDetail"   component={MatchDetailScreen}   options={{ title: 'Match' }} />
      <S.Screen name="MyTickets"     component={MyTicketsScreen}     options={{ title: 'Checkout' }} />
      <S.Screen name="TicketPayment" component={TicketPaymentScreen} options={{ title: 'Payment' }} />
      <S.Screen name="TicketOrder"   component={OrderScreen}         options={{ title: 'Order' }} />
    </S.Navigator>
  );
}

function GuestShopStack() {
  const S = createNativeStackNavigator();
  return (
    <S.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { color: colors.ink, fontWeight: '800' },
        headerTintColor: colors.primary,
      }}
    >
      <S.Screen name="ShopLanding"  component={ShopHomeScreen}     options={{ title: 'FAZ Shop' }} />
      <S.Screen name="ShopBrowse"   component={ShopBrowseScreen}   options={{ title: 'Browse' }} />
      <S.Screen name="AdvertDetail" component={AdvertDetailScreen} options={{ title: 'Product' }} />
      <S.Screen name="ShopCheckout" component={CheckoutScreen}     options={{ title: 'Checkout' }} />
      <S.Screen name="ShopPayment"  component={ShopPaymentScreen}  options={{ title: 'Payment' }} />
      <S.Screen name="ShopOrders"   component={ShopOrdersScreen}   options={{ title: 'My Orders' }} />
      <S.Screen name="ShopOrder"    component={ShopOrderScreen}    options={{ title: 'Order' }} />
    </S.Navigator>
  );
}

function GuestAccreditationStack() {
  const S = createNativeStackNavigator();
  return (
    <S.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { color: colors.ink, fontWeight: '800' },
        headerTintColor: colors.primary,
      }}
    >
      <S.Screen name="AccreditationLanding" component={AccreditationHomeScreen}  options={{ title: 'Accreditation' }} />
      <S.Screen name="Apply"                component={ApplyAccreditationScreen} options={{ title: 'Apply' }} />
      <S.Screen name="CardView"             component={AccreditationCardScreen}  options={{ title: 'Card' }} />
      <S.Screen name="MyCards"              component={MyAccreditationsScreen}   options={{ title: 'My Cards' }} />
    </S.Navigator>
  );
}

function GuestTabs() {
  const icons = {
    Account: 'user',
    TicketsTab: 'tag',
    ShopTab: 'shopping-bag',
    AccreditationTab: 'credit-card',
  };
  return (
    <Tabs.Navigator
      initialRouteName="Account"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleAlign: 'left',
        headerStyle: {
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: { fontWeight: '900', color: colors.ink },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 65, paddingBottom: 10, paddingTop: 8,
          backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        tabBarIcon: ({ color, size }) => (
          <Feather name={icons[route.name] || 'circle'} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="Account" component={GuestAccountScreen} options={{ title: 'Welcome' }} />
      <Tabs.Screen name="TicketsTab" component={GuestTicketingStack} options={{ title: 'Tickets', headerShown: false }} />
      <Tabs.Screen name="ShopTab" component={GuestShopStack} options={{ title: 'Shop', headerShown: false }} />
      <Tabs.Screen name="AccreditationTab" component={GuestAccreditationStack} options={{ title: 'Accreditation', headerShown: false }} />
    </Tabs.Navigator>
  );
}

/* ─── Logged-in 4-tab shell ─────────────────────────────────────── */
function LoggedInTabs() {
  const hasTicketing = useAuthStore((s) =>
    s.hasAnyRole(['super_admin', 'faz_admin', 'club_admin', 'club_officer', 'customer', 'scanner', 'media_officer', 'match_commissioner']),
  );
  const hasShop = useAuthStore((s) =>
    s.hasAnyRole(['super_admin', 'faz_admin', 'customer', 'scanner', 'media_officer', 'match_commissioner']),
  );

  const icons = {
    HomeTab: 'home',
    TicketsTab: 'tag',
    ShopTab: 'shopping-bag',
    Profile: 'user',
  };

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleAlign: 'left',
        headerStyle: {
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: { fontWeight: '900', color: colors.ink },
        headerLeft: () => <DrawerToggleButton />,
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 65, paddingBottom: 10, paddingTop: 8,
          backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        tabBarIcon: ({ color, size }) => (
          <Feather name={icons[route.name] || 'circle'} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="HomeTab" component={HomeDashboardScreen} options={{ title: 'Home' }} />
      {hasTicketing && (
        <Tabs.Screen
          name="TicketsTab"
          component={TicketingDrawerStack}
          options={{ title: 'Tickets', headerShown: false }}
        />
      )}
      {hasShop && (
        <Tabs.Screen
          name="ShopTab"
          component={ShopDrawerStack}
          options={{ title: 'Shop', headerShown: false }}
        />
      )}
      <Tabs.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: 'Profile', headerShown: false }}
      />
    </Tabs.Navigator>
  );
}

/* ─── Logged-in drawer shell ─────────────────────────────────────── */
function LoggedInShell() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: 300, backgroundColor: colors.bg },
        overlayColor: 'rgba(0,0,0,0.4)',
      }}
    >
      <Drawer.Screen name="Tabs" component={LoggedInTabs} />

      <Drawer.Screen name="DrawerProfile"        component={ProfileStack}               options={{ title: 'Profile' }} />
      <Drawer.Screen name="DrawerSettings"       component={SettingsDrawerStack}        options={{ title: 'Settings' }} />
      <Drawer.Screen name="DrawerScanner"        component={ScannerDrawerStack}         options={{ title: 'Gate Scanner' }} />
      <Drawer.Screen name="DrawerAccreditation"  component={AccreditationDrawerStack}   options={{ title: 'Accreditation' }} />
      <Drawer.Screen name="MyOrders"             component={OrdersStack}                options={{ title: 'My Orders' }} />
      <Drawer.Screen name="MyCards"              component={CardsStack}                 options={{ title: 'My Cards' }} />
      <Drawer.Screen name="DrawerAdmin"          component={AdminStack}                 options={{ title: 'Admin Panel' }} />
      <Drawer.Screen name="DrawerClub"           component={ClubStack}                  options={{ title: 'Club Dashboard' }} />
      <Drawer.Screen name="Notifications"        component={NotificationsScreen}        options={{ title: 'Notifications' }} />
      <Drawer.Screen name="Help"                 component={HelpScreen}                 options={{ title: 'Help & Support' }} />
    </Drawer.Navigator>
  );
}

/* ─── Root ───────────────────────────────────────────────────────── */
export function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const deviceReady = useAuthStore((s) => s.deviceReady);
  const ready = useAuthStore((s) => s.bootstrapped);
  const isScannerUser = useAuthStore((s) => s.hasRole('scanner'));

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user == null ? (
        <>
          <RootStack.Screen name="Guest" component={GuestTabs} />

          <RootStack.Group
            screenOptions={{
              headerShown: true,
              presentation: 'modal',
              headerStyle: { backgroundColor: '#fff' },
              headerTitleStyle: { color: colors.ink, fontWeight: '900' },
              headerTintColor: colors.primary,
            }}
          >
            <RootStack.Screen name="AuthPrompt"     component={AuthPromptScreen}     options={{ title: 'Sign in required' }} />
            <RootStack.Screen name="Login"          component={LoginScreen}          options={{ title: 'Sign in' }} />
            <RootStack.Screen name="Register"       component={RegisterScreen}       options={{ title: 'Create account' }} />
            <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset password' }} />
          </RootStack.Group>
        </>
      ) : (
        <>
          {isScannerUser && !deviceReady ? (
            <RootStack.Screen
              name="DeviceSetup"
              component={DeviceSetupScreen}
              options={{
                headerShown: true,
                title: 'Activate Scanner',
                headerRight: () => <LogoutButton />,
                headerStyle: { backgroundColor: '#fff' },
                headerTitleStyle: { fontWeight: '900', color: colors.ink },
              }}
            />
          ) : (
            <RootStack.Screen name="LoggedIn" component={LoggedInShell} />
          )}
        </>
      )}
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  headerBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, gap: 6 },
  headerLogo: { width: 22, height: 22, marginRight: 2 },
  headerBtnText: { color: colors.danger, fontWeight: '800', fontSize: 13 },
});