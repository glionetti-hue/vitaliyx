import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useBiometricStore } from '../store/biometricStore';
import { apiService } from '../services/apiService';
import BiometricChart from '../components/BiometricChart';

const METRICS = [
  { key: 'hr',    label: 'Frequenza Cardiaca', unit: 'bpm',  color: colors.cyan    },
  { key: 'hrv',   label: 'HRV',                unit: 'ms',   color: colors.success  },
  { key: 'spo2',  label: 'SpO₂',               unit: '%',    color: colors.cyanLight},
  { key: 'stress',label: 'Stress',              unit: '/100', color: colors.warning  },
  { key: 'steps', label: 'Passi',               unit: '',     color: colors.purple   },
];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [activeMetric, setActiveMetric] = useState('hr');
  const [days, setDays]                 = useState(7);
  const [chartData, setChartData]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const { history }                     = useBiometricStore();
  const hrHistory = history?.hr ?? [];

  useEffect(() => {
    loadHistory();
  }, [activeMetric, days]);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await apiService.getBiometricHistory(activeMetric, days);
      // Expecting array of { timestamp, value } from API
      setChartData(
        data.map(d => ({ x: new Date(d.timestamp).getTime(), y: d.value }))
      );
    } catch {
      // Fallback to local store history
      if (hrHistory?.length > 0) {
        setChartData(hrHistory.map((v, i) => ({
          x: Date.now() - (hrHistory.length - i) * 5 * 60 * 1000,
          y: v,
        })));
      } else {
        setChartData([]);
      }
    }
    setLoading(false);
  }

  const activeMeta = METRICS.find(m => m.key === activeMetric);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Storico</Text>

      {/* Metric picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pickerScroll}
        contentContainerStyle={styles.pickerContent}
      >
        {METRICS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.pill,
              activeMetric === m.key && { backgroundColor: m.color, borderColor: m.color },
            ]}
            onPress={() => setActiveMetric(m.key)}
          >
            <Text style={[
              styles.pillText,
              activeMetric === m.key && styles.pillTextActive,
            ]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Day range */}
      <View style={styles.dayRow}>
        {[7, 14, 30].map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.dayBtn, days === d && styles.dayBtnActive]}
            onPress={() => setDays(d)}
          >
            <Text style={[styles.dayText, days === d && styles.dayTextActive]}>
              {d} giorni
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.cyan} />
        </View>
      ) : (
        <BiometricChart
          data={chartData}
          label={activeMeta?.label}
          unit={activeMeta?.unit}
          color={activeMeta?.color}
          type="area"
          height={180}
        />
      )}

      {/* Stats summary */}
      {chartData.length > 0 && (
        <View style={styles.statsRow}>
          {(() => {
            const vals = chartData.map(d => d.y);
            const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
            const min = Math.min(...vals).toFixed(1);
            const max = Math.max(...vals).toFixed(1);
            return [
              { label: 'Media', value: avg },
              { label: 'Min',   value: min },
              { label: 'Max',   value: max },
            ].map(s => (
              <View key={s.label} style={styles.statBox}>
                <Text style={[styles.statVal, { color: activeMeta?.color }]}>
                  {s.value}{activeMeta?.unit}
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ));
          })()}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20 },
  screenTitle: { fontFamily: fonts.bold, fontSize: 26, color: colors.text, marginBottom: 16 },
  pickerScroll: { marginBottom: 14 },
  pickerContent: { gap: 8, paddingRight: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pillText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
  dayRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayBtnActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  dayText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
  dayTextActive: { color: '#fff' },
  loadingBox: { paddingVertical: 60, alignItems: 'center' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  statVal: { fontFamily: fonts.bold, fontSize: 17 },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
});
