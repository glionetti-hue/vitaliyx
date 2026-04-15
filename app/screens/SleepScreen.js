import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useBiometricStore } from '../store/biometricStore';

// ─── Colori e label per ogni fase ────────────────────────────────────────────
const STAGE = {
  0: { label: 'Sveglio',   color: '#F39C12', bg: '#F39C1222' },
  1: { label: 'Leggero',   color: '#6B6BFF', bg: '#6B6BFF22' },
  2: { label: 'Profondo',  color: '#1515BB', bg: '#1515BB33' },
  3: { label: 'REM',       color: '#9B59B6', bg: '#9B59B622' },
};

// ─── Ring di qualità ─────────────────────────────────────────────────────────
function QualityRing({ score, size = 130 }) {
  const r      = (size - 18) / 2;
  const circ   = 2 * Math.PI * r;
  const filled = circ * (score / 100);
  const cx     = size / 2;

  const scoreColor =
    score >= 80 ? colors.success :
    score >= 60 ? '#6B6BFF'      :
    score >= 40 ? colors.warning  :
                  colors.error;

  const label =
    score >= 80 ? 'Ottimo' :
    score >= 60 ? 'Buono'  :
    score >= 40 ? 'Discreto' :
                  'Scarso';

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Traccia sfondo */}
        <Circle cx={cx} cy={cx} r={r} stroke={colors.border} strokeWidth={8} fill="none" />
        {/* Arco progresso */}
        <Circle
          cx={cx} cy={cx} r={r}
          stroke={scoreColor}
          strokeWidth={8}
          fill="none"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={[styles.ringScore, { color: scoreColor }]}>{score}</Text>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

// ─── Timeline bar orizzontale ─────────────────────────────────────────────────
function SleepTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;
  const total = timeline.length;

  return (
    <View style={styles.timelineWrap}>
      <View style={styles.timelineBar}>
        {timeline.map((t, i) => (
          <View
            key={i}
            style={[
              styles.timelineSegment,
              {
                flex: 1,
                backgroundColor: STAGE[t.stage]?.color ?? colors.border,
                borderTopLeftRadius:  i === 0       ? 8 : 0,
                borderBottomLeftRadius:  i === 0    ? 8 : 0,
                borderTopRightRadius: i === total-1 ? 8 : 0,
                borderBottomRightRadius: i === total-1 ? 8 : 0,
              },
            ]}
          />
        ))}
      </View>
      {/* Etichette ore */}
      <View style={styles.timelineLabels}>
        {timeline.map((t, i) => (
          <Text key={i} style={styles.timelineHour}>{t.label}</Text>
        ))}
      </View>
    </View>
  );
}

// ─── Card fase ────────────────────────────────────────────────────────────────
function PhaseCard({ stageKey, hours, pct, last }) {
  const s = STAGE[stageKey];
  return (
    <View style={[styles.phaseCard, { borderColor: s.color + '55', backgroundColor: s.bg }, last && { marginRight: 0 }]}>
      <View style={[styles.phaseDot, { backgroundColor: s.color }]} />
      <Text style={[styles.phaseHours, { color: s.color }]}>{hours}h</Text>
      <Text style={styles.phaseLabel}>{s.label}</Text>
      <Text style={styles.phasePct}>{pct}%</Text>
    </View>
  );
}

// ─── Grafico cicli — barre verticali colorate per ora ─────────────────────────
function CycleChart({ timeline, height = 80 }) {
  if (!timeline || timeline.length === 0) return null;

  // Altezza per ogni stage (più alto = più profondo)
  const stageH = { 0: 0.15, 1: 0.45, 2: 0.95, 3: 0.70 };

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${timeline.length * 28} ${height}`}>
      {timeline.map((t, i) => {
        const barH  = stageH[t.stage] * (height - 10);
        const x     = i * 28 + 4;
        const y     = height - barH - 4;
        const col   = STAGE[t.stage]?.color ?? colors.border;
        return (
          <G key={i}>
            <Rect
              x={x} y={y} width={20} height={barH}
              rx={5} fill={col} opacity={0.75}
            />
          </G>
        );
      })}
    </Svg>
  );
}

// ─── Schermata principale ─────────────────────────────────────────────────────
export default function SleepScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { sleep } = useBiometricStore();

  const { total = 0, deep = 0, light = 0, rem = 0, awake = 0,
          score = 0, bedtime = '--:--', wakeup = '--:--',
          timeline = [] } = sleep || {};

  const pct = (v) => total > 0 ? Math.round((v / total) * 100) : 0;

  // Insight dinamici
  const insights = [];
  if (deep < total * 0.18)
    insights.push({ icon: '🌑', text: 'Il sonno profondo è sotto il 18% — prova ad andare a letto prima di mezzanotte.' });
  if (rem < total * 0.20)
    insights.push({ icon: '🧠', text: 'La fase REM è ridotta — evita l\'alcol nelle ore serali.' });
  if (awake > 0.5)
    insights.push({ icon: '⚡', text: `Ti sei svegliato per ${awake}h — controlla temperatura e luce della stanza.` });
  if (total >= 7 && total <= 9 && deep >= total * 0.18 && rem >= total * 0.20)
    insights.push({ icon: '✅', text: 'Notte eccellente! Sonno profondo e REM nei range ottimali.' });
  if (insights.length === 0)
    insights.push({ icon: '💤', text: 'Punta a 7-9 ore con almeno il 20% di sonno profondo e REM.' });

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
        <View>
          <Text style={styles.headerTitle}>Analisi Sonno</Text>
          <Text style={styles.headerSub}>{bedtime} — {wakeup}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Quality + ore totali */}
      <View style={styles.topCard}>
        <QualityRing score={score} size={130} />
        <View style={styles.topRight}>
          <Text style={styles.totalLabel}>Totale</Text>
          <Text style={styles.totalHours}>{total}<Text style={styles.totalUnit}>h</Text></Text>
          <View style={styles.bedRow}>
            <Text style={styles.bedIcon}>🌙</Text>
            <Text style={styles.bedText}>{bedtime}</Text>
            <Text style={styles.bedSep}>→</Text>
            <Text style={styles.bedIcon}>☀️</Text>
            <Text style={styles.bedText}>{wakeup}</Text>
          </View>
          <Text style={styles.qualityCaption}>Qualità del sonno</Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TIMELINE NOTTURNA</Text>
        <View style={styles.sectionCard}>
          <SleepTimeline timeline={timeline} />
          {/* Legenda */}
          <View style={styles.legend}>
            {Object.entries(STAGE).map(([k, v]) => (
              <View key={k} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: v.color }]} />
                <Text style={styles.legendLabel}>{v.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Fasi — 2x2 grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FASI DEL SONNO</Text>
        <View style={styles.phaseGrid}>
          <PhaseCard stageKey={2} hours={deep}  pct={pct(deep)}  />
          <PhaseCard stageKey={3} hours={rem}   pct={pct(rem)}   last />
        </View>
        <View style={[styles.phaseGrid, { marginTop: 10 }]}>
          <PhaseCard stageKey={1} hours={light} pct={pct(light)} />
          <PhaseCard stageKey={0} hours={awake} pct={pct(awake)} last />
        </View>
      </View>

      {/* Grafico cicli */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CICLI PER ORA</Text>
        <View style={[styles.sectionCard, { paddingVertical: 16, paddingHorizontal: 12 }]}>
          <CycleChart timeline={timeline} height={90} />
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONSIGLI</Text>
        {insights.map((ins, i) => (
          <View key={i} style={styles.insightRow}>
            <Text style={styles.insightIcon}>{ins.icon}</Text>
            <Text style={styles.insightText}>{ins.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Stili ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 18 },

  // Header
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
  headerTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, textAlign: 'center' },
  headerSub:   { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center' },

  // Top card
  topCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    padding: 20, marginBottom: 20, gap: 20,
  },
  topRight:    { flex: 1 },
  totalLabel:  { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  totalHours:  { fontFamily: fonts.bold, fontSize: 44, color: colors.text, lineHeight: 50 },
  totalUnit:   { fontSize: 20, color: colors.textMuted },
  bedRow:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  bedIcon:     { fontSize: 14 },
  bedText:     { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  bedSep:      { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  qualityCaption: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 8 },

  // Ring
  ringScore: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 30 },
  ringLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },

  // Sezione
  section:     { marginBottom: 20 },
  sectionTitle: {
    fontFamily: fonts.semiBold, fontSize: 11,
    color: colors.textMuted, letterSpacing: 1.2,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 18, borderWidth: 1, borderColor: colors.border,
    padding: 14,
  },

  // Timeline
  timelineWrap:   { gap: 6 },
  timelineBar:    { flexDirection: 'row', height: 28, borderRadius: 8, overflow: 'hidden' },
  timelineSegment: { height: 28 },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  timelineHour:   { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },

  // Legenda
  legend: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, marginTop: 12,
  },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary },

  // Phase cards
  phaseGrid: { flexDirection: 'row', gap: 10 },
  phaseCard: {
    flex: 1, borderRadius: 16, borderWidth: 1,
    padding: 14, alignItems: 'flex-start', gap: 3,
  },
  phaseDot:   { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  phaseHours: { fontFamily: fonts.bold, fontSize: 22 },
  phaseLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  phasePct:   { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },

  // Insights
  insightRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    padding: 14, marginBottom: 8,
  },
  insightIcon: { fontSize: 20, lineHeight: 24 },
  insightText: {
    flex: 1, fontFamily: fonts.regular, fontSize: 13,
    color: colors.textSecondary, lineHeight: 20,
  },
});
