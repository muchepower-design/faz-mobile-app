// src/screens/club/ClubDashboardScreen.jsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

export function ClubDashboardScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.heroTitle}>Club Dashboard</Text>
          <Text style={s.heroBody}>
            Manage your club — matches, ticket sales and squad.
          </Text>
        </View>

        <Text style={s.section}>COMING SOON</Text>
        <View style={s.card}>
          <Text style={s.placeholder}>
            Club management tools are being built for the mobile app. For now,
            use the FAZ web club dashboard at
          </Text>
          <Text style={s.url}>www.server.faz.kanchtech.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  hero: { backgroundColor: colors.orange, borderRadius: 16, padding: 20, marginBottom: 20 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  heroBody: { color: '#FFE7CC', marginTop: 6, lineHeight: 20 },
  section: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4, color: colors.muted, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border },
  placeholder: { color: colors.ink, lineHeight: 20 },
  url: { color: colors.primary, fontWeight: '800', marginTop: 8 },
});