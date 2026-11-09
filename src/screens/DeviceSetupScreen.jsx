// src/screens/DeviceSetupScreen.jsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Platform, RefreshControl,
  Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios'; // <-- Added missing import

// Make sure AUTH_BASE_URL and API_BASE_URL are exported from your client.js
import { 
  authApi, 
  api, 
  unwrap, 
  loginAdmin, 
  AUTH_BASE_URL, 
  API_BASE_URL 
} from '../api/client';

import { saveDeviceToken } from '../services/tokenStorage';
import { useAuthStore } from '../store/authStore';
import { setSetting } from '../database/database';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { syncDirectory } from '../services/syncService';

export function DeviceSetupScreen() {
  const user = useAuthStore((s) => s.user);
  const setEvent = useAuthStore((s) => s.setEvent);
  const setDeviceReady = useAuthStore((s) => s.setDeviceReady);

  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  // Admin override state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);

  const isAdmin = ['admin', 'super_admin', 'faz_admin'].includes(user?.role);

  const fetchMatches = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await authApi.get('/api/matches/upcoming');
      const list = res.data || [];
      setMatches(Array.isArray(list) ? list : list.items || []);
    } catch (e) {
      Alert.alert('Could not load matches', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [])
  );

  const handleActivation = async (adminToken = null) => {
    if (!selected) return;
    setBusy(true);
    try {
      // Use axios directly if we have an admin token, otherwise use the default api client
      let res;
      if (adminToken) {
        res = await axios.post(`${API_BASE_URL}/devices/register`, {
          match_id: selected.id,
          device_name: 'FAZ Gate Scanner',
          platform: Platform.OS,
          app_version: '1.0.0',
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      } else {
        res = await api.post('/devices/register', {
          match_id: selected.id,
          device_name: 'FAZ Gate Scanner',
          platform: Platform.OS,
          app_version: '1.0.0',
        });
      }
      
      const data = unwrap(res);
      await saveDeviceToken(data.device_token);

      const home = selected.home_team_info?.country_name || selected.home_team || 'Home';
      const away = selected.away_team_info?.country_name || selected.away_team || 'Away';

      await setSetting('match_id', data.match_id);
      await setSetting('snapshot_complete', '');
      await setSetting('snapshot_after_ticket', '0');
      await setSetting('snapshot_after_accreditation', '0');
      await setSetting('match_info', JSON.stringify({
        home_team: home,
        away_team: away,
        venue: selected.venue || '',
        competition: selected.competition || '',
      }));

      setEvent({
        id: data.match_id,
        event_name: `${home} vs ${away}`,
        event_code: selected.competition || '',
        venue: selected.venue,
      });
      setDeviceReady(true);
      syncDirectory().catch(() => {});
    } catch (e) {
      Alert.alert('Activation failed', e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
      setShowAdminModal(false);
    }
  };

  const submitAdminOverride = async () => {
    if (!adminEmail.trim() || !adminPass.trim()) {
      Alert.alert('Required', 'Enter admin email and password.');
      return;
    }
    setAdminBusy(true);
    try {
      const auth = await loginAdmin(adminEmail.trim(), adminPass);
      if (!auth.access_token) throw new Error('No admin token returned');
      
      // Call activation with the admin's token
      await handleActivation(auth.access_token);
      setAdminEmail('');
      setAdminPass('');
    } catch (e) {
      Alert.alert('Admin login failed', e?.response?.data?.error || e.message);
    } finally {
      setAdminBusy(false);
    }
  };

  const renderTeam = (teamObj, fallbackName) => {
    if (teamObj?.country_name) return teamObj.country_name;
    if (teamObj?.name) return teamObj.name;
    return fallbackName || 'TBD';
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" style={s.safe}>
      <View style={s.content}>
        <Text style={s.title}>Select match</Text>
        <Text style={s.sub}>
          Choose the match this scanner will verify.
        </Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(x) => String(x.id)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchMatches(true)} />
            }
            ListEmptyComponent={
              <Text style={s.empty}>
                No upcoming matches found. Pull down to refresh.
              </Text>
            }
            renderItem={({ item }) => {
              const home = renderTeam(item.home_team_info, item.home_team);
              const away = renderTeam(item.away_team_info, item.away_team);
              
              return (
                <TouchableOpacity
                  onPress={() => setSelected(item)}
                  style={[s.item, selected?.id === item.id && s.selected]}
                >
                  <Text style={s.name}>
                    {home} vs {away}
                  </Text>
                  <Text style={s.meta}>
                    {item.competition || 'Match'}
                    {item.venue ? ` · ${item.venue}` : ''}
                    {item.match_date
                      ? ` · ${new Date(item.match_date).toLocaleDateString()}`
                      : ''}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* If admin, just one button. If not, two buttons */}
        {!isAdmin ? (
          <View style={{ marginTop: 14, gap: 8 }}>
            <PrimaryButton
              title="Activate (Admin Required)"
              onPress={() => setShowAdminModal(true)}
              disabled={!selected || loading || busy}
            />
            <Text style={{ textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: 4 }}>
              Your role ({user?.role}) cannot activate a scanner directly. An admin must enter their credentials.
            </Text>
          </View>
        ) : (
          <PrimaryButton
            title="Activate scanner for this match"
            onPress={() => handleActivation()}
            loading={busy}
            disabled={!selected || loading}
            style={{ marginTop: 14 }}
          />
        )}
      </View>

      {/* ADMIN OVERRIDE MODAL */}
      <Modal visible={showAdminModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Admin Activation</Text>
            <Text style={s.modalSub}>Enter an administrator's credentials to authorize this scanner.</Text>
            
            <TextInput
              placeholder="Admin Email"
              value={adminEmail}
              onChangeText={setAdminEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={s.modalInput}
            />
            <TextInput
              placeholder="Admin Password"
              value={adminPass}
              onChangeText={setAdminPass}
              secureTextEntry
              style={s.modalInput}
            />

            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setShowAdminModal(false)} style={s.modalCancel}>
                <Text style={{ color: colors.muted, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitAdminOverride} disabled={adminBusy} style={s.modalSubmit}>
                {adminBusy ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>Authorize</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, flex: 1 },
  title: { fontSize: 25, fontWeight: '900', color: colors.ink },
  sub: { color: colors.muted, lineHeight: 20, marginTop: 7, marginBottom: 18 },
  item: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 13, padding: 15, marginBottom: 9,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  name: { fontSize: 16, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 12, color: colors.muted, marginTop: 5 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 30, lineHeight: 21 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.ink },
  modalSub: { fontSize: 13, color: colors.muted, marginTop: 6, marginBottom: 20 },
  modalInput: { backgroundColor: '#F5F7FB', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  modalCancel: { padding: 12 },
  modalSubmit: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
});