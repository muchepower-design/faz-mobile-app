// src/screens/accreditation/AccreditationCardScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { accreditationApi, SERVER_BASE_URL } from '../../api/client';
import { colors } from '../../theme/colors';

const resolveImg = (url) => {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${SERVER_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function AccreditationCardScreen({ route }) {
  const { id } = route.params;
  const [acc, setAcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const viewShot = useRef(null);

  useEffect(() => {
    accreditationApi.get(`/accreditation/my/${id}`).then((r) => setAcc(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const shareCard = async () => {
    setSharing(true);
    try {
      const uri = await viewShot.current.capture();
      await Share.open({ url: `file://${uri}`, type: 'image/png', title: 'FAZ Accreditation' });
    } catch (e) { /* user cancelled */ }
    finally { setSharing(false); }
  };

  if (loading) return <Center><ActivityIndicator color={colors.primary} /></Center>;
  if (!acc) return <Center><Text>Card not found.</Text></Center>;

  const match = acc.match;
  const showQR = acc.status === 'approved';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <ViewShot ref={viewShot} options={{ format: 'png', quality: 1 }} style={{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }}>
        <View style={{ backgroundColor: colors.primary, padding: 18 }}>
          <Text style={{ color: '#fff', fontSize: 10, letterSpacing: 2, fontWeight: '900' }}>FOOTBALL ASSOCIATION OF ZAMBIA</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 4 }}>Match Accreditation</Text>
          <Text style={{ color: '#DDF0E2', fontSize: 11, marginTop: 4 }}>{String(acc.status).toUpperCase()}</Text>
        </View>

        <View style={{ flexDirection: 'row', padding: 16 }}>
          {acc.passport_photo_url && (
            <Image source={{ uri: resolveImg(acc.passport_photo_url) }} style={{ width: 84, height: 108, borderRadius: 8, marginRight: 12 }} />
          )}
          <View style={{ flex: 1 }}>
            <Label>Name</Label><Value>{acc.full_name}</Value>
            <Label>Category</Label>
            <Value>{acc.category_label}{acc.service_provider_type_label ? ` — ${acc.service_provider_type_label}` : ''}</Value>
            {acc.organization && <><Label>Organization</Label><Value>{acc.organization}</Value></>}
            {acc.nationality_name && <><Label>Nationality</Label><Value>{acc.nationality_name}</Value></>}
          </View>
        </View>

        {match && (
          <View style={{ backgroundColor: '#F7F8FC', padding: 16 }}>
            <Label>Match</Label>
            <Value>{match.home_team} vs {match.away_team}</Value>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
              {match.match_date ? new Date(match.match_date).toLocaleString() : ''}
              {match.venue ? ` · ${match.venue}` : ''}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Label>Access Code</Label>
            <Text style={{ fontFamily: 'monospace', fontWeight: '900', color: colors.primary, fontSize: 14 }}>{acc.qr_token}</Text>
          </View>
          {showQR && <QRCode value={acc.qr_token} size={110} />}
        </View>
      </ViewShot>

      {showQR && (
        <TouchableOpacity onPress={shareCard} disabled={sharing}
          style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 }}>
          {sharing ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900' }}>Share / Save Card</Text>}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Label({ children }) {
  return <Text style={{ fontSize: 9, letterSpacing: 1.4, color: colors.muted, fontWeight: '900', marginTop: 6 }}>{String(children).toUpperCase()}</Text>;
}
function Value({ children }) {
  return <Text style={{ color: colors.ink, fontWeight: '700', fontSize: 13 }}>{children}</Text>;
}
function Center({ children }) { return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>{children}</View>; }