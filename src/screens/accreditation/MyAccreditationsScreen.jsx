// src/screens/accreditation/MyAccreditationsScreen.jsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { accreditationApi, SERVER_BASE_URL } from '../../api/client';
import { colors } from '../../theme/colors';

const resolveImg = (url) => {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${SERVER_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function MyAccreditationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    accreditationApi
      .get('/accreditation/my')
      .then((r) => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const withdraw = (id) => {
    Alert.alert('Withdraw application?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          try {
            await accreditationApi.delete(`/accreditation/my/${id}`);
            load();
          } catch (e) {
            Alert.alert('Failed', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 12 }}
      data={items}
      keyExtractor={(a) => String(a.id)}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40 }}>
          No cards yet — tap Apply to start.
        </Text>
      }
      renderItem={({ item }) => {
        const statusColors = {
          pending: colors.warningBg, approved: colors.successBg,
          rejected: colors.dangerBg, cancelled: '#F1F5F9',
        };
        const statusText = {
          pending: colors.warning, approved: colors.success,
          rejected: colors.danger, cancelled: colors.muted,
        };
        const canEdit = ['pending', 'rejected'].includes(item.status);

        return (
          <View
            style={{
              backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
              marginBottom: 12, borderWidth: 1, borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', padding: 12 }}>
              {item.passport_photo_url ? (
                <Image
                  source={{ uri: resolveImg(item.passport_photo_url) }}
                  style={{ width: 64, height: 64, borderRadius: 10 }}
                />
              ) : (
                <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: '#F1F5F9' }} />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{
                      fontSize: 10, fontWeight: '900',
                      color: statusText[item.status],
                      backgroundColor: statusColors[item.status],
                      paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
                    }}
                  >
                    {String(item.status).toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontWeight: '800', color: colors.ink, marginTop: 4 }}>
                  {item.full_name}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {item.category_label}
                  {item.service_provider_type_label ? ` · ${item.service_provider_type_label}` : ''}
                </Text>
                {item.match && (
                  <Text style={{ color: colors.ink, fontSize: 12, marginTop: 2 }}>
                    {item.match.home_team} vs {item.match.away_team}
                  </Text>
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border }}>
              {item.status === 'approved' && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('CardView', { id: item.id })}
                  style={{ flex: 1, padding: 12, alignItems: 'center', backgroundColor: colors.primary }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>View QR Card</Text>
                </TouchableOpacity>
              )}
              {canEdit && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Apply', { editId: item.id })}
                  style={{ flex: 1, padding: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '800' }}>Edit</Text>
                </TouchableOpacity>
              )}
              {canEdit && (
                <TouchableOpacity
                  onPress={() => withdraw(item.id)}
                  style={{ flex: 1, padding: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: colors.danger, fontWeight: '800' }}>Withdraw</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}