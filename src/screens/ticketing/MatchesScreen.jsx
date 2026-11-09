// src/screens/ticketing/MatchesScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketingApi, unwrap } from '../../api/client';
import { colors } from '../../theme/colors';

export function MatchesScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await ticketingApi.get('/matches', { params: { active_only: 'true' } });
      setMatches(res.data || []);
    } catch (e) {
      console.warn('matches', e.message);
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <Center><ActivityIndicator color={colors.primary} size="large" /></Center>;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      data={matches}
      keyExtractor={(m) => String(m.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40 }}>No upcoming matches.</Text>}
      renderItem={({ item }) => <MatchCard match={item} onPress={() => navigation.navigate('MatchDetail', { id: item.id })} />}
    />
  );
}

function MatchCard({ match, onPress }) {
  const isNational = (match.match_type || '').toLowerCase() === 'national';
  const bg = isNational ? colors.primary : colors.orange;
  const lowest = match.ticket_types?.length ? Math.min(...match.ticket_types.map((t) => t.price)) : null;
  const dt = match.match_date ? new Date(match.match_date) : null;

  return (
    <TouchableOpacity onPress={onPress} style={{
      backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
      borderWidth: 1, borderColor: colors.border, marginBottom: 12,
    }}>
      <View style={{ backgroundColor: bg, padding: 16 }}>
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
          {isNational ? 'NATIONAL TEAM' : 'CLUB MATCH'}
        </Text>
        <Text style={{ color: '#fff', fontSize: 19, fontWeight: '900', marginTop: 6 }}>
          {match.home_team_info?.country_name || match.home_team} vs {match.away_team_info?.country_name || match.away_team}
        </Text>
        <Text style={{ color: '#E9F5EC', marginTop: 4, fontSize: 12 }}>
          📍 {match.venue || 'Venue TBA'} {dt ? `· ${dt.toLocaleDateString()}` : ''}
        </Text>
      </View>
      <View style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 11, color: colors.muted }}>Starting from</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: colors.ink }}>
            {lowest != null ? `ZMW ${lowest.toFixed(2)}` : 'TBA'}
          </Text>
        </View>
        <View style={{ backgroundColor: bg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>View →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Center({ children }) { return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>{children}</View>; }