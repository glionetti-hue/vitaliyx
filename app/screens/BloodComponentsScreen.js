import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// ─── Componente barra con range normale ──────────────────────────────────────
function BloodMarker({ label, value, unit, min, max, normalMin, normalMax, color, description }) {
  const range = max - min;
  const pct      = Math.min(Math.max((value - min) / range, 0), 1) * 100;
  const normMinPct = ((normalMin - min) / range) * 100;
  const normMaxPct = ((normalMax - min) / range) * 100;

  const status = value < normalMin ? 'Basso' : value > normalMax ? 'Alto' : 'Normale';
  const statusColor = status === 'Normale' ? colors.success
    : status === 'Basso' ? colors.info : colors.error;

  return (
    <View style={mk.wrap}>
      <View style={mk.top}>
        <View style={{ flex: 1 }}>
          <Text style={mk.label}>{label}</Text>
          {description ? <Text style={mk.desc}>{description}</Text> : null}
        </View>
        <View style={mk.right}>
          <Text style={[mk.value, { color }]}>{value} <Text style={mk.unit}>{unit}</Text></Text>
          <View style={[mk.badge, { backgroundColor: statusColor + '22', borderColor: statusColor + '55' }]}>
            <Text style={[mk.badgeText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
      </View>
      {/* Barra */}
      <View style={mk.track}>
        {/* zona normale */}
        <View style={[mk.normalZone, { left: `${normMinPct}%`, width: `${normMaxPct - normMinPct}%` }]} />
        {/* indicatore valore */}
        <View style={[mk.indicator, { left: `${pct}%`, backgroundColor: color }]} />
      </View>
      <View style={mk.rangeRow}>
        <Text style={mk.rangeText}>{min}</Text>
        <Text style={mk.rangeText}>Normale: {normalMin}–{normalMax} {unit}</Text>
        <Text style={mk.rangeText}>{max}</Text>
      </View>
    </View>
  );
}

const mk = StyleSheet.create({
  wrap:  { marginBottom: 18 },
  top:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  label: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 2 },
  desc:  { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  right: { alignItems: 'flex-end', gap: 4 },
  value: { fontFamily: fonts.bold, fontSize: 15 },
  unit:  { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  badge: {
    borderRadius: 6, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 10 },
  track: {
    height: 8, backgroundColor: colors.border,
    borderRadius: 4, position: 'relative', overflow: 'visible',
  },
  normalZone: {
    position: 'absolute', height: '100%',
    backgroundColor: colors.success + '33', borderRadius: 4,
  },
  indicator: {
    position: 'absolute', top: -3,
    width: 14, height: 14, borderRadius: 7,
    marginLeft: -7,
    borderWidth: 2, borderColor: colors.background,
  },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  rangeText:{ fontFamily: fonts.regular, fontSize: 9, color: colors.textMuted },
});

// ─── Schermata ────────────────────────────────────────────────────────────────
export default function BloodComponentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const markers = [
    {
      label: 'Emoglobina', value: 14.2, unit: 'g/dL',
      min: 8, max: 20, normalMin: 12, normalMax: 17,
      color: '#E74C3C',
      description: 'Proteina che trasporta l\'ossigeno nei globuli rossi',
    },
    {
      label: 'Ematocrito', value: 42, unit: '%',
      min: 25, max: 60, normalMin: 36, normalMax: 50,
      color: '#E67E22',
      description: 'Percentuale di globuli rossi nel sangue',
    },
    {
      label: 'Globuli bianchi', value: 6.8, unit: 'K/μL',
      min: 2, max: 15, normalMin: 4.5, normalMax: 11,
      color: '#3498DB',
      description: 'Cellule del sistema immunitario',
    },
    {
      label: 'Piastrine', value: 220, unit: 'K/μL',
      min: 50, max: 600, normalMin: 150, normalMax: 400,
      color: '#9B59B6',
      description: 'Cellule per la coagulazione del sangue',
    },
    {
      label: 'Glucosio', value: 92, unit: 'mg/dL',
      min: 50, max: 200, normalMin: 70, normalMax: 100,
      color: '#F39C12',
      description: 'Livello di zucchero nel sangue a digiuno',
    },
    {
      label: 'Colesterolo totale', value: 185, unit: 'mg/dL',
      min: 100, max: 300, normalMin: 120, normalMax: 200,
      color: '#1ABC9C',
      description: 'Grasso presente nel sangue',
    },
    {
      label: 'Acido urico', value: 5.2, unit: 'mg/dL',
      min: 2, max: 10, normalMin: 3.5, normalMax: 7.2,
      color: '#E74C3C',
      description: 'Prodotto di scarto del metabolismo',
    },
  ];

  const normalCount = markers.filter(m => m.value >= m.normalMin && m.value <= m.normalMax).length;

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
        <Text style={styles.headerTitle}>Componenti del Sangue</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Riepilogo */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryMain}>
          <Text style={styles.summaryNum}>{normalCount}/{markers.length}</Text>
          <Text style={styles.summaryLabel}>parametri nella norma</Text>
        </View>
        <View style={styles.summaryBadges}>
          <View style={[styles.pill, { backgroundColor: colors.success + '22' }]}>
            <Text style={[styles.pillText, { color: colors.success }]}>✓ {normalCount} normali</Text>
          </View>
          {markers.length - normalCount > 0 && (
            <View style={[styles.pill, { backgroundColor: colors.warning + '22' }]}>
              <Text style={[styles.pillText, { color: colors.warning }]}>⚠ {markers.length - normalCount} da controllare</Text>
            </View>
          )}
        </View>
      </View>

      {/* Marcatori */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MARCATORI EMATICI</Text>
        <View style={styles.card}>
          {markers.map((m, i) => (
            <BloodMarker key={m.label} {...m} />
          ))}
        </View>
      </View>

      {/* Nota */}
      <View style={styles.noteCard}>
        <Text style={styles.noteIcon}>ℹ️</Text>
        <Text style={styles.noteText}>
          I valori mostrati sono rilevati dalla banda SENSES tramite spettroscopia non invasiva.
          Per diagnosi cliniche consultare sempre un medico.
        </Text>
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
  headerTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },

  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    padding: 20, marginBottom: 20, flexDirection: 'row',
    alignItems: 'center', gap: 16,
  },
  summaryMain:   { alignItems: 'center' },
  summaryNum:    { fontFamily: fonts.bold, fontSize: 36, color: colors.success },
  summaryLabel:  { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  summaryBadges: { flex: 1, gap: 8 },
  pill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontFamily: fonts.medium, fontSize: 12 },

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

  noteCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: colors.info + '11',
    borderRadius: 14, borderWidth: 1, borderColor: colors.info + '33',
    padding: 14, marginBottom: 20,
  },
  noteIcon: { fontSize: 16 },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, lineHeight: 17 },

  measureBtn: {
    backgroundColor: '#E74C3C',
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  measureBtnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
});
