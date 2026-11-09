// src/services/authService.js
import { authApi, unwrap } from '../api/client';
import {
  saveTokens, getAccessToken, getDeviceToken,
  clearTokens, clearDeviceToken,
} from './tokenStorage';
import { useAuthStore } from '../store/authStore';
import { clearAllData } from '../database/database';

/**
 * Sign in.
 *   POST /api/ticketing/auth/login   { email, password }
 *   → { access_token, user: {...} }
 */
export async function login(email, password) {
  const res = await authApi.post('/api/ticketing/auth/login', { email, password });
  const body = res.data || {};
  const access = body.access_token;
  const refresh = body.refresh_token || null;
  if (!access) throw new Error('Login failed — no token returned');

  await saveTokens(access, refresh);

  const user = body.user || {};
  const roles = [user.role, ...(user.roles || [])].filter(Boolean);
  const allowed = roles.some((r) =>
    [
      'scanner', 'admin', 'super_admin', 'faz_admin', 'media_officer',
      'match_commissioner', 'match_commisioner', 'club_admin', 'club_officer',
      'customer',
    ].includes(r),
  );
  if (!allowed) {
    await clearTokens();
    throw new Error(
      'Your account is not permitted to use this app. ' +
      'Ask FAZ to grant you an appropriate role.',
    );
  }

  useAuthStore.getState().setUser(user);
  return user;
}

export async function restoreSession() {
  const token = await getAccessToken();
  if (!token) return;

  try {
    const res = await authApi.get('/api/ticketing/auth/me');
    const user = res.data || {};
    useAuthStore.getState().setUser(user);

    const deviceToken = await getDeviceToken();
    useAuthStore.getState().setDeviceReady(!!deviceToken);
  } catch {
    await clearTokens();
    await clearDeviceToken();
  }
}

export async function logout() {
  await clearTokens();
  await clearDeviceToken();
  await clearAllData();
  useAuthStore.getState().setDeviceReady(false);
  useAuthStore.getState().setUser(null);
  useAuthStore.getState().setEvent(null);
}

// ─────────────────────────────────────────────────────────────────────
// Profile & password
// ─────────────────────────────────────────────────────────────────────

/**
 * PUT /api/ticketing/auth/me
 * Body accepts any subset of { first_name, last_name, full_name, phone, email }
 * Backend returns the updated user object.
 */
export async function updateProfile(patch) {
  const res = await authApi.put('/api/ticketing/auth/me', patch);
  const body = unwrap(res);
  const user = body.user || body;
  useAuthStore.getState().updateUser(user);
  return user;
}

/**
 * PUT /api/ticketing/auth/change-password
 * Body: { current_password, new_password }
 */
export async function changePassword(currentPassword, newPassword) {
  const res = await authApi.put('/api/ticketing/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return unwrap(res);
}

/**
 * POST /api/ticketing/auth/forgot-password
 * Body: { email }
 * We intentionally do not surface backend errors that reveal whether
 * an email exists — always display the same success message.
 */
export async function forgotPassword(email) {
  try {
    await authApi.post('/api/ticketing/auth/forgot-password', { email });
  } catch (e) {
    // Swallow — see docstring
  }
}