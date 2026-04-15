import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './app/navigation/AppNavigator';
import { useAuthStore } from './app/store/authStore';
import { useAppStore } from './app/store/appStore';
import { useBiometricStore } from './app/store/biometricStore';
import { colors } from './app/theme/colors';
import VitaliyxLogo from './app/components/VitaliyxLogo';

export default function App() {
  const { loadToken }      = useAuthStore();
  const { loadOnboarding } = useAppStore();
  const { loadData }       = useBiometricStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    Promise.all([
      loadToken().catch(() => {}),
      loadOnboarding().catch(() => {}),
      loadData().catch(() => {}),
    ]).finally(() => setAppReady(true));
  }, []);

  if (!appReady) {
    return (
      <View style={styles.splash}>
        <VitaliyxLogo size={48} centered />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
