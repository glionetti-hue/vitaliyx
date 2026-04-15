import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  user:      null,
  token:     null,
  isLoading: true,

  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem('vitaliyx_user', JSON.stringify(user));
  },

  setToken: (token) => {
    set({ token });
    AsyncStorage.setItem('vitaliyx_token', token);
  },

  loadToken: async () => {
    try {
      const token = await AsyncStorage.getItem('vitaliyx_token');
      const userRaw = await AsyncStorage.getItem('vitaliyx_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      set({ token, user, isLoading: false });
      return token;
    } catch {
      set({ token: null, user: null, isLoading: false });
      return null;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('vitaliyx_token');
    await AsyncStorage.removeItem('vitaliyx_user');
    set({ user: null, token: null });
    // Pulisce anche i dati biometrici salvati
    const { useBiometricStore } = require('./biometricStore');
    useBiometricStore.getState().resetToDemo();
  },

  updateProfile: (data) => set((state) => ({
    user: { ...state.user, ...data }
  })),
}));
