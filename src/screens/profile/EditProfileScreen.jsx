// src/screens/profile/EditProfileScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { updateProfile } from '../../services/authService';
import { colors } from '../../theme/colors';

export function EditProfileScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name || '',
    full_name:  user?.full_name || '',
    email:      user?.email || '',
    phone:      user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.first_name.trim() && !form.full_name.trim()) {
      return Alert.alert('Missing details', 'Please fill in your name.');
    }
    setSaving(true);
    try {
      await updateProfile({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        full_name:  form.full_name.trim() || `${form.first_name} ${form.last_name}`.trim(),
        email:      form.email.trim(),
        phone:      form.phone.trim(),
      });
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e?.response?.data?.error || e.message || 'Try again.');
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
          <Text style={s.title}>Edit profile</Text>
          <Text style={s.sub}>Update your personal details.</Text>

          <Field
            label="First name"
            value={form.first_name}
            onChange={(v) => setForm({ ...form, first_name: v })}
          />
          <Field
            label="Last name"
            value={form.last_name}
            onChange={(v) => setForm({ ...form, last_name: v })}
          />
          <Field
            label="Full name (as it appears on records)"
            value={form.full_name}
            onChange={(v) => setForm({ ...form, full_name: v })}
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            keyboard="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Phone"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            keyboard="phone-pad"
          />

          <TouchableOpacity
            onPress={submit}
            disabled={saving}
            style={[s.button, saving && { opacity: 0.5 }]}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.buttonText}>Save changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, keyboard = 'default', autoCapitalize = 'sentences' }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        autoCapitalize={autoCapitalize}
        style={s.input}
      />
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