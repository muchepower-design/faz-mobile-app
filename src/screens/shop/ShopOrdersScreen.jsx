// src/screens/shop/ShopOrdersScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { shopApi } from '../../api/client';
import { colors } from '../../theme/colors';

export function ShopOrdersScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const r = await shopApi.get('/orders'); setItems(r.data || []); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <Center><ActivityIndicator color={colors.primary} /></Center>;

  return (
    <FlatList style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 12 }}
      data={items} keyExtractor={(o) => String(o.id)}
      ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40 }}>No orders yet.</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('ShopOrder', { orderNumber: item.order_number })}
          style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '800', color: colors.ink }}>{item.advert?.title || 'Order'}</Text>
            <Text style={{ fontWeight: '800', color: colors.primary }}>{item.currency} {Number(item.total_amount).toFixed(2)}</Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
            {item.payment_status} · {item.fulfillment_status} · {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

function Center({ children }) { return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>{children}</View>; }