// src/screens/shop/ShopOrderScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
  Alert, RefreshControl,
} from 'react-native';
import { shopApi } from '../../api/client';
import { colors } from '../../theme/colors';

const FULFILLMENT_LABELS = {
  pending:    { text: 'Awaiting vendor',     color: colors.warning },
  processing: { text: 'Processing',          color: colors.warning },
  shipped:    { text: 'Shipped',             color: '#2563EB' },
  delivered:  { text: 'Delivered',           color: colors.success },
  completed:  { text: 'Completed',           color: colors.success },
  cancelled:  { text: 'Cancelled',           color: colors.danger },
};

export function ShopOrderScreen({ route, navigation }) {
  const { orderNumber } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const r = await shopApi.get(`/orders/${orderNumber}`);
      setOrder(r.data);
    } catch (e) {
      // keep previous state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    load();
    // Poll while payment is pending so if the vendor-side payment clears,
    // the screen updates on its own.
    const t = setInterval(() => {
      setOrder((prev) => {
        if (!prev) return prev;
        const terminal =
          prev.payment_status === 'paid' ||
          prev.fulfillment_status === 'completed' ||
          prev.fulfillment_status === 'cancelled';
        if (!terminal) load().catch(() => {});
        return prev;
      });
    }, 10000);
    return () => clearInterval(t);
  }, [load]);

  const confirmReceipt = async () => {
    setConfirming(true);
    try {
      const r = await shopApi.put(`/orders/${orderNumber}/confirm-receipt`);
      setOrder(r.data);
      Alert.alert('Confirmed', 'Thanks! Order complete.');
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.error || e.message);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!order) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <Text style={{ color: colors.muted }}>Order not found.</Text>
      </View>
    );
  }

  const isPaid = order.payment_status === 'paid';
  const isComplete = !!order.customer_confirmed_at;
  const isDelivered = ['delivered', 'completed'].includes(order.fulfillment_status);
  const isOffline = order.payment_method === 'offline';
  const isSystem = order.payment_method === 'system' || order.payment_method === 'both';
  const fulfillment = FULFILLMENT_LABELS[order.fulfillment_status] || FULFILLMENT_LABELS.pending;

  const goToPayment = () => {
    navigation.replace('ShopPayment', { orderNumber: order.order_number });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '800', letterSpacing: 1 }}>
        ORDER
      </Text>
      <Text style={{ fontSize: 20, fontWeight: '900', color: colors.ink, marginBottom: 8 }}>
        {order.order_number}
      </Text>

      {/* Status chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <StatusPill
          label={`Payment: ${order.payment_status}`}
          color={isPaid ? colors.success : colors.warning}
          bg={isPaid ? colors.successBg : colors.warningBg}
        />
        <StatusPill label={fulfillment.text} color={fulfillment.color} bg="#F1F5F9" />
        {isOffline && (
          <StatusPill label="Direct-to-vendor" color={colors.orange} bg="#FFF4DC" />
        )}
      </View>

      {/* Amount */}
      <View
        style={{
          backgroundColor: '#fff', borderRadius: 12, padding: 14,
          borderWidth: 1, borderColor: colors.border, marginBottom: 12,
        }}
      >
        <Row label="Subtotal" value={`${order.currency} ${Number(order.subtotal || 0).toFixed(2)}`} />
        {Number(order.admin_fee) > 0 && (
          <Row label="Platform fee" value={`${order.currency} ${Number(order.admin_fee).toFixed(2)}`} muted />
        )}
        <Row label="Total" value={`${order.currency} ${Number(order.total_amount || 0).toFixed(2)}`} bold />
      </View>

      {/* Complete-payment CTA */}
      {!isPaid && isSystem && (
        <TouchableOpacity
          onPress={goToPayment}
          style={{
            backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 12,
            alignItems: 'center', marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Complete payment</Text>
        </TouchableOpacity>
      )}

      {/* Offline instructions */}
      {isOffline && !isComplete && order.advert?.vendor && (
        <View style={{ backgroundColor: '#FFF4DC', borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <Text style={{ fontWeight: '900', color: colors.warning }}>Pay vendor directly</Text>
          <Text style={{ color: colors.ink, marginTop: 4 }}>{order.advert.vendor.business_name}</Text>
          {order.advert.vendor.bank_name && (
            <Text style={{ color: colors.ink }}>Bank: {order.advert.vendor.bank_name}</Text>
          )}
          {order.advert.vendor.bank_account_name && (
            <Text style={{ color: colors.ink }}>
              A/C name: {order.advert.vendor.bank_account_name}
            </Text>
          )}
          {order.advert.vendor.bank_account_number && (
            <Text style={{ color: colors.ink }}>
              A/C number: {order.advert.vendor.bank_account_number}
            </Text>
          )}
          {order.advert.vendor.mobile_money_number && (
            <Text style={{ color: colors.ink }}>
              Mobile: {order.advert.vendor.mobile_money_provider} — {order.advert.vendor.mobile_money_number}
            </Text>
          )}
          {order.advert.vendor.contact_phone && (
            <Text style={{ color: colors.ink }}>Phone: {order.advert.vendor.contact_phone}</Text>
          )}
          {order.advert.vendor.offline_instructions ? (
            <Text style={{ color: colors.ink, marginTop: 6 }}>
              {order.advert.vendor.offline_instructions}
            </Text>
          ) : null}
        </View>
      )}

      {/* Confirm receipt */}
      {isDelivered && !isComplete && (
        <TouchableOpacity
          onPress={confirmReceipt}
          disabled={confirming}
          style={{
            backgroundColor: colors.primary, borderRadius: 12,
            paddingVertical: 15, alignItems: 'center', marginBottom: 12,
          }}
        >
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '900' }}>Confirm Receipt</Text>
          )}
        </TouchableOpacity>
      )}

      {isComplete && (
        <View style={{ backgroundColor: colors.successBg, borderRadius: 12, padding: 14 }}>
          <Text style={{ color: colors.success, fontWeight: '900' }}>Order complete ✓</Text>
          <Text style={{ color: colors.success, marginTop: 4, fontSize: 12 }}>
            Thanks for shopping with FAZ.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function StatusPill({ label, color, bg }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color }}>{label}</Text>
    </View>
  );
}

function Row({ label, value, muted, bold }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: muted ? colors.muted : colors.ink, fontWeight: bold ? '900' : '600' }}>
        {label}
      </Text>
      <Text
        style={{
          color: bold ? colors.primary : muted ? colors.muted : colors.ink,
          fontWeight: bold ? '900' : '700',
        }}
      >
        {value}
      </Text>
    </View>
  );
}