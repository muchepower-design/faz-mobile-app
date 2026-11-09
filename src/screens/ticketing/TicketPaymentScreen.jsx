// src/screens/ticketing/TicketPaymentScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { ticketingApi } from '../../api/client';
import { colors } from '../../theme/colors';
import { MOMO } from '../../assets/images';

const PROVIDER_NAMES = {
  'AIRTEL_OAPI_ZMB': 'Airtel Money',
  'MTN_MOMO_ZMB':    'MTN Mobile Money',
  'ZAMTEL_ZMB':      'Zamtel Money',
};

export function TicketPaymentScreen({ route, navigation }) {
  const { orderId, orderNumber, amount, email } = route.params;

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [depositId, setDepositId] = useState(null);

  const pollRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const releasedRef = useRef(false);

  const isValidPhone = /^0\d{9}$/.test(phone);

  useEffect(() => {
    let cancelled = false;
    ticketingApi.get('/payment/providers')
      .then((r) => { if (!cancelled) setProviders(r.data || []); })
      .catch(() => { if (!cancelled) setProviders([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const cancelOrderAndReturn = async (msg = 'Order cancelled, seats released') => {
    if (releasedRef.current) { navigation.replace('MatchesList'); return; }
    releasedRef.current = true;
    setCancelling(true);
    try {
      await ticketingApi.post(`/orders/${orderId}/cancel`);
      Alert.alert('Cancelled', msg);
    } catch (e) {
      console.warn('Cancel failed', e.message);
    } finally {
      setCancelling(false);
      navigation.replace('MatchesList');
    }
  };

  const handlePaymentFailure = (failureMessage) => {
    setStatus('FAILED');
    setError(failureMessage || 'Payment failed');
    redirectTimerRef.current = setTimeout(
      () => cancelOrderAndReturn('Payment failed — seats released'),
      2000,
    );
  };

  const startPolling = (depId) => {
    setDepositId(depId);
    setStatus('WAITING');
    pollRef.current = setInterval(async () => {
      try {
        const res = await ticketingApi.get(`/payment/deposit/${depId}/check`);
        const data = res.data || {};
        if (data.status === 'COMPLETED') {
          clearInterval(pollRef.current);
          setStatus('COMPLETED');
          redirectTimerRef.current = setTimeout(
            () => navigation.replace('TicketOrder', { orderNumber }),
            1500,
          );
        } else if (data.success === false) {
          clearInterval(pollRef.current);
          const msg = data.failureReason?.failureMessage || 'Payment failed';
          handlePaymentFailure(msg);
        }
      } catch (e) {
        clearInterval(pollRef.current);
        handlePaymentFailure('Could not verify payment');
      }
    }, 5000);
  };

  const submit = async () => {
    if (!selectedProvider) return setError('Select a mobile money provider');
    if (!isValidPhone) return setError('Enter a valid 10-digit phone number');
    setError('');
    setProcessing(true);
    try {
      const res = await ticketingApi.post('/payment/deposit', {
        order_id: orderId,
        provider: selectedProvider,
        phone_number: '26' + phone,
        amount,
        customer_email: email,
      });
      const data = res.data || {};
      if (data.success) {
        startPolling(data.depositId);
      } else {
        handlePaymentFailure(data.failureReason?.failureMessage || 'Payment failed');
      }
    } catch (e) {
      handlePaymentFailure(e.response?.data?.error || 'Payment failed');
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      {/* Amount summary */}
      <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.muted, letterSpacing: 1 }}>ORDER</Text>
        <Text style={{ fontFamily: 'monospace', color: colors.ink, marginTop: 4 }}>{orderNumber}</Text>
        <Text style={{ fontSize: 30, fontWeight: '900', color: colors.primary, marginTop: 8 }}>
          ZMW {Number(amount).toFixed(2)}
        </Text>
      </View>

      {status === 'WAITING' && (
        <View style={{ marginTop: 16, backgroundColor: '#EAF0FF', borderRadius: 14, padding: 20, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ fontWeight: '900', color: colors.primary, marginTop: 10 }}>Waiting for approval…</Text>
          <Text style={{ color: colors.muted, marginTop: 4, textAlign: 'center' }}>
            Check your phone and enter your Mobile Money PIN to approve.
          </Text>
        </View>
      )}

      {status === 'COMPLETED' && (
        <View style={{ marginTop: 16, backgroundColor: colors.successBg, borderRadius: 14, padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 34 }}>✅</Text>
          <Text style={{ fontWeight: '900', color: colors.success, marginTop: 6 }}>Payment complete!</Text>
          <Text style={{ color: colors.muted }}>Loading your tickets…</Text>
        </View>
      )}

      {status === 'FAILED' && (
        <View style={{ marginTop: 16, backgroundColor: colors.dangerBg, borderRadius: 14, padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 34 }}>❌</Text>
          <Text style={{ fontWeight: '900', color: colors.danger, marginTop: 6 }}>Payment failed</Text>
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 4 }}>{error}</Text>
          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>Releasing your seats…</Text>
        </View>
      )}

      {!status && (
        <>
          <View style={{ marginTop: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontWeight: '900', color: colors.ink, marginBottom: 10 }}>
              Select Mobile Money Provider
            </Text>
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
                      flexBasis: '31%', flexGrow: 1,
                      padding: 12, borderRadius: 10, borderWidth: 2,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: disabled ? '#F8FAFC' : active ? colors.primaryLight : '#fff',
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
                    <Text style={{ fontWeight: '800', color: colors.ink, textAlign: 'center', fontSize: 11 }}>
                      {PROVIDER_NAMES[p.provider] || p.provider}
                    </Text>
                    {disabled && (
                      <Text style={{ fontSize: 9, color: colors.danger, marginTop: 4 }}>Unavailable</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ fontWeight: '900', color: colors.ink, marginTop: 18, marginBottom: 8 }}>
              Mobile Money Phone Number
            </Text>
            <TextInput
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              placeholder="0xxxxxxxxx"
              maxLength={10}
              style={{
                borderWidth: 1, borderColor: colors.border,
                borderRadius: 10, padding: 12, color: colors.ink, fontSize: 15,
              }}
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
              marginTop: 16, backgroundColor: colors.primary,
              borderRadius: 12, paddingVertical: 16, alignItems: 'center',
              opacity: processing || !isValidPhone || !selectedProvider ? 0.5 : 1,
            }}
          >
            {processing ? <ActivityIndicator color="#fff" /> : (
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
                Pay ZMW {Number(amount).toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => cancelOrderAndReturn('Order cancelled, seats released')}
            disabled={cancelling}
            style={{ marginTop: 14, alignItems: 'center' }}
          >
            <Text style={{ color: colors.danger, fontWeight: '800' }}>
              {cancelling ? 'Cancelling…' : 'Cancel order'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}