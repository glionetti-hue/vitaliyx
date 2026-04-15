import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create((set) => ({
  onboardingDone: false,

  /** Legge il flag da AsyncStorage all'avvio */
  loadOnboarding: async () => {
    try {
      const v = await AsyncStorage.getItem('vitaliyx_onboarding_done');
      set({ onboardingDone: v === 'true' });
    } catch {
      set({ onboardingDone: false });
    }
  },

  /** Salva il flag e aggiorna lo store → il navigator si aggiorna automaticamente */
  completeOnboarding: async () => {
    await AsyncStorage.setItem('vitaliyx_onboarding_done', 'true');
    set({ onboardingDone: true });
  },
}));
