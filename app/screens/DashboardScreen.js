import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import VitaliyxLogo from '../components/VitaliyxLogo';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useBiometricStore } from '../store/biometricStore';
import { useDeviceStore } from '../store/deviceStore';
import { useAuthStore } from '../store/authStore';
import ECGWaveform from '../components/ECGWaveform';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;

// ─── Ring progress (SVG) ─────────────────────────────────────────────────────
function Ring({ value, max, color, size = 48 }) {
  const r = (size - 7) / 2;
  const circ = 2 * Math.PI * r;
  const filled = max > 0 ? (Math.min(value, max) / max) * circ : 0;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"
      />
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

// ─── Card metrica G-Band style ────────────────────────────────────────────────
function GBandCard({ label, icon, value, unit, barValue, barMax = 100, color, sublabel, alert, onPress }) {
  const barPercent = barValue != null ? Math.min(100, Math.max(0, (barValue / barMax) * 100)) : null;
  const displayVal = value ?? '—';

  return (
    <TouchableOpacity
      style={[styles.gCard, alert && { borderColor: colors.error + '99' }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* Glow sfondo */}
      <View style={[styles.gCardGlow, { backgroundColor: color }]} />

      {/* Header: label + ring */}
      <View style={styles.gCardHeader}>
        <View style={styles.gCardLabelRow}>
          <Text style={styles.gCardIcon}>{icon}</Text>
          <Text style={styles.gCardLabel}>{label.toUpperCase()}</Text>
        </View>
        {barMax > 0 && barValue != null && (
          <Ring value={barValue} max={barMax} color={color} size={40} />
        )}
      </View>

      {/* Numero grande */}
      <View style={styles.gCardValueRow}>
        <Text style={[styles.gCardValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
          {typeof displayVal === 'number' ? displayVal.toLocaleString('it-IT') : displayVal}
        </Text>
        <Text style={[styles.gCardUnit, { color: color + 'AA' }]}>{unit}</Text>
      </View>

      {/* Barra progresso */}
      {barPercent != null && (
        <View style={styles.gBarTrack}>
          <View style={[styles.gBarFill, { width: `${barPercent}%`, backgroundColor: color }]} />
        </View>
      )}

      {/* Sublabel */}
      {sublabel != null && sublabel !== undefined && (
        <Text style={[styles.gCardSub, alert && { color: colors.error }]}>
          {alert ? '● ' : ''}{sublabel}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { isConnected, batteryLevel } = useDeviceStore();
  const {
    heartRate, hrv, spo2, stress,
    steps, stepsGoal, temperature,
    bloodPressureSys, bloodPressureDia,
    glucose, bodyFat, muscleMass, bodyWater, bmi,
    uricAcid, cholesterol, triglycerides, hdl, ldl,
    met,
    sleep, ecgRecords, lastSync,
    getHrvLabel, getStressLabel,
    getRecommendedPatch,
  } = useBiometricStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const recommendations = getRecommendedPatch?.() || [];
  const recommendation = recommendations[0];
  const latestEcg = ecgRecords?.[ecgRecords.length - 1];
  const stepsPercent = Math.min(100, Math.round(((steps || 0) / (stepsGoal || 10000)) * 100));
  const firstNameDisplay = user?.name?.split(' ')?.[0] || 'Ciao';
  const syncStr = lastSync
    ? new Date(lastSync).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: 100 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4444FF" />}
      showsVerticalScrollIndicator={false}
    >

      {/* ── Top bar: logo + device badge ── */}
      <View style={styles.topBar}>
        <VitaliyxLogo size={34} />
        <TouchableOpacity
          style={[styles.deviceBadge, { borderColor: isConnected ? colors.success : colors.error }]}
          onPress={() => navigation.navigate('Pairing')}
        >
          <View style={[styles.deviceDot, { backgroundColor: isConnected ? colors.success : colors.error }]} />
          <Text style={styles.deviceText}>
            {isConnected ? `SENSES${batteryLevel > 0 ? '  ' + batteryLevel + '%' : ''}` : 'Non connesso'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Saluto ── */}
      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>Ciao, {firstNameDisplay} 👋</Text>
        {syncStr
          ? <Text style={styles.syncLabel}>Aggiornato alle {syncStr}</Text>
          : <Text style={styles.syncLabel}>Martedì, 14 aprile 2026</Text>
        }
      </View>

      {/* ── Griglia 2x2 G-Band ── */}
      <Text style={styles.sectionTitle}>Parametri live</Text>
      <View style={styles.grid}>
        <GBandCard
          label="Freq. Cardiaca"
          icon="❤️"
          value={heartRate || '—'}
          unit="bpm"
          color={heartRate > 100 ? colors.error : '#E74C3C'}
          alert={heartRate > 100}
          sublabel={heartRate > 100 ? 'Sopra la norma' : 'Normale'}
          barValue={heartRate || 0}
          barMax={200}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'heartRate' })}
        />
        <GBandCard
          label="SpO₂"
          icon="🫧"
          value={spo2 || '—'}
          unit="%"
          color={spo2 > 0 && spo2 < 92 ? colors.error : '#6B6BFF'}
          alert={spo2 > 0 && spo2 < 92}
          sublabel={spo2 > 0 && spo2 < 92 ? 'Basso' : 'Normale'}
          barValue={spo2 || 0}
          barMax={100}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'spo2' })}
        />
        <GBandCard
          label="Stress"
          icon="🧠"
          value={stress || '—'}
          unit="/100"
          color={stress > 70 ? colors.warning : '#9B59B6'}
          sublabel={getStressLabel?.(stress)}
          barValue={stress || 0}
          barMax={100}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'stress' })}
        />
        <GBandCard
          label="HRV"
          icon="💓"
          value={hrv || '—'}
          unit="ms"
          color={hrv > 50 ? colors.success : hrv > 20 ? colors.warning : colors.error}
          sublabel={getHrvLabel?.(hrv)}
          barValue={hrv || 0}
          barMax={120}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'hrv' })}
        />
      </View>

      {/* ── Riga aggiuntiva: Temperatura + Pressione ── */}
      <View style={styles.grid}>
        <GBandCard
          label="Temperatura"
          icon="🌡️"
          value={temperature ? temperature.toFixed(1) : '—'}
          unit="°C"
          color={colors.warning}
          sublabel="Corporea"
          barValue={temperature ? ((temperature - 35) / 5) * 100 : 0}
          barMax={100}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'temperature' })}
        />
        <GBandCard
          label="Pressione"
          icon="💉"
          value={bloodPressureSys && bloodPressureDia ? `${bloodPressureSys}/${bloodPressureDia}` : '—'}
          unit="mmHg"
          color={colors.patchFlow}
          sublabel="Stima ottica"
          barValue={bloodPressureSys || 0}
          barMax={180}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'bloodPressure' })}
        />
      </View>

      {/* ── Glicemia + MET ── */}
      <Text style={styles.sectionTitle}>Metabolismo</Text>
      <View style={styles.grid}>
        <GBandCard
          label="Glicemia"
          icon="🩸"
          value={glucose || '—'}
          unit="mg/dL"
          color={glucose > 126 ? colors.error : glucose > 99 ? colors.warning : '#F97316'}
          sublabel={glucose > 126 ? 'Alta' : glucose > 99 ? 'Alterata' : 'Normale'}
          barValue={glucose || 0}
          barMax={200}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'glucose' })}
        />
        <GBandCard
          label="MET"
          icon="⚡"
          value={met ? met.toFixed(1) : '—'}
          unit="MET"
          color={met >= 6 ? '#EF4444' : met >= 3 ? '#F97316' : '#10B981'}
          sublabel={met >= 6 ? 'Intenso' : met >= 3 ? 'Moderato' : 'Riposo'}
          barValue={met || 0}
          barMax={12}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'met' })}
        />
      </View>

      {/* ── Composizione corporea ── */}
      <Text style={styles.sectionTitle}>Composizione corporea</Text>
      <View style={styles.grid}>
        <GBandCard
          label="Grasso"
          icon="📊"
          value={bodyFat ? bodyFat.toFixed(1) : '—'}
          unit="% fat"
          color={bodyFat > 25 ? colors.warning : '#3B82F6'}
          sublabel={bodyFat > 30 ? 'Elevato' : bodyFat > 25 ? 'Nella norma alta' : 'Ottimale'}
          barValue={bodyFat || 0}
          barMax={40}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'bodyComposition' })}
        />
        <GBandCard
          label="Muscoli"
          icon="💪"
          value={muscleMass ? muscleMass.toFixed(1) : '—'}
          unit="% musc"
          color="#8B5CF6"
          sublabel={muscleMass > 40 ? 'Eccellente' : muscleMass > 33 ? 'Buono' : 'Da migliorare'}
          barValue={muscleMass || 0}
          barMax={60}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'bodyComposition' })}
        />
        <GBandCard
          label="Acqua"
          icon="💧"
          value={bodyWater ? bodyWater.toFixed(1) : '—'}
          unit="% H₂O"
          color="#06B6D4"
          sublabel={bodyWater > 60 ? 'Ottimale' : bodyWater > 50 ? 'Normale' : 'Bassa'}
          barValue={bodyWater || 0}
          barMax={80}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'bodyComposition' })}
        />
        <GBandCard
          label="BMI"
          icon="⚖️"
          value={bmi ? bmi.toFixed(1) : '—'}
          unit="kg/m²"
          color={bmi > 30 ? colors.error : bmi > 25 ? colors.warning : '#2ECC71'}
          sublabel={bmi > 30 ? 'Obesità' : bmi > 25 ? 'Sovrappeso' : bmi > 18.5 ? 'Normale' : 'Sottopeso'}
          barValue={bmi || 0}
          barMax={40}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'bodyComposition' })}
        />
      </View>

      {/* ── Componenti del sangue ── */}
      <Text style={styles.sectionTitle}>Componenti del sangue</Text>
      <View style={styles.grid}>
        <GBandCard
          label="Acido urico"
          icon="🔴"
          value={uricAcid || '—'}
          unit="μmol/L"
          color={uricAcid > 420 ? colors.error : uricAcid < 150 ? colors.warning : '#EF4444'}
          sublabel={uricAcid > 420 ? 'Alta' : uricAcid < 150 ? 'Bassa' : 'Normale'}
          barValue={uricAcid || 0}
          barMax={600}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'bloodComponents', tab: 'uric' })}
        />
        <GBandCard
          label="Colesterolo"
          icon="🩸"
          value={cholesterol ? cholesterol.toFixed(2) : '—'}
          unit="mmol/L"
          color={cholesterol > 5.17 ? colors.error : '#F43F5E'}
          sublabel={cholesterol > 5.17 ? 'Alto' : cholesterol < 2.8 ? 'Basso' : 'Normale'}
          barValue={cholesterol ? (cholesterol / 8) * 100 : 0}
          barMax={100}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'bloodComponents', tab: 'lipids' })}
        />
        <GBandCard
          label="Trigliceridi"
          icon="🟠"
          value={triglycerides ? triglycerides.toFixed(2) : '—'}
          unit="mmol/L"
          color={triglycerides > 1.7 ? colors.warning : '#2ECC71'}
          sublabel={triglycerides > 1.7 ? 'Alti' : 'Normale'}
          barValue={triglycerides ? (triglycerides / 4) * 100 : 0}
          barMax={100}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'bloodComponents', tab: 'lipids' })}
        />
        <GBandCard
          label="HDL / LDL"
          icon="🟡"
          value={hdl ? hdl.toFixed(2) : '—'}
          unit="mmol/L"
          color="#F59E0B"
          sublabel={`LDL ${ldl ? ldl.toFixed(2) : '—'}`}
          barValue={hdl ? (hdl / 2) * 100 : 0}
          barMax={100}
          onPress={() => navigation.navigate('MetricDetail', { metricKey: 'bloodComponents', tab: 'lipids' })}
        />
      </View>

      {/* ── Passi ── */}
      <ExpoLinearGradient
        colors={['#1D3A8A', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.stepsCard}
      >
        <View style={styles.stepsHeaderRow}>
          <Text style={styles.stepsIcon}>🦶</Text>
          <Text style={styles.stepsLabel}>Passi oggi</Text>
          <Text style={styles.stepsValue}>{(steps || 0).toLocaleString('it-IT')}</Text>
          <Text style={styles.stepsGoal}>/ {(stepsGoal || 10000).toLocaleString('it-IT')}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${stepsPercent}%` }]} />
        </View>
        <Text style={styles.stepsPercent}>{stepsPercent}% dell'obiettivo giornaliero</Text>
      </ExpoLinearGradient>

      {/* ── ECG recente ── */}
      <View style={styles.ecgCard}>
        <View style={styles.ecgHeader}>
          <Text style={styles.sectionTitle}>ECG recente</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ECG')}>
            <Text style={styles.seeMore}>Vedi tutto →</Text>
          </TouchableOpacity>
        </View>
        <ECGWaveform
          waveform={latestEcg?.waveform}
          width={SCREEN_WIDTH - 56}
          height={72}
          animated={!latestEcg}
        />
        {latestEcg && (
          <Text style={[styles.ecgScore, { color: colors.success }]}>
            Score {latestEcg.score}/100
          </Text>
        )}
      </View>

      {/* ── Sonno ── */}
      {sleep?.total > 0 && (
        <TouchableOpacity
          style={styles.sleepCard}
          onPress={() => navigation.navigate('Sleep')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>Sonno</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {sleep.score != null && (
                <View style={styles.sleepScoreBadge}>
                  <Text style={styles.sleepScoreText}>{sleep.score}/100</Text>
                </View>
              )}
              <Text style={{ color: colors.cyan, fontSize: 16 }}>→</Text>
            </View>
          </View>
          <View style={styles.sleepRow}>
            {[
              { label: 'Totale',   value: `${sleep.total}h`, color: colors.cyan },
              { label: 'Profondo', value: `${sleep.deep}h`,  color: '#1515BB' },
              { label: 'REM',      value: `${sleep.rem}h`,   color: colors.purple },
              { label: 'Leggero',  value: `${sleep.light}h`, color: colors.cyanLight },
            ].map(s => (
              <View key={s.label} style={styles.sleepStat}>
                <Text style={[styles.sleepVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.sleepLbl}>{s.label}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* ── Patch consigliato ── */}
      {recommendation && (
        <TouchableOpacity
          style={styles.recBanner}
          onPress={() => navigation.navigate('Recommendation')}
          activeOpacity={0.85}
        >
          <Text style={styles.recEmoji}>🩹</Text>
          <View style={styles.recBody}>
            <Text style={styles.recTitle}>Patch consigliato: {recommendation?.patch}</Text>
            <Text style={styles.recSub}>Vedi la raccomandazione AI →</Text>
          </View>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deviceDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  deviceText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Greeting
  greetingBlock: {
    marginBottom: 20,
  },
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  syncLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
  },

  // G-Band grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },

  // G-Band card
  gCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    overflow: 'hidden',
  },
  gCardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.07,
  },
  gCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  gCardIcon: {
    fontSize: 16,
  },
  gCardLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  gCardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  gCardValue: {
    fontFamily: fonts.bold,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1,
  },
  gCardUnit: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 4,
  },
  gBarTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  gBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  gCardSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Passi (gradient card)
  stepsCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  stepsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  stepsIcon: { fontSize: 18 },
  stepsLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  stepsValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: '#fff',
  },
  stepsGoal: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  stepsPercent: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
  },

  // ECG
  ecgCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  ecgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeMore: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.cyan,
  },
  ecgScore: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    marginTop: 6,
  },

  // Sleep
  sleepCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  sleepRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  sleepStat: {
    alignItems: 'center',
    gap: 4,
  },
  sleepVal: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  sleepLbl: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
  },
  sleepScoreBadge: {
    backgroundColor: colors.cyan + '22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.cyan + '55',
  },
  sleepScoreText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.cyan,
  },

  // Patch banner
  recBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cyan + '18',
    borderWidth: 1,
    borderColor: colors.cyan + '55',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  recEmoji: { fontSize: 28 },
  recBody: { flex: 1 },
  recTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  recSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.cyan,
    marginTop: 2,
  },
});
