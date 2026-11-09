// src/screens/shop/AdvertDetailScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking,
} from 'react-native';
import { shopApi, SERVER_BASE_URL } from '../../api/client';
import { colors } from '../../theme/colors';
import { useRequireAuth } from '../../hooks/useRequireAuth';

const resolveImg = (url) => {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${SERVER_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function AdvertDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const guard = useRequireAuth();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shopApi.get(`/adverts/${id}`)
      .then((r) => setAd(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  if (!ad) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <Text style={{ color: colors.muted }}>Product not found.</Text>
      </View>
    );
  }

  const cover = ad.cover_image || ad.media?.[0]?.url;
  const vendor = ad.vendor;

  const buyNow = () => {
    // 🔒 Gate: guests get AuthPrompt
    guard(
      () => navigation.navigate('ShopCheckout', { advertId: ad.id }),
      { reason: 'shop', roles: ['customer', 'super_admin', 'faz_admin'] },
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ aspectRatio: 1, backgroundColor: '#F1F5F9' }}>
        {cover ? (
          <Image source={{ uri: resolveImg(cover) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 64 }}>🛍️</Text>
          </View>
        )}
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.ink }}>{ad.title}</Text>
        {ad.location_name && (
          <Text style={{ color: colors.muted, marginTop: 4 }}>📍 {ad.location_name}</Text>
        )}
        {ad.price != null ? (
          <Text style={{ fontSize: 24, fontWeight: '900', color: colors.primary, marginTop: 10 }}>
            {ad.currency || 'ZMW'} {Number(ad.price).toFixed(2)}
          </Text>
        ) : (
          <Text style={{ color: colors.muted, fontStyle: 'italic', marginTop: 10 }}>
            Contact vendor for price
          </Text>
        )}
        {ad.description && (
          <Text style={{ color: colors.ink, marginTop: 14, lineHeight: 20 }}>{ad.description}</Text>
        )}

        {ad.price != null && (
          <TouchableOpacity
            onPress={buyNow}
            style={{
              backgroundColor: colors.primary, borderRadius: 12,
              paddingVertical: 15, alignItems: 'center', marginTop: 20,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '900' }}>Buy Now</Text>
          </TouchableOpacity>
        )}

        {vendor && (
          <View
            style={{
              backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 16,
              borderWidth: 1, borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '900', color: colors.muted, letterSpacing: 1 }}>
              SOLD BY
            </Text>
            <Text style={{ fontWeight: '800', color: colors.ink, fontSize: 16, marginTop: 4 }}>
              {vendor.business_name}
            </Text>
            {vendor.contact_phone && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${vendor.contact_phone}`)}
                style={{ marginTop: 6 }}
              >
                <Text style={{ color: colors.primary }}>📞 {vendor.contact_phone}</Text>
              </TouchableOpacity>
            )}
            {vendor.contact_whatsapp && (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`https://wa.me/${vendor.contact_whatsapp.replace(/\D/g, '')}`)
                }
                style={{ marginTop: 4 }}
              >
                <Text style={{ color: colors.success }}>💬 WhatsApp</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}