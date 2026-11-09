// src/screens/DashboardScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import {
  ticketCount, accreditationCount, checkinCounts,
} from '../database/repository';
import { syncDirectory, forceFullSync } from '../services/syncService';
import { colors } from '../theme/colors';

export function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const event = useAuthStore((s) => s.event);
  const [counts, setCounts] = useState({
    tickets: 0, accreditations: 0, checked: 0, pending: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const load = async (withSync = false) => {
    setRefreshing(true);
    try {
      if (withSync) await syncDirectory();
      const [t, a, c] = await Promise.all([
        ticketCount(),
        accreditationCount(),
        checkinCounts(),
      ]);
      setCounts({
        tickets: t,
        accreditations: a,
        checked: c.total || 0,
        pending: c.pending || 0,
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(true); }, []);

  const onSync = async () => {
    await forceFullSync();
    await load();
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" style={s.safe}>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onSync} />
        }
      >
        <Text style={s.hello}>
          Hello, {user?.first_name || user?.full_name?.split(' ')[0] || 'Team'}
        </Text>
        <Text style={s.sub}>Here is your gate overview for this match.</Text>

        <View style={s.event}>
          <Text style={s.eventTag}>ASSIGNED MATCH</Text>
          <Text style={s.eventName}>
            {event?.event_name || 'No match assigned'}
          </Text>
          <Text style={s.venue}>
            {event?.venue || 'Activate a match in Settings'}
          </Text>
          {event?.event_code ? (
            <Text style={s.eventCode}>{event.event_code}</Text>
          ) : null}
        </View>

        <Text style={s.heading}>Device status</Text>
        <View style={s.grid}>
          <Metric label="Tickets loaded" value={counts.tickets} />
          <Metric label="Cards loaded" value={counts.accreditations} />
          <Metric label="Checked in on device" value={counts.checked} />
          <Metric label="Waiting to sync" value={counts.pending} />
        </View>

        <View style={s.note}>
          <Text style={s.noteTitle}>Offline-ready verification</Text>
          <Text style={s.noteText}>
            Scans are verified so quickly, to enable quick entry at the gate. The app works both online and offline. 
            in an event you loose network connectivity, continue working(Scanning), Data will sync your scans to the server when a connection is available.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }) {
  return (
    <View style={s.metric}>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  hello: { fontSize: 26, fontWeight: '900', color: colors.ink },
  sub: { color: colors.muted, marginTop: 5, marginBottom: 20 },
  event: { backgroundColor: colors.navy, borderRadius: 20, padding: 20, marginBottom: 24 },
  eventTag: { color: '#A9C1FF', fontWeight: '800', fontSize: 10, letterSpacing: 1.4 },
  eventName: { fontSize: 21, fontWeight: '800', color: '#fff', marginTop: 9 },
  venue: { color: '#D4DDF1', marginTop: 6 },
  eventCode: { color: '#A9C1FF', fontWeight: '700', marginTop: 14 },
  heading: { fontSize: 17, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metric: {
    width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  metricValue: { fontSize: 25, fontWeight: '900', color: colors.primary },
  metricLabel: { fontSize: 12, color: colors.muted, marginTop: 5 },
  note: { backgroundColor: '#EAF0FF', padding: 17, borderRadius: 15, marginTop: 22 },
  noteTitle: { fontWeight: '800', color: colors.primaryDark },
  noteText: { color: '#435273', lineHeight: 20, marginTop: 5 },
});