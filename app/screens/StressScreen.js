import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useBiometricStore } from '../store/biometricStore';

const { width: SW } = Dimensions.get('window');

// ─── Anello stress ────────────────────────────────────────────────────────────
function StressRing({ value = 0 }) {
  const R = 80, CX = 100, CY = 100;
  const circumference = 2 * Math.PI * R;
  const pct = Math.min(value / 100, 1);
  const strokeDashoffset = circumference * (1 - pct);

  const color = value < 30 ? colors.success
    : value < 60 ? colors.warning
    : value < 80 ? colors.orange
    : colors.error;

  const label = value < 30 ? 'Rilassato'
    : value < 60 ? 'Moderato'
    : value < 80 ? 'Elevato'
    : 'Critico';

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={200} height={200}>
        <Defs>
          <LinearGradient id="stressGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle cx={CX} cy={CY} r={R}
          fill="none" stroke={colors.border} strokeWidth={14} />
        {/* Progress */}
        <Circle cx={CX} cy={CY} r={R}
          fill="none" stroke="url(#stressGrad)" strokeWidth={14}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`}
        />
        <SvgText x={CX} y={CY - 10} textAnchor="middle"
          fill={color} fontSize="36" fontWeight="bold">{value}</SvgText>
        <SvgText x={CX} y={CY + 18} textAnchor="middle"
          fill={colors.textMuted} fontSize="13">{label}</SvgText>
      </Svg>
    </View>
  );
}

// ─── Grafico storico stress ───────────────────────────────────────────────────
function StressChart({ data }) {
  const W = SW - 40, H = 120;
  const max = 100;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * (W - 40) + 20,
    y: H - 20 - ((v / max) * (H - 40)),
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const hours = ['00', '03', '06', '09', '12', '15', '18', '21', '24'];

  return (
    <View style={styles.chartWrap}>
      <Svg width={W} height={H}>
        {/* Linee griglia */}
        {[25, 50, 75].map(v => {
          const y = H - 20 - ((v / max) * (H - 40));
          return (
            <Line key={v} x1={20} y1={y} x2={W - 20} y2={y}
              stroke={colors.border} strokeWidth={0.5} strokeDasharray="4,4" />
          );
        })}
        {/* Curva */}
        <Path d={pathD} fill="none" stroke={colors.warning} strokeWidth={2} strokeLinecap="round" />
        {/* Punti */}
        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.warning} />
        ))}
        {/* Etichette ore */}
        {hours.map((h, i) => (
          <SvgText key={h}
            x={20 + (i / (hours.length - 1)) * (W - 40)}
            y={H - 2}
            textAnchor="middle" fill={colors.textMuted} fontSize="9">{h}</SvgText>
        ))}
      </Svg>
    </View>
  );
}

// ─── Schermata ────────────────────────────────────────────────────────────────
export default function StressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { liveData } = useBiometricStore();

  const stressValue = liveData?.stress ?? 42;
  const hrvValue    = liveData?.hrv    ?? 48;

  // Dati demo grafico (ultime 24h)
  const chartData = [35, 28, 22, 18, 25, 40, 55, 62, 58, 45, 42, 38,
                     44, 52, 60, 65, 58, 50, 45, 42, 38, 35, 30, stressValue];

  const tips = stressValue < 30
    ? ['Ottimo — sei ben riposato', 'Buon momento per attività creative', 'Mantieni la routine']
    : stressValue < 60
    ? ['Fai 5 minuti di respirazione profonda', 'Cammina per 10 minuti', 'Bevi un bicchiere d\'acqua']
    : stressValue < 80
    ? ['Pausa obbligatoria di 15 minuti', 'Tecnica 4-7-8: inspira 4s, tieni 7s, espira 8s', 'Riduci gli stimoli esterni']
    : ['Fermati e riposa subito', 'Chiama qualcuno di cui ti fidi', 'Evita decisioni importanti ora'];

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
        <Text style={styles.headerTitle}>Stress</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Anello principale */}
      <View style={styles.ringCard}>
        <StressRing value={stressValue} />
        <View style={styles.ringMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>HRV</Text>
            <Text style={styles.metaValue}>{hrvValue} ms</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Ultima misura</Text>
            <Text style={styles.metaValue}>Adesso</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Media oggi</Text>
            <Text style={styles.metaValue}>44</Text>
          </View>
        </View>
      </View>

      {/* Grafico 24h */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ANDAMENTO 24 ORE</Text>
        <View style={styles.card}>
          <StressChart data={chartData} />
        </View>
      </View>

      {/* Consigli */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONSIGLI PERSONALIZZATI</Text>
        {tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Fattori */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FATTORI DI STRESS</Text>
        <View style={styles.card}>
          {[
            { label: 'Qualità del sonno', value: 72, color: colors.success },
            { label: 'Attività fisica', value: 55, color: colors.warning },
            { label: 'Variabilità FC', value: hrvValue, color: colors.cyan },
            { label: 'Recupero', value: 100 - stressValue, color: colors.purple },
          ].map(item => (
            <View key={item.label} style={styles.factorRow}>
              <Text style={styles.factorLabel}>{item.label}</Text>
              <View style={styles.factorBarBg}>
                <View style={[styles.factorBarFill, { width: `${item.value}%`, backgroundColor: item.color }]} />
              </View>
              <Text style={[styles.factorValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Misurazione rapida */}
      <TouchableOpacity style={styles.measureBtn} activeOpacity={0.85}>
        <Text style={styles.measureBtnText}>⚡  Misurazione rapida</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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

  ringCard: {
    backgroundColor: colors.card,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    padding: 16, alignItems: 'center', marginBottom: 20,
  },
  ringMeta: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, width: '100%', justifyContent: 'space-around',
  },
  metaItem:    { alignItems: 'center' },
  metaLabel:   { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  metaValue:   { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  metaDivider: { width: 1, height: 32, backgroundColor: colors.border },

  section:      { marginBottom: 20 },
  sectionTitle: {
    fontFamily: fonts.semiBold, fontSize: 11,
    color: colors.textMuted, letterSpacing: 1.2, marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    padding: 14,
  },
  chartWrap: { paddingVertical: 4 },

  tipRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    padding: 12, marginBottom: 8,
  },
  tipIcon: { fontSize: 16 },
  tipText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  factorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 10,
  },
  factorLabel:  { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, width: 110 },
  factorBarBg:  { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  factorBarFill:{ height: '100%', borderRadius: 3 },
  factorValue:  { fontFamily: fonts.semiBold, fontSize: 12, width: 28, textAlign: 'right' },

  measureBtn: {
    backgroundColor: colors.warning,
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  measureBtnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
});
