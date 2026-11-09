// src/screens/NotificationsScreen.jsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export function NotificationsScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.title}>You’re all caught up</Text>
          <Text style={s.body}>
            Notifications about your tickets, shop orders, and accreditation
            applications will appear here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '900', color: colors.ink },
  body: { color: colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});