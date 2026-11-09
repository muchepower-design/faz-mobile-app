// src/screens/AttendanceScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { recentCheckins } from '../database/repository';
import { colors } from '../theme/colors';

export function AttendanceScreen() {
  const [rows, setRows] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const items = await recentCheckins(300);
      setRows(items);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView className="flex-1 bg-canvas" style={s.safe}>
      <View style={s.content}>
        <Text style={s.title}>Check-in log</Text>
        <Text style={s.sub}>Recent scans recorded by this device.</Text>

        <FlatList
          data={rows}
          keyExtractor={(x) => x.local_id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={load} />
          }
          ListEmptyComponent={
            <Text style={s.empty}>No check-ins recorded yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.person}>
                  {item.kind === 'accreditation'
                    ? item.holder_name || 'Accreditation card'
                    : 'Ticket ' + item.target_id.slice(0, 8)}
                </Text>
                <Text style={s.meta}>
                  {new Date(item.scanned_at).toLocaleString()}
                  {' · '}
                  {String(item.method).toUpperCase()}
                  {' · '}
                  {item.kind === 'accreditation' ? 'ACCREDITATION' : 'TICKET'}
                </Text>
              </View>
              <Text
                style={[
                  s.status,
                  item.sync_status === 'pending' ? s.pending : s.synced,
                ]}
              >
                {item.sync_status}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, flex: 1 },
  title: { fontSize: 23, fontWeight: '900', color: colors.ink },
  sub: { color: colors.muted, marginTop: 5, marginBottom: 16 },
  row: {
    backgroundColor: '#fff', padding: 14, borderRadius: 13, marginBottom: 9,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  person: { fontWeight: '800', color: colors.ink },
  meta: { fontSize: 11, color: colors.muted, marginTop: 5 },
  status: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  pending: { color: colors.warning },
  synced: { color: colors.success },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});