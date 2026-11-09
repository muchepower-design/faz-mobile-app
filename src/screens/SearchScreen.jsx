// src/screens/SearchScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  searchTickets, searchAccreditations,
} from '../database/repository';
import { HolderCard } from '../components/HolderCard';
import { colors } from '../theme/colors';

export function SearchScreen() {
  const [term, setTerm] = useState('');
  const [tickets, setTickets] = useState([]);
  const [accreditations, setAccreditations] = useState([]);
  const [selected, setSelected] = useState(null); // { kind, holder }

  const search = async (t) => {
    setTerm(t);
    setSelected(null);
    if (t.trim().length < 2) {
      setTickets([]);
      setAccreditations([]);
      return;
    }
    const [tk, ac] = await Promise.all([
      searchTickets(t.trim()),
      searchAccreditations(t.trim()),
    ]);
    setTickets(tk);
    setAccreditations(ac);
  };

  const total = tickets.length + accreditations.length;

  return (
    <SafeAreaView className="flex-1 bg-canvas" style={s.safe}>
      <View style={s.content}>
        <Text style={s.title}>Find a holder</Text>
        <Text style={s.sub}>
          Search downloaded tickets and accreditation cards by number, name,
          organization, section, row or seat.
        </Text>
        <TextInput
          value={term}
          onChangeText={search}
          placeholder="Ticket number, name, organization…"
          style={s.input}
        />

        {selected ? (
          <>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={s.back}>‹ Back to results</Text>
            </TouchableOpacity>
            <HolderCard holder={selected.holder} kind={selected.kind} />
          </>
        ) : (
          <FlatList
            data={[
              ...tickets.map((r) => ({ kind: 'ticket', holder: r })),
              ...accreditations.map((r) => ({ kind: 'accreditation', holder: r })),
            ]}
            keyExtractor={(x, i) => `${x.kind}-${x.holder.id}-${i}`}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={s.empty}>
                {term.length < 2
                  ? 'Enter at least 2 characters.'
                  : total === 0
                    ? 'No matching tickets or cards on this device.'
                    : ''}
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { Keyboard.dismiss(); setSelected(item); }}
                style={s.row}
              >
                <Text style={s.label}>
                  {item.kind === 'accreditation'
                    ? item.holder.full_name
                    : item.holder.ticket_number}
                </Text>
                <Text style={s.meta}>
                  {item.kind === 'accreditation'
                    ? `${item.holder.category_label || item.holder.category} · ${item.holder.organization || '—'}`
                    : `Ticket · ${item.holder.section || '?'} · Row ${item.holder.row || '?'} · Seat ${item.holder.seat || '?'}`}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, flex: 1 },
  title: { fontSize: 23, fontWeight: '900', color: colors.ink },
  sub: { color: colors.muted, marginTop: 5, marginBottom: 16 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14, marginBottom: 12,
  },
  row: {
    backgroundColor: '#fff', padding: 15, borderRadius: 12,
    marginBottom: 9, borderWidth: 1, borderColor: colors.border,
  },
  label: { fontWeight: '800', color: colors.ink, fontSize: 15 },
  meta: { color: colors.muted, marginTop: 4, fontSize: 12 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 30 },
  back: { color: colors.primary, fontWeight: '800', marginVertical: 14 },
});