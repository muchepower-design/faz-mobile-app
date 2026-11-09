// src/navigation/DrawerContent.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Feather from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../store/authStore';
import { logout as authLogout } from '../services/authService';
import { colors } from '../theme/colors';

export function DrawerContent(props) {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);

  const displayName =
    user?.full_name ||
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
    user?.email ||
    'User';

  const roleList = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const roleLabel = roleList.join(', ') || 'No role';

  const closeAnd = (fn) => {
    props.navigation.closeDrawer();
    setTimeout(fn, 100);
  };

  const goDrawer = (screenName, params) =>
    closeAnd(() => props.navigation.navigate(screenName, params));

  /** Navigate into a drawer stack and land on a specific child screen. */
  const goDrawerChild = (drawerName, childName, childParams) =>
    closeAnd(() =>
      props.navigation.navigate(drawerName, {
        screen: childName,
        params: childParams,
      }),
    );

  const goTab = (tabName, innerScreen) =>
    closeAnd(() =>
      props.navigation.navigate('Tabs', {
        screen: tabName,
        params: innerScreen ? { screen: innerScreen } : undefined,
      }),
    );

  const handleLogout = () =>
    Alert.alert('Sign out', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => authLogout().catch(() => {}) },
    ]);

  const isCustomer = hasAnyRole(['customer', 'super_admin', 'faz_admin']);
  const canTicketing = hasAnyRole(['super_admin', 'faz_admin', 'club_admin', 'club_officer', 'customer']);
  const canShop = hasAnyRole(['super_admin', 'faz_admin', 'customer']);
  const canAccred = hasAnyRole(['super_admin', 'faz_admin', 'media_officer', 'match_commissioner', 'scanner', 'customer']);
  const canSeeOrders = isCustomer;
  const isAdmin = hasAnyRole(['super_admin', 'faz_admin']);
  const isClub = hasAnyRole(['club_admin', 'club_officer']);
  const isScanner = hasRole('scanner');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Branded header */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.name} numberOfLines={1}>{displayName}</Text>
          <Text style={s.role} numberOfLines={1}>{roleLabel}</Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingVertical: 8 }}>
        {/* Primary */}
        <Item icon="home" label="Home" onPress={() => goTab('HomeTab')} />
        {canTicketing && (
          <Item icon="tag" label="Tickets" onPress={() => goTab('TicketsTab')} />
        )}
        {canShop && (
          <Item icon="shopping-bag" label="Shop" onPress={() => goTab('ShopTab')} />
        )}

        {/* ─── GATE SCANNER (each screen has its own drawer entry) ─── */}
        {isScanner && (
          <>
            <Section label="GATE SCANNER" />
            <Item
              icon="activity"
              label="Scanner Overview"
              onPress={() => goDrawerChild('DrawerScanner', 'ScannerHome')}
            />
            <Item
              icon="camera"
              label="Scan Tickets & Cards"
              onPress={() => goDrawerChild('DrawerScanner', 'ScannerScan')}
            />
            <Item
              icon="search"
              label="Search"
              onPress={() => goDrawerChild('DrawerScanner', 'ScannerSearch')}
            />
            <Item
              icon="list"
              label="Check-in Log"
              onPress={() => goDrawerChild('DrawerScanner', 'ScannerCheck')}
            />
            <Item
              icon="sliders"
              label="Scanner Settings"
              onPress={() => goDrawerChild('DrawerScanner', 'ScannerSettings')}
            />
          </>
        )}

        {/* ─── ACCREDITATION ─── */}
        {canAccred && (
          <>
            <Section label="ACCREDITATION" />
            <Item
              icon="award"
              label="Accreditation Home"
              onPress={() => goDrawerChild('DrawerAccreditation', 'AccreditationLanding')}
            />
            <Item
              icon="file-text"
              label="My Accreditation Cards"
              onPress={() => goDrawerChild('DrawerAccreditation', 'MyCards')}
            />
          </>
        )}

        {/* ─── ACCOUNT ─── */}
        {canSeeOrders && (
          <>
            <Section label="MY ACTIVITY" />
            <Item
              icon="package"
              label="My Orders"
              onPress={() => goDrawer('MyOrders')}
            />
          </>
        )}

        {/* ─── ORGANISATION ─── */}
        {(isAdmin || isClub) && <Section label="ORGANISATION" />}
        {isAdmin && (
          <Item icon="shield" label="Admin Panel" onPress={() => goDrawer('DrawerAdmin')} />
        )}
        {isClub && (
          <Item icon="users" label="Club Dashboard" onPress={() => goDrawer('DrawerClub')} />
        )}

        {/* ─── ACCOUNT ─── */}
        <Section label="ACCOUNT" />
        <Item icon="bell"         label="Notifications"  onPress={() => goDrawer('Notifications')} />
        <Item icon="help-circle"  label="Help & Support" onPress={() => goDrawer('Help')} />
        <Item icon="settings"     label="Settings"       onPress={() => goDrawer('DrawerSettings')} />

        <View style={{ height: 16 }} />

        {/* Profile — near bottom, just above sign out */}
        <Item icon="user" label="Profile" onPress={() => goDrawer('DrawerProfile')} />
      </DrawerContentScrollView>

      {/* Footer */}
      <TouchableOpacity onPress={handleLogout} style={s.footer}>
        <Feather name="log-out" size={18} color={colors.danger} />
        <Text style={s.footerText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

function Section({ label }) {
  return <Text style={s.section}>{label}</Text>;
}

function Item({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.item}>
      <Feather name={icon} size={18} color={colors.primary} style={{ marginRight: 14 }} />
      <Text style={s.itemLabel} numberOfLines={1}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.muted} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  header: {
    paddingTop: 54, paddingBottom: 18, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  name: { color: '#fff', fontWeight: '900', fontSize: 15 },
  role: { color: '#DDF0E2', fontSize: 11, marginTop: 2 },
  section: {
    fontSize: 10, fontWeight: '900', letterSpacing: 1.4,
    color: colors.muted, marginTop: 14, marginBottom: 4, marginHorizontal: 20,
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  itemLabel: { flex: 1, color: colors.ink, fontWeight: '800', fontSize: 14 },
  footer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#fff',
  },
  footerText: { color: colors.danger, fontWeight: '900', marginLeft: 12 },
});