// src/screens/accreditation/AccreditationHomeScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export function AccreditationHomeScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const guard = useRequireAuth();

  const goApply = () => {
    guard(
      () => navigation.navigate('Apply'),
      {
        reason: 'apply',
        roles: ['customer', 'super_admin', 'faz_admin', 'media_officer', 'match_commissioner'],
      },
    );
  };

  const goMyCards = () => {
    guard(
      () => navigation.navigate('MyCards'),
      {
        reason: 'my-cards',
        roles: [
          'customer', 'super_admin', 'faz_admin',
          'media_officer', 'match_commissioner', 'scanner',
        ],
      },
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      {/* Hero */}
      <View style={{ backgroundColor: colors.primary, borderRadius: 16, padding: 20 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Match Accreditation</Text>
        <Text style={{ color: '#DDF0E2', marginTop: 8, lineHeight: 20 }}>
          Apply for a per-match accreditation card. Approved cards include a scannable QR code
          for gate access.
        </Text>
      </View>

      {/* Primary actions */}
      <Action
        label="Apply for a Match"
        subtitle="Choose a match, category, upload photo"
        onPress={goApply}
        icon="🆕"
      />
      <Action
        label="My Cards"
        subtitle="View status, QR code, download"
        onPress={goMyCards}
        icon="🪪"
      />

      {/* Info block */}
      <View
        style={{
          marginTop: 24, backgroundColor: '#fff', borderRadius: 14, padding: 16,
          borderWidth: 1, borderColor: colors.border,
        }}
      >
        <Text style={{ fontWeight: '900', color: colors.ink, marginBottom: 6 }}>Who can apply</Text>
        <Text style={{ color: colors.muted, lineHeight: 20 }}>
          Media, FAZ secretariat, FAZ executive, and service providers (medical, security,
          first aid, ball boys/girls, and more).
        </Text>
        {!user && (
          <Text style={{ color: colors.warning, marginTop: 10, fontWeight: '700' }}>
            You can browse this page as a guest — you’ll be asked to sign in when you tap Apply.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function Action({ label, subtitle, onPress, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 14, padding: 16, marginTop: 12,
        borderWidth: 1, borderColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 28, marginRight: 12 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '900', color: colors.ink, fontSize: 15 }}>{label}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Text style={{ color: colors.primary, fontSize: 20 }}>→</Text>
    </TouchableOpacity>
  );
}