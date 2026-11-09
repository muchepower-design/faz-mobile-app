// src/screens/ticketing/OrderScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
  Linking, RefreshControl, Image,
} from 'react-native';
import { ticketingApi } from '../../api/client';
import { colors } from '../../theme/colors';

export function OrderScreen({ route, navigation }) {
  const { orderNumber } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await ticketingApi.get(`/orders/by-number/${orderNumber}`);
      setOrder(res.data);
    } catch (e) {
      // leave existing state in place on transient failures
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    load();
    // Light polling while the order is still pending — the user may
    // have completed payment on the payment screen and come back, or
    // a webhook from the gateway may have flipped the status.
    const t = setInterval(() => {
      setOrder((prev) => {
        if (!prev || prev.payment_status === 'paid') return prev;
        load().catch(() => {});
        return prev;
      });
    }, 8000);
    return () => clearInterval(t);
  }, [load]);

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
  const tickets = (order.items || []).flatMap((i) => i.tickets || []);

  const goToPayment = () => {
    navigation.replace('TicketPayment', {
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.total_amount,
      email: order.customer_email,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />
      }
    >
      {/* Status banner */}
      <View
        style={{
          backgroundColor: isPaid ? colors.successBg : colors.warningBg,
          borderRadius: 14, padding: 16, marginBottom: 14,
        }}
      >
        <Text style={{ fontWeight: '900', color: isPaid ? colors.success : colors.warning, fontSize: 18 }}>
          {isPaid ? '✅ Order Confirmed' : '⏳ Payment Pending'}
        </Text>
        <Text style={{ color: colors.ink, marginTop: 6 }}>Order: {order.order_number}</Text>
        <Text style={{ color: colors.muted }}>
          Total: ZMW {Number(order.total_amount || 0).toFixed(2)}
        </Text>
        {!isPaid && (
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>
            Complete payment to receive your tickets.
          </Text>
        )}
      </View>

      {/* Complete-payment CTA */}
      {!isPaid && (
        <TouchableOpacity
          onPress={goToPayment}
          style={{
            backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 12,
            alignItems: 'center', marginBottom: 14,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Complete payment</Text>
        </TouchableOpacity>
      )}

      {/* Tickets */}
      {isPaid && tickets.length === 0 && (
        <View
          style={{
            backgroundColor: '#fff', borderRadius: 12, padding: 16,
            borderWidth: 1, borderColor: colors.border, marginBottom: 10,
          }}
        >
          <Text style={{ color: colors.muted }}>
            Your tickets are being prepared. Pull down to refresh in a moment.
          </Text>
        </View>
      )}

      {tickets.map((t, idx) => (
        <View
          key={t.id || idx}
          style={{
            backgroundColor: '#fff', borderRadius: 12, padding: 14,
            marginBottom: 10, borderWidth: 1, borderColor: colors.border,
          }}
        >
          <Text style={{ fontWeight: '800', color: colors.ink }}>
            {t.ticket_type || `Ticket ${idx + 1}`}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
            No: {t.ticket_number}
          </Text>
          {t.image_url ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(t.image_url)}
              style={{ marginTop: 8 }}
            >
              <Image
                source={{ uri: t.image_url }}
                style={{ width: '100%', height: 160, borderRadius: 8, backgroundColor: '#F1F5F9' }}
                resizeMode="contain"
              />
              <Text style={{ color: colors.primary, fontWeight: '800', marginTop: 6 }}>
                Open ticket image →
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}

      {/* Order totals — brief */}
      <View
        style={{
          backgroundColor: '#fff', borderRadius: 12, padding: 14,
          marginTop: 4, borderWidth: 1, borderColor: colors.border,
        }}
      >
        <Row label="Subtotal" value={`ZMW ${Number(order.subtotal || order.total_amount || 0).toFixed(2)}`} />
        {Number(order.admin_fee) > 0 && (
          <Row label="Fee" value={`ZMW ${Number(order.admin_fee).toFixed(2)}`} muted />
        )}
        <Row label="Total" value={`ZMW ${Number(order.total_amount || 0).toFixed(2)}`} bold />
      </View>
    </ScrollView>
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