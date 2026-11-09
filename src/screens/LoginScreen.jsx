// src/screens/LoginScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { PrimaryButton } from '../components/PrimaryButton';
import { login } from '../services/authService';
import { colors } from '../theme/colors';
import { LOGOS } from '../assets/images';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Sign in failed', e?.response?.data?.error || e.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.wrap}
      >
        {/* FAZ logo image */}
        <Image source={LOGOS.faz} style={s.logoImg} resizeMode="contain" />

        <Text style={s.title}>FAZ</Text>
        <Text style={s.sub}>Sign in with your FAZ account.</Text>

        <Text style={s.label}>EMAIL ADDRESS</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="name@faz.zm"
          style={s.input}
        />

        <Text style={s.label}>PASSWORD</Text>
        <View style={s.passwordRow}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Enter your password"
            style={[s.input, s.passwordInput]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={s.eyeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={{ alignSelf: 'flex-end', marginTop: 6, marginBottom: 12 }}
        >
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>
            Forgot password?
          </Text>
        </TouchableOpacity>

        <PrimaryButton title="Sign in" onPress={submit} loading={busy} />
        <Text style={s.foot}>Your session is stored securely on this device.</Text>

        {navigation?.canGoBack?.() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: colors.muted, fontWeight: '700' }}>
              ← Continue browsing without an account
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, justifyContent: 'center', padding: 26 },
  logoImg: {
    width: 84, height: 84, alignSelf: 'center', marginBottom: 14,
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  sub: { color: colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 30 },
  label: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1,
    color: colors.muted, marginBottom: 8, marginTop: 14,
  },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14, fontSize: 15, color: colors.ink,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 46 },
  eyeBtn: {
    position: 'absolute', right: 12, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  foot: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 18 },
});