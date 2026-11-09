// src/screens/HelpScreen.jsx
import React from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function HelpScreen() {
  const contact = (label, value, url) => (
    <TouchableOpacity onPress={() => Linking.openURL(url)} style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.title}>Need help?</Text>
      <Text style={s.body}>
        Reach the FAZ team for account, ticket, shop, or accreditation issues.
      </Text>

      <View style={s.card}>
        {contact('📧 Email', 'tickets@faz.co.zm', 'mailto:tickets@faz.co.zm')}
        {contact('📞 Phone', '+260 211 123 456', 'tel:+260211123456')}
        {contact('🌐 Main site', 'www.faz.kanchtech.com', 'https://www.faz.kanchtech.com')}
      </View>

      <Text style={s.footer}>Football Association of Zambia</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900', color: colors.ink },
  body: { color: colors.muted, marginTop: 6, marginBottom: 20, lineHeight: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 11, fontWeight: '900', color: colors.muted, letterSpacing: 1 },
  value: { color: colors.primary, fontWeight: '800', marginTop: 4 },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 24 },
});