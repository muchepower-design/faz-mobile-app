// src/screens/auth/GuestAccountScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { LOGOS } from '../../assets/images';

export function GuestAccountScreen({ navigation }) {
  const goLogin = () => navigation.navigate('Login');
  const goRegister = () => navigation.navigate('Register');

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Image source={LOGOS.faz} style={s.logoImg} resizeMode="contain" />
          <Text style={s.heroTitle}>Football Association of Zambia</Text>
          <Text style={s.heroBody}>
            Browse matches and buy match tickets online, shop official merchandise, and apply for match accreditation.
            Sign in when you're ready to buy or apply.
          </Text>
        </View>

        <TouchableOpacity onPress={goLogin} style={[s.button, s.primary]}>
          <Text style={s.primaryText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goRegister} style={[s.button, s.secondary]}>
          <Text style={s.secondaryText}>Create a free account</Text>
        </TouchableOpacity>

        <View style={s.divider}>
          <View style={s.line} />
          <Text style={s.dividerText}>WHAT YOU CAN DO</Text>
          <View style={s.line} />
        </View>

        <Feature icon="🎟️" title="Buy match tickets" body="Buy Tickets for matches and check out online." />
        <Feature icon="🛍️" title="Shop official gear" body="Buy from verified vendors across Zambia." />
        <Feature icon="🪪" title="Apply for accreditation" body="Per-match access card." />

        <Text style={s.footer}>Football Association of Zambia.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ icon, title, body }) {
  return (
    <View style={s.feature}>
      <Text style={s.featureIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.featureTitle}>{title}</Text>
        <Text style={s.featureBody}>{body}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 24 },
  logoImg: { width: 96, height: 96, marginBottom: 14 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  heroBody: {
    fontSize: 14, color: colors.muted, textAlign: 'center',
    marginTop: 8, lineHeight: 20, paddingHorizontal: 8,
  },
  button: { borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  secondaryText: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    marginHorizontal: 10, fontSize: 10, fontWeight: '900',
    color: colors.muted, letterSpacing: 1.5,
  },
  feature: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 10,
  },
  featureIcon: { fontSize: 24, marginRight: 12 },
  featureTitle: { fontWeight: '800', color: colors.ink, fontSize: 14 },
  featureBody: { color: colors.muted, fontSize: 12, marginTop: 2, lineHeight: 18 },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 24 },
});