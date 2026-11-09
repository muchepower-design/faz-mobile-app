// src/api/client.js
import axios from 'axios';
import Config from 'react-native-config';
import { getAccessToken, getDeviceToken } from '../services/tokenStorage';

const RAW_BASE = Config.API_BASE_URL || 'http://10.0.2.2:5000/api/gate';
export const API_BASE_URL = RAW_BASE.replace(/\/$/, '');

// Server root (no /api/gate suffix) — used by auth, ticketing, shop, accreditation
export const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/gate$/, '');
export const SERVER_BASE_URL = AUTH_BASE_URL; // alias for readability

// ── Gate scanner client (unchanged behaviour) ──────────────────────
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth client (login, register, me) ───────────────────────────────
export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Domain clients ──────────────────────────────────────────────────
// Ticketing: /api/ticketing/*  + /api/matches/* + /api/competitions-management/*
export const ticketingApi = axios.create({
  baseURL: `${SERVER_BASE_URL}/api/ticketing`,
  timeout: 20000,
});
export const matchesApi = axios.create({
  baseURL: `${SERVER_BASE_URL}/api`,
  timeout: 20000,
});

// Shop e-commerce: /api/ecommerce/*
export const shopApi = axios.create({
  baseURL: `${SERVER_BASE_URL}/api/ecommerce`,
  timeout: 20000,
});

// Accreditation: /api/accreditation/* + /api/countries/*
export const accreditationApi = axios.create({
  baseURL: `${SERVER_BASE_URL}/api`,
  timeout: 20000,
});

// ── Token injection ─────────────────────────────────────────────────
const DEVICE_ROUTES = [/^\/snapshot/, /^\/checkin\//, /^\/devices\/me/, /^\/devices\/heartbeat/];

function pickToken(url) {
  const u = String(url || '');
  for (const re of DEVICE_ROUTES) if (re.test(u)) return getDeviceToken();
  return getAccessToken();
}

async function attachToken(config) {
  const token = await pickToken(config.url);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}

api.interceptors.request.use(attachToken);
authApi.interceptors.request.use(attachToken);
ticketingApi.interceptors.request.use(attachToken);
matchesApi.interceptors.request.use(attachToken);
shopApi.interceptors.request.use(attachToken);
accreditationApi.interceptors.request.use(attachToken);

export function unwrap(response) {
  const body = response?.data;
  if (!body) throw new Error('Empty response');
  if (body.error) throw new Error(body.error);
  return body;
}

export async function loginAdmin(email, password) {
  const res = await axios.post(`${AUTH_BASE_URL}/api/ticketing/auth/login`, { email, password });
  return res.data;
}