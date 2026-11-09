// src/screens/shop/CheckoutScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { shopApi } from '../../api/client';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

export function CheckoutScreen({ route, navigation }) {
  const { advertId } = route.params;
  const user = useAuthStore((s) => s.user);
  const [ad, setAd] = useState(null);
  const [settings, setSettings] = useState({ platform_fee_percent: 0, default_currency: 'ZMW' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    quantity: 1,
    customer_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    delivery_address: '',
    delivery_notes: '',
    payment_method: 'system',
  });

  useEffect(() => {
    Promise.all([shopApi.get(`/adverts/${advertId}`), shopApi.get('/settings/public').catch(() => ({ data: {} }))])
      .then(([a, s]) => {
        setAd(a.data);
        setSettings(s.data || {});
        const pm = a.data.payment_method;
        setForm((f) => ({ ...f, payment_method: pm === 'offline' ? 'offline' : 'system' }));
      })
      .finally(() => setLoading(false));
  }, [advertId]);

  if (loading || !ad) return <Center><ActivityIndicator color={colors.primary} /></Center>;

  const qty = Math.max(1, parseInt(form.quantity) || 1);
  const subtotal = Number(ad.price || 0) * qty;
  const fee = form.payment_method === 'system' ? subtotal * (Number(settings.platform_fee_percent || 0) / 100) : 0;
  const total = subtotal + fee;
  const canSystem = ad.payment_method === 'system' || ad.payment_method === 'both';
  const canOffline = ad.payment_method === 'offline' || ad.payment_method === 'both';

  const submit = async () => {
    if (!form.customer_name || !form.customer_email || !form.customer_phone || !form.delivery_address)
      return Alert.alert('Please fill all required fields');
    setSubmitting(true);
    try {
      const res = await shopApi.post('/checkout', {
        advert_id: ad.id, quantity: qty, ...form,
      });
      const order = res.data;
if (form.payment_method === 'system') {
  navigation.replace('ShopPayment', { orderNumber: order.order_number });
} else {
  navigation.replace('ShopOrder', { orderNumber: order.order_number });
}
    } catch (e) { Alert.alert('Checkout failed', e.response?.data?.error || e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Card>
        <Text style={{ fontWeight: '800', color: colors.ink, marginBottom: 10 }}>Delivery Details</Text>
        <Field label="Full name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
        <Field label="Email" value={form.customer_email} onChange={(v) => setForm({ ...form, customer_email: v })} keyboard="email-address" />
        <Field label="Phone" value={form.customer_phone} onChange={(v) => setForm({ ...form, customer_phone: v })} keyboard="phone-pad" />
        <Field label="Delivery address" value={form.delivery_address} onChange={(v) => setForm({ ...form, delivery_address: v })} />
        <Field label="Notes (optional)" value={form.delivery_notes} onChange={(v) => setForm({ ...form, delivery_notes: v })} />
      </Card>

      <Card>
        <Text style={{ fontWeight: '800', color: colors.ink, marginBottom: 10 }}>Payment Method</Text>
        {canSystem && (
          <Radio label="Pay via FAZ platform" hint={`Small platform fee (${settings.platform_fee_percent}%)`}
            selected={form.payment_method === 'system'} onPress={() => setForm({ ...form, payment_method: 'system' })} />
        )}
        {canOffline && (
          <Radio label="Pay vendor directly" hint="Vendor will share bank/mobile money details"
            selected={form.payment_method === 'offline'} onPress={() => setForm({ ...form, payment_method: 'offline' })} />
        )}
      </Card>

      <Card>
        <Text style={{ fontWeight: '800', color: colors.ink, marginBottom: 10 }}>Summary</Text>
        <Row label="Unit price" value={`${ad.currency || 'ZMW'} ${Number(ad.price).toFixed(2)}`} />
        <Row label="Quantity" value={`×${qty}`} />
        <Row label="Subtotal" value={`${ad.currency || 'ZMW'} ${subtotal.toFixed(2)}`} />
        {fee > 0 && <Row label="Fee" value={`${ad.currency || 'ZMW'} ${fee.toFixed(2)}`} />}
        <Row label="Total" value={`${ad.currency || 'ZMW'} ${total.toFixed(2)}`} bold />
      </Card>

      <TouchableOpacity onPress={submit} disabled={submitting}
        style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 }}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900' }}>Place Order</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Card({ children }) {
  return <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>{children}</View>;
}
function Field({ label, value, onChange, keyboard = 'default' }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.muted, marginBottom: 4 }}>{label.toUpperCase()}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType={keyboard}
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.ink }} />
    </View>
  );
}
function Radio({ label, hint, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}
      style={{ borderWidth: 2, borderColor: selected ? colors.primary : colors.border, borderRadius: 12, padding: 12, marginBottom: 8 }}>
      <Text style={{ fontWeight: '800', color: colors.ink }}>{label}</Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{hint}</Text>
    </TouchableOpacity>
  );
}
function Row({ label, value, bold }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: colors.muted, fontWeight: bold ? '800' : '600' }}>{label}</Text>
      <Text style={{ color: bold ? colors.primary : colors.ink, fontWeight: bold ? '900' : '700' }}>{value}</Text>
    </View>
  );
}
function Center({ children }) { return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>{children}</View>; }