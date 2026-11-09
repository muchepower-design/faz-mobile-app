// src/screens/ticketing/MatchDetailScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ticketingApi } from '../../api/client';
import { colors } from '../../theme/colors';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export function MatchDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const guard = useRequireAuth();

  const [match, setMatch] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [activeTT, setActiveTT] = useState(null);
  const [selections, setSelections] = useState([]); // {key, ttId, section, row, seat, holdToken}
  const [quantities, setQuantities] = useState({}); // {[ttId]: {qty, holdToken}}
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        ticketingApi.get(`/matches/${id}`).catch(() => null),
        ticketingApi.get(`/matches/${id}/seat-map`).catch(() => null),
      ]);
      setMatch(mRes?.data || null);
      setSeatMap(sRes?.data || null);
      const first = (sRes?.data?.ticket_types || []).find((t) => t.sections?.length);
      if (first) setActiveTT(first.id);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggleSeat = async (ttId, section, row, seat) => {
    const key = `${section}|${row}|${seat}`;
    const existing = selections.find((s) => s.key === key);
    if (existing) {
      if (existing.holdToken) {
        ticketingApi.delete(`/matches/${id}/hold/${existing.holdToken}`).catch(() => {});
      }
      setSelections((prev) => prev.filter((s) => s.key !== key));
      return;
    }
    setBusy(true);
    try {
      const res = await ticketingApi.post(`/matches/${id}/hold`, {
        ticket_type_id: ttId, quantity: 1, section, row, seat,
      });
      setSelections((prev) => [...prev, { key, ttId, section, row, seat, holdToken: res.data?.hold_token }]);
    } catch (e) {
      Alert.alert('Seat unavailable', e.response?.data?.error || 'Try another seat');
    } finally {
      setBusy(false);
    }
  };

  const setQty = async (tt, qty) => {
    setBusy(true);
    try {
      const res = await ticketingApi.post(`/matches/${id}/hold`, {
        ticket_type_id: tt.id, quantity: qty,
        hold_token: quantities[tt.id]?.holdToken,
      });
      setQuantities((prev) => ({ ...prev, [tt.id]: { qty, holdToken: res.data?.hold_token } }));
    } catch (e) {
      Alert.alert('Not available', e.response?.data?.error || 'Try fewer');
    } finally {
      setBusy(false);
    }
  };

  const buildItems = () => {
    const items = [];
    if (!match) return items;
    if (selections.length) {
      selections.forEach((s) => {
        const tt = seatMap?.ticket_types?.find((t) => t.id === s.ttId);
        items.push({
          ticket_type_id: s.ttId,
          ticket_type_name: tt?.name,
          price: tt?.price,
          quantity: 1,
          section: s.section, row: s.row, seat: s.seat,
          holdToken: s.holdToken,
          match_id: match.id,
          match_name: `${match.home_team} vs ${match.away_team}`,
        });
      });
    } else {
      match.ticket_types.forEach((tt) => {
        const q = quantities[tt.id]?.qty || 0;
        if (q > 0) {
          items.push({
            ticket_type_id: tt.id,
            ticket_type_name: tt.name,
            price: tt.price,
            quantity: q,
            holdToken: quantities[tt.id]?.holdToken,
            match_id: match.id,
            match_name: `${match.home_team} vs ${match.away_team}`,
          });
        }
      });
    }
    return items;
  };

  const proceedToCheckout = () => {
    const items = buildItems();
    if (!items.length) return Alert.alert('Select at least one ticket');
    // 🔒 Gate: guests get AuthPrompt, logged-in customers go straight through
    guard(
      () => navigation.navigate('MyTickets', { pendingItems: items }),
      {
        reason: 'checkout',
        roles: ['customer', 'super_admin', 'faz_admin', 'club_admin', 'club_officer'],
      },
    );
  };

  if (loading || !match) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const activeTTData = seatMap?.ticket_types?.find((t) => t.id === activeTT);
  const hasSections = !!seatMap?.has_sections;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.primary, padding: 20 }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>
          {match.home_team} vs {match.away_team}
        </Text>
        <Text style={{ color: '#DDF0E2', marginTop: 6 }}>📍 {match.venue || 'TBA'}</Text>
        {match.match_date && (
          <Text style={{ color: '#DDF0E2' }}>
            📅 {new Date(match.match_date).toLocaleString()}
          </Text>
        )}
      </View>

      {/* Seat selection (when stadium map available) */}
      {hasSections && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: colors.ink }}>Choose seats</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {seatMap.ticket_types.map((tt) => (
              <TouchableOpacity
                key={tt.id}
                onPress={() => setActiveTT(tt.id)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10, marginRight: 8, borderRadius: 12,
                  backgroundColor: tt.id === activeTT ? colors.primary : '#fff',
                  borderWidth: 1, borderColor: colors.border,
                }}
              >
                <Text style={{ color: tt.id === activeTT ? '#fff' : colors.ink, fontWeight: '800' }}>
                  {tt.name}
                </Text>
                <Text style={{ color: tt.id === activeTT ? '#DDF0E2' : colors.muted, fontSize: 11 }}>
                  ZMW {tt.price}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeTTData && (
            <View style={{ marginTop: 16 }}>
              {activeTTData.sections.map((section) => (
                <View key={section.id} style={{ marginBottom: 16 }}>
                  <Text style={{ fontWeight: '700', color: colors.ink, marginBottom: 6 }}>{section.name}</Text>
                  {section.rows_detail?.slice(0, 20).map((row) => (
                    <View key={row.label} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, alignItems: 'center' }}>
                      <Text style={{ width: 24, fontSize: 11, color: colors.muted }}>{row.label}</Text>
                      {row.seats.map((s) => {
                        const key = `${section.name}|${row.label}|${s.seat}`;
                        const picked = selections.some((x) => x.key === key);
                        const taken = String(s.status).toLowerCase() !== 'available';
                        return (
                          <TouchableOpacity
                            key={s.seat}
                            disabled={(taken && !picked) || busy}
                            onPress={() => toggleSeat(activeTTData.id, section.name, row.label, s.seat)}
                            style={{
                              width: 26, height: 26, borderRadius: 13, margin: 2,
                              backgroundColor: picked ? colors.primary : taken ? '#CBD5E1' : '#fff',
                              borderWidth: 1, borderColor: picked ? colors.primary : colors.border,
                              alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 9, fontWeight: '800', color: picked ? '#fff' : colors.ink }}>
                              {s.seat}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Quantity selection (when no seat map) */}
      {!hasSections && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: colors.ink, marginBottom: 12 }}>
            Ticket Types
          </Text>
          {match.ticket_types?.map((tt) => {
            const q = quantities[tt.id]?.qty || 0;
            return (
              <View
                key={tt.id}
                style={{
                  backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
                  borderWidth: 1, borderColor: colors.border,
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <View>
                  <Text style={{ fontWeight: '800', color: colors.ink, fontSize: 15 }}>{tt.name}</Text>
                  <Text style={{ color: colors.primary, fontWeight: '800' }}>ZMW {tt.price}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    disabled={q <= 0 || busy}
                    onPress={() => setQty(tt, q - 1)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, borderWidth: 1,
                      borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>−</Text>
                  </TouchableOpacity>
                  <Text style={{ minWidth: 20, textAlign: 'center', fontWeight: '800' }}>{q}</Text>
                  <TouchableOpacity
                    disabled={busy}
                    onPress={() => setQty(tt, q + 1)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primary,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18, color: '#fff' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* CTA */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          onPress={proceedToCheckout}
          disabled={busy}
          style={{
            backgroundColor: colors.primary, borderRadius: 12,
            paddingVertical: 15, alignItems: 'center',
            opacity: busy ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
            Continue to checkout
          </Text>
        </TouchableOpacity>
        <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          You’ll sign in to complete your order.
        </Text>
      </View>
    </ScrollView>
  );
}