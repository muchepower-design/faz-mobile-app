// src/screens/HomeDashboardScreen.jsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';

export function HomeDashboardScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);

  const drawer = navigation.getParent(); // LoggedInShell drawer

  const goDrawer = (name) => drawer?.navigate(name);

  const displayName =
    user?.first_name || user?.full_name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Welcome */}
        <View style={s.hero}>
          <Text style={s.hi}>Hello, {displayName}</Text>
          <Text style={s.sub}>What would you like to do today?</Text>
        </View>

        {/* Primary actions */}
        <Text style={s.section}>QUICK ACTIONS</Text>
        <View style={s.grid}>
          {hasAnyRole(['super_admin', 'faz_admin', 'club_admin', 'club_officer', 'customer']) && (
            <Tile icon="🎟️" label="Buy Tickets" onPress={() => navigation.navigate('TicketsTab')} />
          )}
          {hasAnyRole(['super_admin', 'faz_admin', 'customer']) && (
            <Tile icon="🛍️" label="Shop" onPress={() => navigation.navigate('ShopTab')} />
          )}
          {hasAnyRole(['super_admin', 'faz_admin', 'media_officer', 'match_commissioner', 'scanner', 'customer']) && (
            <Tile icon="🪪" label="Accreditation" onPress={() => goDrawer('DrawerAccreditation')} />
          )}
          {hasRole('scanner') && (
  <Tile
    icon="📷"
    label="Scan"
    onPress={() =>
      drawer?.navigate('DrawerScanner', { screen: 'ScannerScan' })
    }
  />
)}
{hasRole('scanner') && (
  <Tile
    icon="📊"
    label="Scanner Overview"
    onPress={() =>
      drawer?.navigate('DrawerScanner', { screen: 'ScannerHome' })
    }
  />
)}
          {hasAnyRole(['super_admin', 'faz_admin', 'customer']) && (
            <Tile icon="📦" label="My Orders" onPress={() => goDrawer('MyOrders')} />
          )}
          {hasAnyRole(['super_admin', 'faz_admin', 'media_officer', 'match_commissioner', 'scanner', 'customer']) && (
            <Tile icon="🪪" label="My Cards" onPress={() => goDrawer('MyCards')} />
          )}
          {hasAnyRole(['super_admin', 'faz_admin']) && (
            <Tile icon="🛡️" label="Admin Panel" onPress={() => goDrawer('DrawerAdmin')} />
          )}
          {hasAnyRole(['club_admin', 'club_officer']) && (
            <Tile icon="👥" label="Club Dashboard" onPress={() => goDrawer('DrawerClub')} />
          )}
          <Tile icon="⚙️" label="Settings" onPress={() => goDrawer('DrawerSettings')} />
          <Tile icon="❓" label="Help" onPress={() => goDrawer('Help')} />
        </View>

        {/* Short summary */}
        <Text style={s.section}>YOUR ACCOUNT</Text>
        <View style={s.card}>
          <Text style={s.metaLabel}>SIGNED IN AS</Text>
          <Text style={s.value}>{user?.full_name || user?.email}</Text>
          <Text style={s.meta}>
            {(user?.roles?.length ? user.roles : [user?.role])
              .filter(Boolean)
              .join(', ') || '—'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.tile}>
      <Text style={s.tileIcon}>{icon}</Text>
      <Text style={s.tileLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  hero: {
    backgroundColor: colors.primary, borderRadius: 18, padding: 20, marginBottom: 20,
  },
  hi: { color: '#fff', fontSize: 22, fontWeight: '900' },
  sub: { color: '#DDF0E2', marginTop: 4 },
  section: {
    fontSize: 10, fontWeight: '900', letterSpacing: 1.4,
    color: colors.muted, marginBottom: 8, marginTop: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  tile: {
    width: '31%', aspectRatio: 1,
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', padding: 6,
  },
  tileIcon: { fontSize: 26, marginBottom: 6 },
  tileLabel: { fontSize: 11, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  metaLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: colors.muted },
  value: { fontSize: 16, fontWeight: '900', color: colors.ink, marginTop: 6 },
  meta: { color: colors.muted, marginTop: 4, fontSize: 12 },
});