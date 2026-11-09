// src/screens/shop/ShopHomeScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { shopApi, SERVER_BASE_URL } from '../../api/client';
import { colors } from '../../theme/colors';
import { useCartStore } from '../../store/cartStore';

const resolveImg = (url) => {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${SERVER_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function ShopHomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try {
      const [cat, feat, rec] = await Promise.all([
        shopApi.get('/categories').catch(() => ({ data: [] })),
        shopApi.get('/adverts', { params: { premium: true, limit: 8 } }).catch(() => ({ data: [] })),
        shopApi.get('/adverts', { params: { limit: 8 } }).catch(() => ({ data: [] })),
      ]);
      setCategories(cat.data || []);
      setFeatured(feat.data?.items || feat.data || []);
      setRecent(rec.data?.items || rec.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Center><ActivityIndicator color={colors.primary} /></Center>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Hero */}
      <View style={{ backgroundColor: colors.primary, padding: 20 }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>FAZ Shop</Text>
        <Text style={{ color: '#DDF0E2', marginTop: 4 }}>Food, gear, crafts & services from verified Zambian vendors.</Text>
        <View style={{ marginTop: 12, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}>
          <TextInput placeholder="Search products…" value={q} onChangeText={setQ}
            onSubmitEditing={() => navigation.navigate('ShopBrowse', { q })}
            style={{ flex: 1, paddingVertical: 10, color: colors.ink }} />
        </View>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <Section title="Shop by Category" action={{ label: 'Browse all', onPress: () => navigation.navigate('ShopBrowse') }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
            {categories.map((c) => (
              <TouchableOpacity key={c.id}
                onPress={() => navigation.navigate('ShopBrowse', { category: c.slug })}
                style={{ width: '33%', padding: 8 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 26 }}>{c.icon || '🛍️'}</Text>
                  <Text style={{ fontWeight: '700', color: colors.ink, marginTop: 6, textAlign: 'center', fontSize: 12 }}>{c.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Section>
      )}

      {featured.length > 0 && (
        <Section title="🔥 Featured at Matches" action={{ label: 'See all', onPress: () => navigation.navigate('ShopBrowse', { premium: 'true' }) }}>
          <Grid items={featured} onPress={(a) => navigation.navigate('AdvertDetail', { id: a.id })} />
        </Section>
      )}

      {recent.length > 0 && (
        <Section title="New Arrivals" action={{ label: 'Browse all', onPress: () => navigation.navigate('ShopBrowse') }}>
          <Grid items={recent} onPress={(a) => navigation.navigate('AdvertDetail', { id: a.id })} />
        </Section>
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Section({ title, action, children }) {
  return (
    <View style={{ marginVertical: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 }}>
        <Text style={{ fontWeight: '900', fontSize: 16, color: colors.ink }}>{title}</Text>
        {action && <TouchableOpacity onPress={action.onPress}><Text style={{ color: colors.primary, fontWeight: '700' }}>{action.label} →</Text></TouchableOpacity>}
      </View>
      {children}
    </View>
  );
}

function Grid({ items, onPress }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
      {items.map((a) => (
        <TouchableOpacity key={a.id} onPress={() => onPress(a)} style={{ width: '50%', padding: 8 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
            <View style={{ aspectRatio: 4 / 3, backgroundColor: '#F1F5F9' }}>
              {a.cover_image && <Image source={{ uri: resolveImg(a.cover_image) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
            </View>
            <View style={{ padding: 10 }}>
              <Text numberOfLines={2} style={{ fontWeight: '700', color: colors.ink, fontSize: 13 }}>{a.title}</Text>
              {a.vendor?.business_name && <Text style={{ fontSize: 11, color: colors.muted }}>{a.vendor.business_name}</Text>}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
                {a.price != null
                  ? <Text style={{ color: colors.primary, fontWeight: '900' }}>{a.currency || 'ZMW'} {Number(a.price).toFixed(2)}</Text>
                  : <Text style={{ color: colors.muted, fontSize: 11, fontStyle: 'italic' }}>Contact for price</Text>}
                {a.is_premium && <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff', backgroundColor: colors.orange, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 }}>PREMIUM</Text>}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Center({ children }) { return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>{children}</View>; }