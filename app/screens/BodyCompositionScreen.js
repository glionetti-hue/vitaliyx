import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const { width: SW } = Dimensions.get('window');

// ─── Torta composizione ───────────────────────────────────────────────────────
function CompositionPie({ fat, muscle, water, bone }) {
  const total = fat + muscle + water + bone;
  const CX = 90, CY = 90, R = 70;
  const segments = [
    { value: fat,    color: '#E74C3C', label: 'Grasso' },
    { value: muscle, color: '#3498DB', label: 'Muscolo' },
    { value: water,  color: '#4444FF', label: 'Acqua' },
    { value: bone,   color: '#F39C12', label: 'Osso' },
  ];

  let currentAngle = -Math.PI / 2;
  const paths = segments.map(seg => {
    const angle = (seg.value / total) * 2 * Math.PI;
    const x1 = CX + R * Math.cos(currentAngle);
    const y1 = CY + R * Math.sin(currentAngle);
    currentAngle += angle;
    const x2 = CX + R * Math.cos(currentAngle);
    const y2 = CY + R * Math.sin(currentAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { ...seg, d };
  });

  return (
    <Svg width={180} height={180}>
      {paths.map((p, i) => (
        <Path key={i} d={p.d} fill={p.color} opacity={0.85} />
      ))}
      <Circle cx={CX} cy={CY} r={40} fill={colors.card} />
      <SvgText x={CX} y={CY - 6} textAnchor="middle" fill={colors.text} fontSize="13" fontWeight="bold">BMI</SvgText>
      <SvgText x={CX} y={CY + 12} textAnchor="middle" fill={colors.cyan} fontSize="18" fontWeight="bold">22.4</SvgText>
    </Svg>
  );
}

// ─── Barra metrica ────────────────────────────────────────────────────────────
function MetricBar({ label, value, unit, min, max, optimal, color }) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1) * 100;
  const optPct = Math.min(Math.max((optimal - min) / (max - min), 0), 1) * 100;
  return (
    <View style={barStyles.row}>
      <View style={barStyles.header}>
        <Text style={barStyles.label}>{label}</Text>
        <Text style={[barStyles.value, { color }]}>{value} <Text style={barStyles.unit}>{unit}</Text></Text>
      </View>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
        <View style={[barStyles.optimal, { left: `${optPct}%` }]} />
      </View>
      <View style={barStyles.range}>
        <Text style={barStyles.rangeText}>{min}{unit}</Text>
        <Text style={barStyles.rangeText}>Ottimale: {optimal}{unit}</Text>
        <Text style={barStyles.rangeText}>{max}{unit}</Text>
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row:      { marginBottom: 16 },
  header:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label:    { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  value:    { fontFamily: fonts.bold, fontSize: 14 },
  unit:     { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  track:    { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'visible', position: 'relative' },
  fill:     { height: '100%', borderRadius: 4 },
  optimal:  { position: 'absolute', top: -3, width: 2, height: 14, backgroundColor: '#fff', borderRadius: 1 },
  range:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  rangeText:{ fontFamily: fonts.regular, fontSize: 9, color: colors.textMuted },
});

// ─── Schermata ────────────────────────────────────────────────────────────────
export default function BodyCompositionScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const data = {
    fat: 18.5, muscle: 42.3, water: 58.2, bone: 3.1,
    weight: 75.4, height: 178,
    visceralFat: 8, metabolicAge: 32, basalMetabolism: 1820,
  };

  const legend = [
    { color: '#E74C3C', label: 'Grasso',  value: `${data.fat}%` },
    { color: '#3498DB', label: 'Muscolo', value: `${data.muscle}%` },
    { color: '#4444FF', label: 'Acqua',   value: `${data.water}%` },
    { color: '#F39C12', label: 'Osso',    value: `${data.bone}%` },
  ];

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
        <Text style={styles.headerTitle}>Composizione Corporea</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Torta + dati principali */}
      <View style={styles.heroCard}>
        <CompositionPie fat={data.fat} muscle={data.muscle} water={data.water} bone={data.bone} />
        <View style={styles.legendWrap}>
          {legend.map(l => (
            <View key={l.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendLabel}>{l.label}</Text>
              <Text style={[styles.legendValue, { color: l.color }]}>{l.value}</Text>
            </View>
          ))}
          <View style={styles.legendDivider} />
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Peso</Text>
            <Text style={styles.legendValue}>{data.weight} kg</Text>
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Altezza</Text>
            <Text style={styles.legendValue}>{data.height} cm</Text>
          </View>
        </View>
      </View>

      {/* Metriche dettagliate */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ANALISI DETTAGLIATA</Text>
        <View style={styles.card}>
          <MetricBar label="Massa grassa" value={data.fat} unit="%" min={5} max={35} optimal={15} color="#E74C3C" />
          <MetricBar label="Massa muscolare" value={data.muscle} unit="%" min={25} max={55} optimal={45} color="#3498DB" />
          <MetricBar label="Acqua corporea" value={data.water} unit="%" min={45} max={75} optimal={60} color="#4444FF" />
          <MetricBar label="Grasso viscerale" value={data.visceralFat} unit="" min={1} max={20} optimal={5} color="#E67E22" />
        </View>
      </View>

      {/* Statistiche extra */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>METABOLISMO</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Metabolismo basale', value: `${data.basalMetabolism}`, unit: 'kcal/g' },
            { label: 'Età metabolica',     value: `${data.metabolicAge}`,    unit: 'anni' },
            { label: 'Grasso viscerale',   value: `${data.visceralFat}`,     unit: '/20' },
            { label: 'BMI',                value: '22.4',                    unit: 'kg/m²' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statUnit}>{s.unit}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
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

  heroCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    padding: 16, marginBottom: 20, gap: 12,
  },
  legendWrap:    { flex: 1, gap: 6 },
  legendRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:     { width: 10, height: 10, borderRadius: 5 },
  legendLabel:   { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
  legendValue:   { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  legendDivider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },

  section:      { marginBottom: 20 },
  sectionTitle: {
    fontFamily: fonts.semiBold, fontSize: 11,
    color: colors.textMuted, letterSpacing: 1.2, marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    padding: 16,
  },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    padding: 14, alignItems: 'center',
  },
  statValue: { fontFamily: fonts.bold, fontSize: 24, color: colors.cyan, marginBottom: 2 },
  statUnit:  { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, textAlign: 'center' },

  measureBtn: {
    backgroundColor: colors.cyan,
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  measureBtnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
});
