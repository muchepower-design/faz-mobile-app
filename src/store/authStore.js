// src/store/authStore.js
import { create } from 'zustand';

const INTERNAL_ROLES = [
  'super_admin', 'faz_admin', 'club_admin', 'club_officer',
  'scanner', 'media_officer', 'match_commissioner',
];

export const useAuthStore = create((set, get) => ({
  user: null,
  event: null,
  bootstrapped: false,
  deviceReady: false,

  setDeviceReady: (deviceReady) => set({ deviceReady }),
  setUser: (user) => set({ user }),
  setEvent: (event) => set({ event }),
  setBootstrapped: (bootstrapped) => set({ bootstrapped }),

  // Merge partial updates into the current user object
  updateUser: (patch) =>
    set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user })),

  // Role helpers (unchanged)
  roles: () => {
    const u = get().user;
    if (!u) return [];
    if (Array.isArray(u.roles) && u.roles.length) return u.roles;
    return u.role ? [u.role] : [];
  },
  isInternal: () => get().roles().some((r) => INTERNAL_ROLES.includes(r)),
  hasRole: (role) => get().roles().includes(role),
  hasAnyRole: (roles) => roles.some((r) => get().roles().includes(r)),
}));

export { INTERNAL_ROLES };