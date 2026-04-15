import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useBiometricStore } from '../store/biometricStore';
import { useDeviceStore } from '../store/deviceStore';
import { bleService } from '../services/bleService';
import { apiService } from '../services/apiService';
import ECGWaveform from '../components/ECGWaveform';

const RISK_META = {
  NORMAL:  { color: colors.success, label: 'Normale',     icon: '✅' },
  LOW:     { color: colors.warning, label: 'Lieve anomalia', icon: '⚠️' },
  MEDIUM:  { color: colors.warning, label: 'Attenzione',   icon: '⚠️' },
  HIGH:    { color: colors.error,   label: 'Critico',      icon: '🚨' },
};

export default function ECGScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { device, isConnected } = useDeviceStore();
  const { ecgRecords, addEcgRecord, getEcgRiskLabel } = useBiometricStore();
  const [recording, setRecording] = useState(false);

  async function startECG() {
    if (!isConnected || !device) {
      Alert.alert('Dispositivo non connesso', 'Connetti il SENSES prima di registrare un ECG.');
      return;
    }
    setRecording(true);
    try {
      const result = await bleService.readECG(device);
      addEcgRecord(result);
      // Save to backend
      await apiService.saveEcgRecord({ ...result, timestamp: new Date().toISOString() });
    } catch {
      Alert.alert('Errore ECG', 'Non riesco a leggere il dato ECG. Riprova.');
    } finally {
      setRecording(false);
    }
  }

  const latest = ecgRecords?.[ecgRecords.length - 1];
  const riskLevel = latest ? getEcgRiskLabel?.(latest.score) : null;
  const riskMeta = RISK_META[riskLevel] || RISK_META.NORMAL;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>ECG</Text>
      <Text style={styles.screenSub}>Elettrocardiogramma a singola derivazione</Text>

      {/* Live / last record panel */}
      <View style={styles.mainPanel}>
        {latest ? (
          <>
            <ECGWaveform waveform={latest.waveform} width={320} height={100} animated={false} />
            <View style={styles.scoreRow}>
              <View style={[styles.scoreBadge, { backgroundColor: riskMeta.color + '22' }]}>
                <Text style={styles.scoreEmoji}>{riskMeta.icon}</Text>
                <Text style={[styles.scoreValue, { color: riskMeta.color }]}>
                  {latest.score}/100
                </Text>
                <Text style={[styles.scoreLabel, { color: riskMeta.color }]}>
                  {riskMeta.label}
                </Text>
              </View>
              <Text style={styles.scoreTime}>
                {new Date(latest.timestamp).toLocaleString('it-IT', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                })}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.noDataBox}>
            <Text style={styles.noDataText}>Nessun ECG registrato</Text>
            <Text style={styles.noDataSub}>Premi il pulsante qui sotto per avviare la misurazione</Text>
          </View>
        )}
      </View>

      {/* Record button */}
      <TouchableOpacity
        style={[styles.recordBtn, recording && styles.recordBtnActive]}
        onPress={startECG}
        disabled={recording}
        activeOpacity={0.8}
      >
        {recording ? (
          <View style={styles.recordingRow}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.recordBtnText}>Registrazione…</Text>
          </View>
        ) : (
          <Text style={styles.recordBtnText}>▶ Registra ECG</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        ⚠️ Questo ECG è a scopo indicativo e non sostituisce una valutazione medica.
        In caso di anomalie, consulta il tuo medico.
      </Text>

      {/* History list */}
      {ecgRecords?.length > 1 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Storico ECG</Text>
          {[...ecgRecords].reverse().slice(1).map((rec, i) => {
            const rl = getEcgRiskLabel?.(rec.score);
            const rm = RISK_META[rl] || RISK_META.NORMAL;
            return (
              <View key={i} style={styles.historyItem}>
                <ECGWaveform waveform={rec.waveform} width={140} height={44} animated={false} />
                <View style={styles.historyMeta}>
                  <Text style={styles.historyDate}>
                    {new Date(rec.timestamp).toLocaleDateString('it-IT')}
                  </Text>
                  <Text style={[styles.historyScore, { color: rm.color }]}>
                    {rm.icon} {rec.score}/100
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20 },
  screenTitle: {
    fontFamily: fonts.bold, fontSize: 26, color: colors.text, marginBottom: 4,
  },
  screenSub: {
    fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 20,
  },
  mainPanel: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 140,
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreEmoji: { fontSize: 16 },
  scoreValue: { fontFamily: fonts.bold, fontSize: 16 },
  scoreLabel: { fontFamily: fonts.medium, fontSize: 12 },
  scoreTime: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  noDataBox: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  noDataText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textSecondary },
  noDataSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  recordBtn: {
    backgroundColor: colors.cyan,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordBtnActive: { backgroundColor: colors.error },
  recordingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recordBtnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  disclaimer: {
    fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted,
    textAlign: 'center', lineHeight: 16, paddingHorizontal: 8, marginBottom: 24,
  },
  historySection: { marginBottom: 20 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, marginBottom: 10 },
  historyItem: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  historyMeta: { flex: 1 },
  historyDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
  historyScore: { fontFamily: fonts.semiBold, fontSize: 14, marginTop: 4 },
});
