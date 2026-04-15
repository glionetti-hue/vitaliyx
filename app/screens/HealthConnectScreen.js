import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { healthService } from '../services/healthService';
import { useBiometricStore } from '../store/biometricStore';

const IS_IOS = Platform.OS === 'ios';

// ─── Icona Apple Health / Google Health ──────────────────────────────────────
function PlatformIcon({ size = 48 }) {
  if (IS_IOS) {
    // Cuore stilizzato Apple Health
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Circle cx="24" cy="24" r="22" fill="#FF2D55" opacity="0.15" />
        <Path
          d="M24 36 C24 36 10 27 10 18 C10 13 14 10 18 10 C21 10 24 13 24 13 C24 13 27 10 30 10 C34 10 38 13 38 18 C38 27 24 36 24 36Z"
          fill="#FF2D55"
          opacity="0.9"
        />
      </Svg>
    );
  }
  // Google Health Connect
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx="24" cy="24" r="22" fill="#4285F4" opacity="0.15" />
      <Circle cx="24" cy="24" r="10" fill="none" stroke="#4285F4" strokeWidth="3" />
      <Path d="M24 14 V10 M24 38 V34 M14 24 H10 M38 24 H34"
        stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="24" cy="24" r="4" fill="#4285F4" />
    </Svg>
  );
}

// ─── Card metrica connessa ────────────────────────────────────────────────────
function MetricChip({ icon, label }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

const METRICS = [
  { icon: '❤️',  label: 'Freq. cardiaca' },
  { icon: '💓',  label: 'HRV' },
  { icon: '🫧',  label: 'SpO₂' },
  { icon: '🦶',  label: 'Passi' },
  { icon: '😴',  label: 'Sonno' },
  { icon: '🌡️', label: 'Temperatura' },
  { icon: '🍬',  label: 'Glicemia' },
  { icon: '🩸',  label: 'Pressione' },
  { icon: '⚖️',  label: 'BMI' },
  { icon: '💪',  label: 'Massa corporea' },
];

// ─── Schermata ────────────────────────────────────────────────────────────────
export default function HealthConnectScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { updateLiveData } = useBiometricStore();

  const [connected,  setConnected]  = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [syncing,    setSyncing]    = useState(false);
  const [lastSync,   setLastSync]   = useState(null);

  const platformName = IS_IOS ? 'Apple Health' : 'Google Health Connect';
  const platformColor = IS_IOS ? '#FF2D55' : '#4285F4';

  useEffect(() => {
    healthService.isConnected().then(v => {
      setConnected(v);
      setLoading(false);
    });
  }, []);

  async function handleConnect() {
    setLoading(true);
    const result = await healthService.connect();
    setLoading(false);

    if (result.success) {
      setConnected(true);
      Alert.alert('✅ Connesso', result.message);
      syncNow();
    } else {
      Alert.alert(
        healthService.isAvailable ? 'Permesso negato' : `${platformName} non disponibile`,
        result.message
      );
    }
  }

  async function handleDisconnect() {
    Alert.alert(
      'Disconnetti',
      `Vuoi disconnettere ${platformName}? I dati già salvati non verranno eliminati.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Disconnetti',
          style: 'destructive',
          onPress: async () => {
            await healthService.disconnect();
            setConnected(false);
          },
        },
      ]
    );
  }

  async function syncNow() {
    setSyncing(true);
    const data = await healthService.fetchTodayData();
    setSyncing(false);
    if (data) {
      updateLiveData(data);
      setLastSync(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
      Alert.alert('✅ Sincronizzato', 'I dati di oggi sono stati aggiornati.');
    } else if (healthService.isAvailable) {
      Alert.alert('Nessun dato', 'Nessun dato disponibile per oggi.');
    }
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: 48 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Salute & Fitness</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero card */}
      <View style={[styles.heroCard, { borderColor: platformColor + '44' }]}>
        <PlatformIcon size={56} />
        <View style={styles.heroText}>
          <Text style={[styles.heroTitle, { color: platformColor }]}>{platformName}</Text>
          <Text style={styles.heroSub}>
            {connected
              ? 'Connesso — i dati vengono sincronizzati automaticamente'
              : 'Connetti per importare passi, sonno, FC e altri parametri'}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: connected ? colors.success : colors.textMuted }]} />
      </View>

      {/* Avviso build nativo */}
      {!healthService.isAvailable && (
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚙️</Text>
          <Text style={styles.warningText}>
            {platformName} richiede il build nativo EAS. In Expo Go è disponibile solo l'anteprima dell'interfaccia.
          </Text>
        </View>
      )}

      {/* Metriche disponibili */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PARAMETRI DISPONIBILI</Text>
        <View style={styles.chipsWrap}>
          {METRICS.map(m => <MetricChip key={m.label} {...m} />)}
        </View>
      </View>

      {/* Sincronizzazione */}
      {connected && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SINCRONIZZAZIONE</Text>
          <View style={styles.syncCard}>
            <View style={styles.syncRow}>
              <Text style={styles.syncLabel}>Ultima sincronizzazione</Text>
              <Text style={styles.syncValue}>{lastSync ?? 'Mai'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.syncBtn, syncing && { opacity: 0.6 }]}
              onPress={syncNow}
              disabled={syncing}
            >
              {syncing
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.syncBtnText}>🔄  Sincronizza ora</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Azioni */}
      {loading ? (
        <ActivityIndicator color={colors.cyan} style={{ marginTop: 32 }} />
      ) : connected ? (
        <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
          <Text style={styles.disconnectText}>Disconnetti {platformName}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.connectBtn, { backgroundColor: platformColor }]}
          onPress={handleConnect}
          activeOpacity={0.85}
        >
          <Text style={styles.connectBtnText}>
            Connetti {platformName}
          </Text>
        </TouchableOpacity>
      )}

      {/* Note privacy */}
      <Text style={styles.privacyNote}>
        Vitaliyx legge solo i dati di salute — non scrive mai sul tuo profilo {platformName}.
        I dati vengono usati solo localmente sul dispositivo.
      </Text>
    </ScrollView>
  );
}

// ─── Stili ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 18 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow:   { fontSize: 20, color: colors.text, lineHeight: 22 },
  headerTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },

  // Hero
  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.card,
    borderRadius: 20, borderWidth: 1,
    padding: 18, marginBottom: 16,
  },
  heroText:  { flex: 1 },
  heroTitle: { fontFamily: fonts.bold, fontSize: 17, marginBottom: 4 },
  heroSub:   { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  // Warning
  warningCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.warning + '18',
    borderRadius: 14, borderWidth: 1, borderColor: colors.warning + '44',
    padding: 14, marginBottom: 20,
  },
  warningIcon: { fontSize: 18 },
  warningText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.warning, lineHeight: 18 },

  // Sezione
  section:      { marginBottom: 20 },
  sectionTitle: {
    fontFamily: fonts.semiBold, fontSize: 11,
    color: colors.textMuted, letterSpacing: 1.2, marginBottom: 10,
  },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.card,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  chipIcon:  { fontSize: 14 },
  chipLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },

  // Sync
  syncCard: {
    backgroundColor: colors.card,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    padding: 14, gap: 12,
  },
  syncRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  syncLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  syncValue: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  syncBtn: {
    backgroundColor: colors.cyan, borderRadius: 12,
    paddingVertical: 11, alignItems: 'center',
  },
  syncBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },

  // Bottoni
  connectBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  connectBtnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  disconnectBtn: {
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: colors.error + '88', marginBottom: 16,
  },
  disconnectText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.error },

  // Privacy
  privacyNote: {
    fontFamily: fonts.regular, fontSize: 11,
    color: colors.textMuted, textAlign: 'center',
    lineHeight: 17, paddingHorizontal: 8,
  },
});
