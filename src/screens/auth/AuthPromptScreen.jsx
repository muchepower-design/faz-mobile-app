// src/screens/auth/AuthPromptScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

const COPY = {
  checkout: {
    title: 'Sign in to complete your order',
    body: 'Your cart is saved. Sign in or create a free account to pay for your tickets.',
  },
  shop: {
    title: 'Sign in to place your order',
    body: 'You’re one step away. Sign in or create a free account to complete your purchase.',
  },
  apply: {
    title: 'Sign in to apply',
    body: 'You need an account to submit a match accreditation application.',
  },
  'my-cards': {
    title: 'Sign in to view your cards',
    body: 'Your accreditation cards are tied to your account.',
  },
  'my-orders': {
    title: 'Sign in to view your orders',
    body: 'Your order history is tied to your FAZ account.',
  },
  scanner: {
    title: 'Sign in as staff',
    body: 'The gate scanner is reserved for FAZ staff. Sign in with your staff account.',
  },
  insufficient_role: {
    title: 'Access restricted',
    body: 'Your account doesn’t have permission for this action. Contact FAZ if you believe this is a mistake.',
  },
  generic: {
    title: 'Sign in to continue',
    body: 'Create an account or sign in to keep going.',
  },
};

export function AuthPromptScreen({ navigation, route }) {
  const reason = route.params?.reason || 'generic';
  const copy = COPY[reason] || COPY.generic;

  const close = () => navigation.goBack();
  const goLogin = () => {
    navigation.replace('Login', { afterLogin: route.params?.afterLogin });
  };
  const goRegister = () => {
    navigation.replace('Register', { afterLogin: route.params?.afterLogin });
  };

  const isRoleOnly = reason === 'insufficient_role';

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.iconWrap}>
          <Text style={s.icon}>🔒</Text>
        </View>
        <Text style={s.title}>{copy.title}</Text>
        <Text style={s.body}>{copy.body}</Text>

        {!isRoleOnly && (
          <>
            <TouchableOpacity onPress={goLogin} style={[s.button, s.primary]}>
              <Text style={s.primaryText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goRegister} style={[s.button, s.secondary]}>
              <Text style={s.secondaryText}>Create a free account</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={close} style={s.ghost}>
          <Text style={s.ghostText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 28, justifyContent: 'center' },
  iconWrap: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 18,
  },
  icon: { fontSize: 34 },
  title: {
    fontSize: 22, fontWeight: '900', color: colors.ink,
    textAlign: 'center', marginBottom: 10,
  },
  body: {
    fontSize: 14, color: colors.muted, textAlign: 'center',
    lineHeight: 20, marginBottom: 26,
  },
  button: {
    borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 10,
  },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  secondary: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
  },
  secondaryText: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  ghost: { alignItems: 'center', paddingVertical: 12, marginTop: 6 },
  ghostText: { color: colors.muted, fontWeight: '700' },
});