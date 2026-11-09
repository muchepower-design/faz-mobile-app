// src/screens/ticketing/MyTicketsScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { ticketingApi } from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';

/**
 * Checkout / "My Tickets" screen.
 *
 * Handles two flows:
 *   1. Called from MatchDetailScreen → arrives with `{ pendingItems }`
 *      in route.params. We copy them into the cart store ONCE on mount.
 *   2. Reached later (e.g. from a tab) → shows whatever is already in the
 *      cart store. No params involved.
 *
 * ⚠️ Important: we deliberately DO NOT call navigation.setParams() here.
 * Doing that changes route.params identity on every render and re-fires
 * the effect, causing "Maximum update depth exceeded". A one-shot ref
 * flag is enough to make the "pending items" handoff idempotent.
 */
export function MyTicketsScreen({ route, navigation }) {
  const user = useAuthStore((s) => s.user);
  const { items, setItems, removeItem, clear, totalAmount } = useCartStore();
  const [form, setForm] = useState({
    customer_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
  });
  const [busy, setBusy] = useState(false);

  // Track which pendingItems handoff we've already processed, so the effect
  // does not re-run and — crucially — we never need to call setParams.
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    const pending = route?.params?.pendingItems;
    if (Array.isArray(pending) && pending.length > 0) {
      consumedRef.current = true;
      setItems(pending);
    }
  }, [route?.params?.pendingItems, setItems]);

  const submit = async () => {
    if (!items.length) return Alert.alert('Your cart is empty');
    if (!form.customer_name || !form.customer_email) {
      return Alert.alert('Required', 'Please enter your name and email.');
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({
          ticket_type_id: i.ticket_type_id,
          quantity: i.quantity,
          section: i.section || null,
          row: i.row || null,
          seat: i.seat || null,
        })),
        hold_tokens: items.map((i) => i.holdToken).filter(Boolean),
      };
      const res = await ticketingApi.post('/orders', payload);
      clear();
      Alert.alert('Order placed', `Order number: ${res.data.order_number}`);
      //navigation.navigate('TicketOrder', { orderNumber: res.data.order_number });
      navigation.replace('TicketPayment', {
  orderId: res.data.id,
  orderNumber: res.data.order_number,
  amount: res.data.total_amount,
  email: form.customer_email,
});
    } catch (e) {
      Alert.alert('Checkout failed', e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!items.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 }}>
        <Text style={{ fontSize: 48 }}>🛒</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 12 }}>
          Cart is empty
        </Text>
        <Text style={{ color: colors.muted, marginBottom: 20, textAlign: 'center' }}>
          Add tickets from a match to continue.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('MatchesList')}
          style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>Browse Matches</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={{ fontSize: 22, fontWeight: '900', color: colors.ink, marginBottom: 12 }}>
        Checkout
      </Text>

      <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border }}>
        <Field
          label="Full name"
          value={form.customer_name}
          onChange={(v) => setForm({ ...form, customer_name: v })}
        />
        <Field
          label="Email"
          value={form.customer_email}
          onChange={(v) => setForm({ ...form, customer_email: v })}
          keyboard="email-address"
        />
        <Field
          label="Phone"
          value={form.customer_phone}
          onChange={(v) => setForm({ ...form, customer_phone: v })}
          keyboard="phone-pad"
        />
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, marginTop: 12 }}>
        <Text style={{ fontWeight: '800', color: colors.ink, marginBottom: 8 }}>Order Summary</Text>
        {items.map((i, idx) => (
          <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: colors.ink }}>{i.ticket_type_name}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>
                {i.match_name}{i.seat ? ` · ${i.section} · Row ${i.row} · Seat ${i.seat}` : ''} × {i.quantity}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontWeight: '800', color: colors.primary }}>
                ZMW {(i.price * i.quantity).toFixed(2)}
              </Text>
              <TouchableOpacity onPress={() => removeItem(i.cart_key)}>
                <Text style={{ color: colors.danger, fontSize: 11 }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '800' }}>Total</Text>
          <Text style={{ fontWeight: '900', color: colors.primary }}>
            ZMW {totalAmount().toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={submit}
        disabled={busy}
        style={{ marginTop: 16, backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center' }}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900' }}>Place Order</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, value, onChange, keyboard = 'default' }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.muted, marginBottom: 4 }}>
        {label.toUpperCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.ink }}
      />
    </View>
  );
}