import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// ─── Lista sport (campione) ───────────────────────────────────────────────────
const SPORTS = [
  { id: 1,  icon: '🏃', name: 'Corsa',               category: 'Cardio' },
  { id: 2,  icon: '🚴', name: 'Ciclismo',             category: 'Cardio' },
  { id: 3,  icon: '🏊', name: 'Nuoto',                category: 'Acqua' },
  { id: 4,  icon: '🏋️', name: 'Palestra',             category: 'Forza' },
  { id: 5,  icon: '🧘', name: 'Yoga',                 category: 'Flessibilità' },
  { id: 6,  icon: '⚽', name: 'Calcio',               category: 'Sport di squadra' },
  { id: 7,  icon: '🏀', name: 'Basket',               category: 'Sport di squadra' },
  { id: 8,  icon: '🎾', name: 'Tennis',               category: 'Racchette' },
  { id: 9,  icon: '🥊', name: 'Boxe',                 category: 'Combattimento' },
  { id: 10, icon: '🤸', name: 'Ginnastica',           category: 'Flessibilità' },
  { id: 11, icon: '🏄', name: 'Surf',                 category: 'Acqua' },
  { id: 12, icon: '🧗', name: 'Arrampicata',          category: 'Avventura' },
  { id: 13, icon: '🚵', name: 'MTB',                  category: 'Cardio' },
  { id: 14, icon: '🏐', name: 'Pallavolo',            category: 'Sport di squadra' },
  { id: 15, icon: '🤽', name: 'Pallanuoto',           category: 'Acqua' },
  { id: 16, icon: '🎿', name: 'Sci',                  category: 'Invernale' },
  { id: 17, icon: '⛷️', name: 'Snowboard',            category: 'Invernale' },
  { id: 18, icon: '🥋', name: 'Arti marziali',        category: 'Combattimento' },
  { id: 19, icon: '🏌️', name: 'Golf',                category: 'Precisione' },
  { id: 20, icon: '🤼', name: 'Lotta',                category: 'Combattimento' },
  { id: 21, icon: '🚣', name: 'Canoa',                category: 'Acqua' },
  { id: 22, icon: '🏇', name: 'Equitazione',          category: 'Avventura' },
  { id: 23, icon: '🎯', name: 'Tiro con l\'arco',     category: 'Precisione' },
  { id: 24, icon: '🏸', name: 'Badminton',            category: 'Racchette' },
  { id: 25, icon: '🤾', name: 'Pallamano',            category: 'Sport di squadra' },
  { id: 26, icon: '🏊', name: 'Triathlon',            category: 'Cardio' },
  { id: 27, icon: '🚶', name: 'Camminata',            category: 'Cardio' },
  { id: 28, icon: '🧊', name: 'Pattinaggio',          category: 'Invernale' },
  { id: 29, icon: '🪂', name: 'Paracadutismo',        category: 'Avventura' },
  { id: 30, icon: '🤿', name: 'Subacquea',            category: 'Acqua' },
];

// Allenamenti guidati
const GUIDED = [
  { id: 1, icon: '🔥', name: 'HIIT 20 min',    duration: '20 min', level: 'Intenso',    cal: 280 },
  { id: 2, icon: '💪', name: 'Forza totale',   duration: '45 min', level: 'Moderato',   cal: 320 },
  { id: 3, icon: '🧘', name: 'Yoga mattutino', duration: '30 min', level: 'Leggero',    cal: 120 },
  { id: 4, icon: '🏃', name: 'Corsa 5km',      duration: '30 min', level: 'Moderato',   cal: 350 },
  { id: 5, icon: '🌅', name: 'Stretching',     duration: '15 min', level: 'Leggero',    cal: 60  },
  { id: 6, icon: '⚡', name: 'Tabata',         duration: '25 min', level: 'Molto intenso', cal: 400 },
];

// ─── Card allenamento guidato ──────────────────────────────────────────────────
function GuidedCard({ item, onPress }) {
  const levelColor = item.level === 'Leggero' ? colors.success
    : item.level === 'Moderato' ? colors.warning
    : colors.error;
  return (
    <TouchableOpacity style={gc.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={gc.icon}>{item.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={gc.name}>{item.name}</Text>
        <View style={gc.meta}>
          <Text style={gc.metaText}>⏱ {item.duration}</Text>
          <Text style={gc.metaText}>🔥 {item.cal} kcal</Text>
        </View>
      </View>
      <View style={[gc.level, { backgroundColor: levelColor + '22' }]}>
        <Text style={[gc.levelText, { color: levelColor }]}>{item.level}</Text>
      </View>
    </TouchableOpacity>
  );
}

const gc = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    padding: 14, marginBottom: 10,
  },
  icon:      { fontSize: 28 },
  name:      { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text, marginBottom: 4 },
  meta:      { flexDirection: 'row', gap: 12 },
  metaText:  { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  level:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  levelText: { fontFamily: fonts.semiBold, fontSize: 10 },
});

// ─── Schermata ────────────────────────────────────────────────────────────────
export default function WorkoutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab]       = useState('guided');   // 'guided' | 'device'
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [modal, setModal]   = useState(false);

  const filtered = SPORTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filtered.map(s => s.category))];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attività Fisica</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'guided' && styles.tabActive]}
            onPress={() => setTab('guided')}
          >
            <Text style={[styles.tabText, tab === 'guided' && styles.tabTextActive]}>
              🎯 Allenamento guidato
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'device' && styles.tabActive]}
            onPress={() => setTab('device')}
          >
            <Text style={[styles.tabText, tab === 'device' && styles.tabTextActive]}>
              ⌚ Sul dispositivo
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'guided' ? (
          <>
            {/* Info guided */}
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>
                L'app ti guida passo per passo e registra percorso GPS, frequenza cardiaca e calorie in tempo reale.
              </Text>
            </View>
            {/* Allenamenti guidati */}
            {GUIDED.map(g => (
              <GuidedCard key={g.id} item={g} onPress={() => { setSelected(g); setModal(true); }} />
            ))}
          </>
        ) : (
          <>
            {/* Ricerca sport */}
            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Cerca sport..."
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <Text style={styles.sportCount}>{filtered.length} sport disponibili</Text>

            {/* Sport per categoria */}
            {categories.map(cat => (
              <View key={cat} style={styles.catSection}>
                <Text style={styles.catTitle}>{cat}</Text>
                <View style={styles.sportGrid}>
                  {filtered.filter(s => s.category === cat).map(sport => (
                    <TouchableOpacity
                      key={sport.id}
                      style={[styles.sportCard, selected?.id === sport.id && styles.sportCardActive]}
                      onPress={() => setSelected(sport)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.sportIcon}>{sport.icon}</Text>
                      <Text style={styles.sportName}>{sport.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Bottone avvia */}
      {(selected || tab === 'guided') && tab === 'device' && selected && (
        <View style={styles.startWrap}>
          <TouchableOpacity style={styles.startBtn} activeOpacity={0.85}
            onPress={() => setModal(true)}>
            <Text style={styles.startBtnText}>▶  Avvia {selected.name}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal avvio allenamento */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>{selected?.icon ?? '🏃'}</Text>
            <Text style={styles.modalTitle}>{selected?.name ?? 'Allenamento'}</Text>
            {selected?.duration && (
              <Text style={styles.modalMeta}>⏱ {selected.duration}  •  🔥 ~{selected.cal} kcal</Text>
            )}
            <View style={styles.modalMetrics}>
              {['Frequenza cardiaca', 'Calorie', 'Distanza GPS', 'Passo/km'].map(m => (
                <View key={m} style={styles.modalMetric}>
                  <Text style={styles.modalMetricLabel}>{m}</Text>
                  <Text style={styles.modalMetricValue}>--</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.goBtn} activeOpacity={0.85}
              onPress={() => setModal(false)}>
              <Text style={styles.goBtnText}>▶  Inizia ora</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
              <Text style={styles.cancelBtnText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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

  tabs: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: 14, padding: 4, marginBottom: 20,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center',
  },
  tabActive:     { backgroundColor: colors.cyan },
  tabText:       { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  tabTextActive: { color: '#fff' },

  infoCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: colors.cyan + '11',
    borderRadius: 14, borderWidth: 1, borderColor: colors.cyan + '33',
    padding: 14, marginBottom: 16,
  },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, marginBottom: 8,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1, paddingVertical: 12,
    fontFamily: fonts.regular, fontSize: 14, color: colors.text,
  },
  sportCount: {
    fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted,
    marginBottom: 16,
  },

  catSection:  { marginBottom: 20 },
  catTitle: {
    fontFamily: fonts.semiBold, fontSize: 11,
    color: colors.textMuted, letterSpacing: 1.2, marginBottom: 10,
  },
  sportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sportCard: {
    width: '30%', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 14, paddingHorizontal: 8,
  },
  sportCardActive: {
    borderColor: colors.cyan, backgroundColor: colors.cyan + '22',
  },
  sportIcon: { fontSize: 24, marginBottom: 6 },
  sportName: { fontFamily: fonts.medium, fontSize: 10, color: colors.text, textAlign: 'center' },

  startWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 18,
    backgroundColor: colors.background + 'EE',
  },
  startBtn: {
    backgroundColor: colors.success,
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  startBtnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },

  modalOverlay: {
    flex: 1, backgroundColor: '#000000AA',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, alignItems: 'center',
  },
  modalIcon:        { fontSize: 48, marginBottom: 8 },
  modalTitle:       { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 4 },
  modalMeta:        { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  modalMetrics: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    width: '100%', marginBottom: 24,
  },
  modalMetric: {
    flex: 1, minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    padding: 12, alignItems: 'center',
  },
  modalMetricLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  modalMetricValue: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  goBtn: {
    backgroundColor: colors.success,
    borderRadius: 16, paddingVertical: 15,
    alignItems: 'center', width: '100%', marginBottom: 12,
  },
  goBtnText:    { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  cancelBtn:    { paddingVertical: 10 },
  cancelBtnText:{ fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
});
