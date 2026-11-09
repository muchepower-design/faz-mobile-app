// src/screens/shop/ShopBrowseScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { shopApi, SERVER_BASE_URL } from '../../api/client';
import { colors } from '../../theme/colors';

const resolveImg = (url) => {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${SERVER_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function ShopBrowseScreen({ route, navigation }) {
  const initial = route.params || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(initial.q || '');
  const [category, setCategory] = useState(initial.category || '');
  const [premium, setPremium] = useState(initial.premium === 'true');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shopApi.get('/adverts', {
        params: { category: category || undefined, q: q || undefined, premium: premium || undefined, limit: 60 },
      });
      setItems(res.data?.items || res.data || []);
    } finally { setLoading(false); }
  }, [q, category, premium]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TextInput placeholder="Search products…" value={q} onChangeText={setQ} onSubmitEditing={load}
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.ink }} />
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Chip label="All" active={!category && !premium} onPress={() => { setCategory(''); setPremium(false); }} />
          <Chip label="⭐ Premium" active={premium} onPress={() => setPremium(!premium)} />
        </View>
      </View>

      {loading ? <Center><ActivityIndicator color={colors.primary} /></Center> : (
        <FlatList
          data={items}
          keyExtractor={(a) => String(a.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40 }}>No products found.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('AdvertDetail', { id: item.id })} style={{ width: '50%', padding: 8 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                <View style={{ aspectRatio: 4 / 3, backgroundColor: '#F1F5F9' }}>
                  {item.cover_image && <Image source={{ uri: resolveImg(item.cover_image) }} style={{ width: '100%', height: '100%' }} />}
                </View>
                <View style={{ padding: 10 }}>
                  <Text numberOfLines={2} style={{ fontWeight: '700', color: colors.ink }}>{item.title}</Text>
                  <Text style={{ color: colors.primary, fontWeight: '900', marginTop: 4 }}>
                    {item.price != null ? `${item.currency || 'ZMW'} ${Number(item.price).toFixed(2)}` : 'Contact for price'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginRight: 6,
      backgroundColor: active ? colors.primary : '#F1F5F9',
    }}>
      <Text style={{ color: active ? '#fff' : colors.ink, fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Center({ children }) { return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>{children}</View>; }