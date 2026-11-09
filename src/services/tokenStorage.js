import * as Keychain from 'react-native-keychain';
const SERVICE = 'event-verify-session';
const DEVICE_SERVICE = 'event-verify-device';
export async function saveTokens(access, refresh) { await Keychain.setGenericPassword('session', JSON.stringify({ access, refresh }), { service: SERVICE }); }
export async function getAccessToken() { const c = await Keychain.getGenericPassword({ service: SERVICE }); if (!c)
    return null; try {
    return JSON.parse(c.password).access || null;
}
catch {
    return null;
} }
export async function getRefreshToken() { const c = await Keychain.getGenericPassword({ service: SERVICE }); if (!c)
    return null; try {
    return JSON.parse(c.password).refresh || null;
}
catch {
    return null;
} }
export async function clearTokens() { await Keychain.resetGenericPassword({ service: SERVICE }); }
export async function saveDeviceToken(token) { await Keychain.setGenericPassword('device', token, { service: DEVICE_SERVICE }); }
export async function getDeviceToken() { const c = await Keychain.getGenericPassword({ service: DEVICE_SERVICE }); return c ? c.password : null; }
export async function clearDeviceToken() { await Keychain.resetGenericPassword({ service: DEVICE_SERVICE }); }
