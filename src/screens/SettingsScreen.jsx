// src/screens/SettingsScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../store/authStore';
import { logout } from '../services/authService';
import { forceFullSync } from '../services/syncService';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../api/client';

export function SettingsScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const event = useAuthStore((s) => s.event);
  const hasRole = useAuthStore((s) => s.hasRole);
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);
  const [syncing, setSyncing] = useState(false);

  const roleList = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];

  const sync = async () => {
    setSyncing(true);
    try {
      await forceFullSync();
      Alert.alert('Sync complete', 'Tickets and cards are up to date.');
    } catch (e) {
      Alert.alert('Sync failed', e.message || 'Try again.');
    } finally {
      setSyncing(false);
    }
  };

  const signOut = () =>
    Alert.alert(
      'Sign out',
      'This will clear all downloaded tickets and cards from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => logout() },
      ],
    );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Settings</Text>

        {/* ACCOUNT */}
        <Text style={s.section}>ACCOUNT</Text>
        <View style={s.card}>
          <Text style={s.label}>SIGNED IN AS</Text>
          <Text style={s.value}>{user?.full_name || user?.email || '—'}</Text>
          <Text style={s.meta}>{user?.email}</Text>
          <View style={s.line} />
          <TouchableOpacity
            onPress={() => navigation.navigate('DrawerProfile')}
            style={s.linkRow}
          >
            <Feather name="user" size={16} color={colors.primary} />
            <Text style={s.linkText}>Manage profile</Text>
            <Feather name="chevron-right" size={16} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('DrawerProfile', { screen: 'ChangePassword' })}
            style={s.linkRow}
          >
            <Feather name="lock" size={16} color={colors.primary} />
            <Text style={s.linkText}>Change password</Text>
            <Feather name="chevron-right" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* SYNC — role gated */}
        {hasAnyRole(['scanner', 'super_admin', 'faz_admin']) && (
          <>
            <Text style={s.section}>SCANNER</Text>
            <View style={s.card}>
              <Text style={s.label}>ASSIGNED MATCH</Text>
              <Text style={s.value}>{event?.event_name || 'Not loaded'}</Text>
              <Text style={s.meta}>{event?.venue || ''}</Text>
              <View style={s.line} />
              <TouchableOpacity style={s.button} onPress={sync} disabled={syncing}>
                <Text style={s.buttonText}>
                  {syncing ? 'Synchronising…' : 'Force re-sync'}
                </Text>
              </TouchableOpacity>
              <Text style={s.meta}>
                The app work both offline and online, but you should sync before scanning to ensure you have the latest tickets and cards.
              </Text>
            </View>
          </>
        )}

        {/* APP */}
        <Text style={s.section}>APP</Text>
        <View style={s.card}>
          <Text style={[s.label, { marginTop: 14 }]}>VERSION</Text>
          <Text style={s.meta}>FAZ Scanner · 1.0.0</Text>
        </View>

        {/* SIGN OUT */}
        <TouchableOpacity style={s.signout} onPress={signOut}>
          <Text style={s.signoutText}>Sign out & clear data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  section: {
    fontSize: 10, fontWeight: '900', letterSpacing: 1.4,
    color: colors.muted, marginTop: 18, marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff', padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: colors.muted },
  value: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 6 },
  meta: { fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18 },
  line: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  linkRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: { flex: 1, color: colors.ink, fontWeight: '800', marginLeft: 10, fontSize: 14 },
  button: {
    backgroundColor: colors.primary, padding: 12, borderRadius: 10,
    alignItems: 'center', marginVertical: 10,
  },
  buttonText: { color: '#fff', fontWeight: '900' },
  signout: { padding: 15, alignItems: 'center', marginTop: 24 },
  signoutText: { color: colors.danger, fontWeight: '900' },
});