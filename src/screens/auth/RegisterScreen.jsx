// src/screens/auth/RegisterScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { SERVER_BASE_URL } from '../../api/client';
import { saveTokens } from '../../services/tokenStorage';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

export function RegisterScreen({ navigation }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.email.trim() || !form.password) {
      Alert.alert('Missing details', 'Email and password are required.');
      return;
    }
    setBusy(true);
    try {
      const res = await axios.post(`${SERVER_BASE_URL}/api/ticketing/auth/register`, {
        ...form,
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        role: 'customer',
      });
      const { access_token, user } = res.data || {};
      if (!access_token || !user) throw new Error('Registration failed');
      await saveTokens(access_token, null);
      setUser(user);
    } catch (e) {
      Alert.alert('Registration failed', e.response?.data?.error || e.message);
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
        <Text style={s.title}>Create your account</Text>
        <Text style={s.sub}>
          Free to join. Same account works across FAZ Tickets, Shop, and Accreditation.
        </Text>

        <Field label="First name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
        <Field label="Last name"  value={form.last_name}  onChange={(v) => setForm({ ...form, last_name: v })} />
        <Field label="Email"      value={form.email}      onChange={(v) => setForm({ ...form, email: v })} keyboard="email-address" />
        <Field label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} keyboard="phone-pad" />

        {/* Password with visibility toggle */}
        <View style={{ marginBottom: 12 }}>
          <Text style={s.label}>PASSWORD</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
              secureTextEntry={!showPassword}
              style={[s.input, { paddingRight: 46 }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={s.eyeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton title="Create account" onPress={submit} loading={busy} />

        {navigation?.canGoBack?.() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 18 }}>
            <Text style={{ textAlign: 'center', color: colors.muted, fontWeight: '700' }}>
              ← Back
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, keyboard = 'default' }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
        style={s.input}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  sub: { color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 12, fontSize: 15, color: colors.ink,
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
});