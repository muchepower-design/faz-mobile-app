// src/navigation/DrawerStacks.jsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

// Ticketing
import { MatchesScreen } from '../screens/ticketing/MatchesScreen';
import { MatchDetailScreen } from '../screens/ticketing/MatchDetailScreen';
import { MyTicketsScreen } from '../screens/ticketing/MyTicketsScreen';
import { TicketPaymentScreen } from '../screens/ticketing/TicketPaymentScreen';
import { OrderScreen } from '../screens/ticketing/OrderScreen';

// Shop
import { ShopHomeScreen } from '../screens/shop/ShopHomeScreen';
import { ShopBrowseScreen } from '../screens/shop/ShopBrowseScreen';
import { AdvertDetailScreen } from '../screens/shop/AdvertDetailScreen';
import { CheckoutScreen } from '../screens/shop/CheckoutScreen';
import { ShopPaymentScreen } from '../screens/shop/ShopPaymentScreen';
import { ShopOrdersScreen } from '../screens/shop/ShopOrdersScreen';
import { ShopOrderScreen } from '../screens/shop/ShopOrderScreen';

// Accreditation
import { AccreditationHomeScreen } from '../screens/accreditation/AccreditationHomeScreen';
import { ApplyAccreditationScreen } from '../screens/accreditation/ApplyAccreditationScreen';
import { MyAccreditationsScreen } from '../screens/accreditation/MyAccreditationsScreen';
import { AccreditationCardScreen } from '../screens/accreditation/AccreditationCardScreen';

// Scanner (5-tab → flattened to a stack for drawer usage)
import { DashboardScreen } from '../screens/DashboardScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Profile
import { ProfileLandingScreen } from '../screens/profile/ProfileLandingScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';

// Placeholder org screens
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ClubDashboardScreen } from '../screens/club/ClubDashboardScreen';

const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: '#fff' },
  headerTitleStyle: { color: colors.ink, fontWeight: '900' },
  headerTintColor: colors.primary,
};

/* ─── Ticketing stack (drawer entry) ──────────────────────────────── */
export function TicketingDrawerStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="MatchesList"   component={MatchesScreen}       options={{ title: 'Matches' }} />
      <Stack.Screen name="MatchDetail"   component={MatchDetailScreen}   options={{ title: 'Match' }} />
      <Stack.Screen name="MyTickets"     component={MyTicketsScreen}     options={{ title: 'Checkout' }} />
      <Stack.Screen name="TicketPayment" component={TicketPaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="TicketOrder"   component={OrderScreen}         options={{ title: 'Order' }} />
    </Stack.Navigator>
  );
}

/* ─── Shop stack (drawer entry) ───────────────────────────────────── */
export function ShopDrawerStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ShopLanding"  component={ShopHomeScreen}     options={{ title: 'FAZ Shop' }} />
      <Stack.Screen name="ShopBrowse"   component={ShopBrowseScreen}   options={{ title: 'Browse' }} />
      <Stack.Screen name="AdvertDetail" component={AdvertDetailScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="ShopCheckout" component={CheckoutScreen}     options={{ title: 'Checkout' }} />
      <Stack.Screen name="ShopPayment"  component={ShopPaymentScreen}  options={{ title: 'Payment' }} />
      <Stack.Screen name="ShopOrders"   component={ShopOrdersScreen}   options={{ title: 'My Orders' }} />
      <Stack.Screen name="ShopOrder"    component={ShopOrderScreen}    options={{ title: 'Order' }} />
    </Stack.Navigator>
  );
}

/* ─── Orders stack (for the "My Orders" drawer item) ─────────────── */
export function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="OrdersList"  component={ShopOrdersScreen}   options={{ title: 'My Orders' }} />
      <Stack.Screen name="ShopOrder"   component={ShopOrderScreen}    options={{ title: 'Order' }} />
      <Stack.Screen name="ShopPayment" component={ShopPaymentScreen}  options={{ title: 'Payment' }} />
    </Stack.Navigator>
  );
}

/* ─── Accreditation stack ────────────────────────────────────────── */
export function AccreditationDrawerStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AccreditationLanding" component={AccreditationHomeScreen}  options={{ title: 'Accreditation' }} />
      <Stack.Screen name="Apply"                component={ApplyAccreditationScreen} options={{ title: 'Apply' }} />
      <Stack.Screen name="CardView"             component={AccreditationCardScreen}  options={{ title: 'Card' }} />
      <Stack.Screen name="MyCards"              component={MyAccreditationsScreen}   options={{ title: 'My Cards' }} />
    </Stack.Navigator>
  );
}

/* ─── "My Cards" is a subset of Accreditation — same stack reused ── */
export function CardsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="CardsList" component={MyAccreditationsScreen}   options={{ title: 'My Cards' }} />
      <Stack.Screen name="CardView"  component={AccreditationCardScreen}  options={{ title: 'Card' }} />
      <Stack.Screen name="Apply"     component={ApplyAccreditationScreen} options={{ title: 'Apply' }} />
    </Stack.Navigator>
  );
}

/* ─── Scanner stack (drawer entry) ───────────────────────────────── */
export function ScannerDrawerStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ScannerHome"   component={DashboardScreen}  options={{ title: 'Gate Scanner' }} />
      <Stack.Screen name="ScannerScan"   component={ScannerScreen}    options={{ title: 'Scan' }} />
      <Stack.Screen name="ScannerSearch" component={SearchScreen}     options={{ title: 'Search' }} />
      <Stack.Screen name="ScannerCheck"  component={AttendanceScreen} options={{ title: 'Check-ins' }} />
      <Stack.Screen name="ScannerSettings" component={SettingsScreen} options={{ title: 'Scanner Settings' }} />
    </Stack.Navigator>
  );
}

/* ─── Profile stack ──────────────────────────────────────────────── */
export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ProfileLanding" component={ProfileLandingScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="EditProfile"    component={EditProfileScreen}    options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    </Stack.Navigator>
  );
}

/* ─── Settings stack ────────────────────────────────────────────── */
export function SettingsDrawerStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

/* ─── Admin / Club placeholder stacks ───────────────────────────── */
export function AdminStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminHome" component={AdminDashboardScreen} options={{ title: 'Admin Panel' }} />
    </Stack.Navigator>
  );
}

export function ClubStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ClubHome" component={ClubDashboardScreen} options={{ title: 'Club Dashboard' }} />
    </Stack.Navigator>
  );
}