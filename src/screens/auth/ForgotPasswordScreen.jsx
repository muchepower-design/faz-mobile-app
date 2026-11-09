// src/screens/auth/ForgotPasswordScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { forgotPassword } from '../../services/authService';
import { colors } from '../../theme/colors';
import { LOGOS } from '../../assets/images';

export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) return Alert.alert('Missing email', 'Enter your account email.');
    setBusy(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      Alert.alert('Could not send reset link', e.message || 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.wrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Image source={LOGOS.faz} style={s.logoImg} resizeMode="contain" />
        <Text style={s.title}>Reset your password</Text>
        <Text style={s.sub}>
          Enter the email address you use for FAZ. We’ll send you a reset link.
        </Text>

        {sent ? (
          <View style={s.successBox}>
            <Text style={s.successTitle}>Check your inbox</Text>
            <Text style={s.successBody}>
              If <Text style={{ fontWeight: '800' }}>{email}</Text> matches an FAZ account,
              you’ll receive a reset link shortly.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={{ marginTop: 18, alignItems: 'center' }}
            >
              <Text style={{ color: colors.primary, fontWeight: '900' }}>
                ← Back to sign in
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={s.label}>EMAIL ADDRESS</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@faz.zm"
              style={s.input}
            />
            <PrimaryButton title="Send reset link" onPress={submit} loading={busy} />

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: 18, alignItems: 'center' }}
            >
              <Text style={{ color: colors.muted, fontWeight: '700' }}>
                ← Back to sign in
              </Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, justifyContent: 'center', padding: 26 },
  logoImg: { width: 84, height: 84, alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  sub: {
    color: colors.muted, textAlign: 'center',
    marginTop: 8, marginBottom: 24, lineHeight: 20,
  },
  label: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1,
    color: colors.muted, marginBottom: 8, marginTop: 8,
  },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14, fontSize: 15, color: colors.ink, marginBottom: 18,
  },
  successBox: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: colors.border,
  },
  successTitle: { fontSize: 16, fontWeight: '900', color: colors.success },
  successBody: { color: colors.ink, marginTop: 6, lineHeight: 20 },
});