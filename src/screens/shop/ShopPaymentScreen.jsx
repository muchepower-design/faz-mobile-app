// src/screens/shop/ShopPaymentScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { shopApi } from '../../api/client';
import { colors } from '../../theme/colors';
import { MOMO } from '../../assets/images';

const PROVIDER_NAMES = {
  'AIRTEL_OAPI_ZMB': 'Airtel Money',
  'MTN_MOMO_ZMB':    'MTN Mobile Money',
  'ZAMTEL_ZMB':      'Zamtel Money',
};

export function ShopPaymentScreen({ route, navigation }) {
  const { orderNumber } = route.params;

  const [order, setOrder] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const pollRef = useRef(null);

  const isValidPhone = /^0\d{9}$/.test(phone);

  useEffect(() => {
    Promise.all([
      shopApi.get(`/orders/${orderNumber}`).catch(() => ({ data: null })),
      shopApi.get('/payment/providers').catch(() => ({ data: [] })),
    ]).then(([o, p]) => {
      setOrder(o.data);
      setProviders(p.data || []);
      if (o.data?.payment_status === 'paid') setStatus('COMPLETED');
    }).finally(() => setLoading(false));

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [orderNumber]);

  const startPolling = (depositId) => {
    setStatus('WAITING');
    pollRef.current = setInterval(async () => {
      try {
        const res = await shopApi.get(`/payment/deposit/${depositId}/check`);
        const data = res.data || {};
        if (data.status === 'COMPLETED') {
          clearInterval(pollRef.current);
          setStatus('COMPLETED');
          setTimeout(() => navigation.replace('ShopOrder', { orderNumber }), 1500);
        } else if (data.success === false) {
          clearInterval(pollRef.current);
          setStatus('FAILED');
          setError(data.failureReason?.failureMessage || 'Payment failed');
        }
      } catch (e) {
        clearInterval(pollRef.current);
        setStatus('FAILED');
        setError('Could not verify payment');
      }
    }, 5000);
  };

  const submit = async () => {
    if (!selectedProvider) return setError('Select a provider');
    if (!isValidPhone) return setError('Enter a valid 10-digit phone number');
    setError('');
    setProcessing(true);
    try {
      const res = await shopApi.post('/payment/initiate', {
        target: 'order',
        target_id: orderNumber,
        provider: selectedProvider,
        phone_number: '26' + phone,
        amount: String(order.total_amount),
        customer_email: order.customer_email,
      });
      const data = res.data || {};
      if (data.success) {
        startPolling(data.depositId);
      } else {
        setStatus('FAILED');
        setError(data.failureReason?.failureMessage || 'Payment failed');
      }
    } catch (e) {
      setStatus('FAILED');
      setError(e.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.muted, letterSpacing: 1 }}>ORDER</Text>
        <Text style={{ fontFamily: 'monospace', color: colors.ink, marginTop: 4 }}>{order.order_number}</Text>
        <Text style={{ fontSize: 30, fontWeight: '900', color: colors.primary, marginTop: 8 }}>
          {order.currency} {Number(order.total_amount).toFixed(2)}
        </Text>
      </View>

      {status === 'WAITING' && (
        <View style={{ marginTop: 16, backgroundColor: '#EAF0FF', borderRadius: 14, padding: 20, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ fontWeight: '900', color: colors.primary, marginTop: 10 }}>Waiting for approval…</Text>
          <Text style={{ color: colors.muted, marginTop: 4, textAlign: 'center' }}>
            Check your phone and enter your Mobile Money PIN.
          </Text>
        </View>
      )}
      {status === 'COMPLETED' && (
        <View style={{ marginTop: 16, backgroundColor: colors.successBg, borderRadius: 14, padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 34 }}>✅</Text>
          <Text style={{ fontWeight: '900', color: colors.success, marginTop: 6 }}>Payment complete!</Text>
        </View>
      )}
      {status === 'FAILED' && (
        <View style={{ marginTop: 16, backgroundColor: colors.dangerBg, borderRadius: 14, padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 34 }}>❌</Text>
          <Text style={{ fontWeight: '900', color: colors.danger, marginTop: 6 }}>Payment failed</Text>
          <Text style={{ color: colors.muted, marginTop: 4, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            onPress={() => { setStatus(null); setError(''); }}
            style={{ marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ color: colors.ink, fontWeight: '800' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!status && (
        <>
          <View style={{ marginTop: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontWeight: '900', color: colors.ink, marginBottom: 10 }}>Mobile Money Provider</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {providers.map((p) => {
                const disabled = !p.deposit_operational;
                const active = p.provider === selectedProvider;
                const logo = MOMO[p.provider];
                return (
                  <TouchableOpacity
                    key={p.provider}
                    disabled={disabled}
                    onPress={() => setSelectedProvider(p.provider)}
                    style={{
                      flexBasis: '31%', flexGrow: 1, padding: 12, borderRadius: 10, borderWidth: 2,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primaryLight : '#fff',
                      alignItems: 'center', opacity: disabled ? 0.45 : 1,
                    }}
                  >
                    {logo ? (
                      <Image
                        source={logo}
                        style={{ width: 48, height: 32, marginBottom: 6 }}
                        resizeMode="contain"
                      />
                    ) : null}
                    <Text style={{ fontWeight: '800', color: colors.ink, fontSize: 11, textAlign: 'center' }}>
                      {PROVIDER_NAMES[p.provider] || p.provider}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ fontWeight: '900', color: colors.ink, marginTop: 18, marginBottom: 8 }}>
              Phone Number
            </Text>
            <TextInput
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              placeholder="0xxxxxxxxx"
              maxLength={10}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.ink }}
            />
          </View>

          {error ? (
            <View style={{ marginTop: 12, backgroundColor: colors.dangerBg, borderRadius: 10, padding: 12 }}>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={submit}
            disabled={processing || !isValidPhone || !selectedProvider}
            style={{
              marginTop: 16, backgroundColor: colors.primary, borderRadius: 12,
              paddingVertical: 16, alignItems: 'center',
              opacity: processing || !isValidPhone || !selectedProvider ? 0.5 : 1,
            }}
          >
            {processing ? <ActivityIndicator color="#fff" /> : (
              <Text style={{ color: '#fff', fontWeight: '900' }}>
                Pay {order.currency} {Number(order.total_amount).toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}