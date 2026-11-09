// src/screens/profile/ChangePasswordScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { changePassword } from '../../services/authService';
import { colors } from '../../theme/colors';

export function ChangePasswordScreen({ navigation }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!current || !next || !confirm) {
      return Alert.alert('Missing fields', 'Fill in all fields.');
    }
    if (next.length < 6) {
      return Alert.alert('Too short', 'Password must be at least 6 characters.');
    }
    if (next !== confirm) {
      return Alert.alert('Mismatch', 'New passwords do not match.');
    }
    if (next === current) {
      return Alert.alert('No change', 'New password must be different from current.');
    }
    setSaving(true);
    try {
      await changePassword(current, next);
      Alert.alert('Password updated', 'You can continue using the app.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Could not change password', e?.response?.data?.error || e.message || 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.title}>Change password</Text>
          <Text style={s.sub}>Use a strong password you don’t use elsewhere.</Text>

          <PwField
            label="Current password"
            value={current}
            onChange={setCurrent}
            visible={showCurrent}
            toggle={() => setShowCurrent((v) => !v)}
          />
          <PwField
            label="New password"
            value={next}
            onChange={setNext}
            visible={showNext}
            toggle={() => setShowNext((v) => !v)}
          />
          <PwField
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            visible={showConfirm}
            toggle={() => setShowConfirm((v) => !v)}
          />

          <TouchableOpacity
            onPress={submit}
            disabled={saving}
            style={[s.button, saving && { opacity: 0.5 }]}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Update password</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PwField({ label, value, onChange, visible, toggle }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label.toUpperCase()}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={!visible}
          style={[s.input, { paddingRight: 46 }]}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={toggle}
          style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name={visible ? 'eye-off' : 'eye'} size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '900', color: colors.ink },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 12, color: colors.ink, fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary, paddingVertical: 15,
    borderRadius: 12, alignItems: 'center', marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});