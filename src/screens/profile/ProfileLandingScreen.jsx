// src/screens/profile/ProfileLandingScreen.jsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';

export function ProfileLandingScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);

  const roleList = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const displayName =
    user?.full_name ||
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
    user?.email ||
    '—';

  /**
   * When this screen is inside the drawer stack (`ProfileStack`), the
   * target screens exist locally. When it's the tab, they don't — so we
   * reach up to the drawer.
   */
  const go = (screen) => {
    // Try the sibling route first
    try {
      navigation.navigate(screen);
    } catch {
      // Fallback — go through the drawer shell
      navigation.getParent()?.navigate('DrawerProfile', { screen });
    }
  };

  const openSettings = () => {
    navigation.getParent()?.navigate('DrawerSettings');
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Header card */}
        <View style={s.header}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
          <Text style={s.name}>{displayName}</Text>
          {!!user?.email && <Text style={s.meta}>{user.email}</Text>}
          {roleList.length > 0 && (
            <Text style={s.roles}>{roleList.join(' · ')}</Text>
          )}
        </View>

        {/* Info */}
        <Text style={s.section}>ACCOUNT</Text>
        <View style={s.card}>
          <InfoRow label="Full name"     value={displayName} />
          <InfoRow label="Email"         value={user?.email} />
          <InfoRow label="Phone"         value={user?.phone} />
          <InfoRow label="Role"          value={roleList.join(', ') || '—'} last />
        </View>

        {/* Actions */}
        <Text style={s.section}>MANAGE</Text>
        <ActionTile icon="edit-3"    label="Edit Profile"     hint="Update your name, email and phone"
          onPress={() => go('EditProfile')} />
        <ActionTile icon="lock"      label="Change Password"  hint="Set a new password"
          onPress={() => go('ChangePassword')} />
        <ActionTile icon="settings"  label="App Settings"     hint="Sync, endpoints, sign out"
          onPress={openSettings} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <View style={[s.infoRow, !last && s.infoRowBorder]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

function ActionTile({ icon, label, hint, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.tile}>
      <View style={s.tileIconWrap}>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.tileLabel}>{label}</Text>
        <Text style={s.tileHint}>{hint}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.muted} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  header: {
    alignItems: 'center', padding: 20,
    backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 20,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  name: { fontSize: 20, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  meta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  roles: { color: colors.primary, marginTop: 8, fontWeight: '800', fontSize: 11, letterSpacing: 0.4 },
  section: {
    fontSize: 10, fontWeight: '900', letterSpacing: 1.4,
    color: colors.muted, marginBottom: 8, marginTop: 4,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 14, marginBottom: 20,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  infoValue: { color: colors.ink, fontSize: 13, fontWeight: '800', flex: 1, textAlign: 'right', marginLeft: 12 },
  tile: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  tileIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  tileLabel: { color: colors.ink, fontWeight: '900', fontSize: 14 },
  tileHint: { color: colors.muted, fontSize: 11, marginTop: 2 },
});