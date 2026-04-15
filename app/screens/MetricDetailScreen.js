import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polyline, Line, Text as SvgText, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useBiometricStore } from '../store/biometricStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_W = SCREEN_WIDTH - 48;
const CHART_H = 140;

// ─── Metadati per ogni metrica ────────────────────────────────────────────────
const METRIC_META = {
  heartRate: {
    label:    'Frequenza Cardiaca',
    unit:     'bpm',
    icon:     '❤️',
    color:    '#E74C3C',
    histKey:  'hr',
    ranges: [
      { label: 'Bradicardia',  min: 0,   max: 59,  color: '#3498DB', desc: 'Frequenza bassa. Normale negli atleti, altrimenti da monitorare.' },
      { label: 'Normale',      min: 60,  max: 100, color: '#2ECC71', desc: 'Intervallo sano per un adulto a riposo.' },
      { label: 'Tachicardia',  min: 101, max: 999, color: '#E74C3C', desc: 'Frequenza elevata. Può indicare stress, attività fisica o problemi cardiaci.' },
    ],
    explanation: 'La frequenza cardiaca a riposo misura quante volte il cuore batte al minuto. Un valore basso indica generalmente un cuore efficiente. La zona ideale per un adulto a riposo è tra 60 e 100 bpm.',
    tips: [
      { icon: '🧘', text: 'Respira lentamente per 5 minuti per abbassare la FC a riposo.' },
      { icon: '🏃', text: 'L\'esercizio aerobico regolare abbassa la FC basale nel tempo.' },
      { icon: '☕', text: 'Caffeina ed energie aumentano temporaneamente la FC.' },
    ],
  },
  hrv: {
    label:   'HRV',
    unit:    'ms',
    icon:    '💓',
    color:   '#2ECC71',
    histKey: 'hrv',
    ranges: [
      { label: 'Basso',      min: 0,  max: 29,  color: '#E74C3C', desc: 'Sistema nervoso sotto stress. Recupero insufficiente.' },
      { label: 'Normale',    min: 30, max: 60,  color: '#F39C12', desc: 'Variabilità nella media. Buon equilibrio generale.' },
      { label: 'Buono',      min: 61, max: 100, color: '#2ECC71', desc: 'Sistema nervoso ben bilanciato. Buona resilienza allo stress.' },
      { label: 'Eccellente', min: 101, max: 999, color: '#4444FF', desc: 'Ottima variabilità. Tipico di atleti ben allenati.' },
    ],
    explanation: 'La variabilità della frequenza cardiaca (HRV) misura le piccole variazioni di tempo tra un battito e l\'altro. Un HRV alto indica che il sistema nervoso autonomo è flessibile e in equilibrio — sei meglio equipaggiato per gestire stress e fatigue.',
    tips: [
      { icon: '😴', text: 'Il sonno è il principale fattore che influenza l\'HRV. Dormi 7-9 ore.' },
      { icon: '🧘', text: 'Meditazione e respirazione profonda migliorano l\'HRV in settimane.' },
      { icon: '🍷', text: 'Alcol e stress cronico abbassano significativamente l\'HRV.' },
    ],
  },
  spo2: {
    label:   'SpO₂',
    unit:    '%',
    icon:    '🫧',
    color:   '#6B6BFF',
    histKey: 'spo2',
    ranges: [
      { label: 'Critico',  min: 0,  max: 91, color: '#E74C3C', desc: 'Saturazione pericolosamente bassa. Consulta un medico.' },
      { label: 'Basso',    min: 92, max: 94, color: '#F39C12', desc: 'Sotto la norma. Possibile ipossia lieve.' },
      { label: 'Normale',  min: 95, max: 99, color: '#2ECC71', desc: 'Saturazione ottimale. Il sangue trasporta ossigeno efficacemente.' },
      { label: 'Ottimale', min: 100, max: 100, color: '#4444FF', desc: 'Saturazione massima.' },
    ],
    explanation: 'La saturazione di ossigeno (SpO₂) indica la percentuale di emoglobina nel sangue che trasporta ossigeno. Un valore sano è tra 95% e 100%. Valori sotto il 92% richiedono attenzione medica.',
    tips: [
      { icon: '🌬️', text: 'Respira lentamente e in profondità per ossigenare meglio i tessuti.' },
      { icon: '🏔️', text: 'Ad alta quota la SpO₂ scende naturalmente — è normale.' },
      { icon: '🚭', text: 'Il fumo riduce l\'efficacia del trasporto di ossigeno.' },
    ],
  },
  stress: {
    label:   'Stress',
    unit:    '/100',
    icon:    '🧠',
    color:   '#9B59B6',
    histKey: 'stress',
    ranges: [
      { label: 'Rilassato',  min: 0,  max: 29, color: '#2ECC71', desc: 'Sistema nervoso parasimpatico dominante. Ottimo recupero.' },
      { label: 'Normale',    min: 30, max: 59, color: '#F39C12', desc: 'Livello di stress gestibile. Equilibrio tra attivazione e recupero.' },
      { label: 'Moderato',   min: 60, max: 79, color: '#E67E22', desc: 'Stress elevato. Considera una pausa o attività rilassante.' },
      { label: 'Alto',       min: 80, max: 100, color: '#E74C3C', desc: 'Stress molto alto. Il corpo è in stato di allerta prolungato.' },
    ],
    explanation: 'Il livello di stress è calcolato analizzando la variabilità cardiaca (HRV) e altri parametri fisiologici. Riflette lo stato del sistema nervoso autonomo — più è basso, più sei in uno stato di recupero e calma.',
    tips: [
      { icon: '🧘', text: 'La coerenza cardiaca (respirazione 6 atti/min per 5 min) riduce lo stress rapidamente.' },
      { icon: '🚶', text: 'Una camminata di 15 minuti abbassa il cortisolo del 15-20%.' },
      { icon: '📵', text: 'Limita gli schermi prima di dormire — aumentano lo stress notturno.' },
    ],
  },
  temperature: {
    label:   'Temperatura',
    unit:    '°C',
    icon:    '🌡️',
    color:   '#F39C12',
    histKey: null,
    ranges: [
      { label: 'Ipotermia',  min: 0,    max: 35.9, color: '#3498DB', desc: 'Temperatura corporea pericolosamente bassa.' },
      { label: 'Normale',    min: 36.0, max: 37.2, color: '#2ECC71', desc: 'Temperatura corporea nella norma.' },
      { label: 'Subfebbre',  min: 37.3, max: 37.9, color: '#F39C12', desc: 'Lieve innalzamento. Possibile inizio di un\'infezione.' },
      { label: 'Febbre',     min: 38.0, max: 999,  color: '#E74C3C', desc: 'Febbre. Riposa e idratati. Consulta un medico se persiste.' },
    ],
    explanation: 'La temperatura corporea misurata dalla patch è una stima continua della temperatura cutanea. La temperatura corporea normale varia tra 36.0°C e 37.2°C. Piccole variazioni durante il giorno sono normali.',
    tips: [
      { icon: '💧', text: 'Mantieniti idratato — la disidratazione alza la temperatura.' },
      { icon: '🌙', text: 'La temperatura scende naturalmente di notte durante il sonno profondo.' },
      { icon: '🏋️', text: 'L\'esercizio fisico intenso può alzare la temperatura di 1-2°C.' },
    ],
  },
  glucose: {
    label:   'Glicemia',
    unit:    'mg/dL',
    icon:    '🩸',
    color:   '#F97316',
    histKey: 'glucose',
    ranges: [
      { label: 'Ipoglicemia', min: 0,   max: 69,  color: '#3498DB', desc: 'Zuccheri nel sangue troppo bassi. Mangia qualcosa subito.' },
      { label: 'Normale',     min: 70,  max: 99,  color: '#2ECC71', desc: 'Glicemia a digiuno ottimale. Metabolismo del glucosio sano.' },
      { label: 'Alterata',    min: 100, max: 125, color: '#F39C12', desc: 'Pre-diabete. Valuta modifiche allo stile di vita.' },
      { label: 'Alta',        min: 126, max: 999, color: '#E74C3C', desc: 'Glicemia elevata. Possibile diabete — consulta un medico.' },
    ],
    explanation: 'La glicemia misura la concentrazione di glucosio nel sangue. Il valore ottimale a digiuno è tra 70 e 99 mg/dL. Valori costantemente elevati possono indicare resistenza all\'insulina o diabete. Questa è una stima continua — non sostituisce il prelievo ematico.',
    tips: [
      { icon: '🥗', text: 'Privilegia carboidrati complessi e fibra per evitare picchi glicemici.' },
      { icon: '🏃', text: '20 minuti di camminata dopo i pasti abbassano la glicemia post-prandiale del 20%.' },
      { icon: '😴', text: 'Il sonno scarso aumenta la resistenza all\'insulina. Dormi almeno 7 ore.' },
    ],
  },

  met: {
    label:   'MET',
    unit:    'MET',
    icon:    '⚡',
    color:   '#F97316',
    histKey: 'met',
    ranges: [
      { label: 'Riposo',    min: 0,   max: 1.5, color: '#64748B', desc: 'Sedentario o in riposo. Consumi basali.' },
      { label: 'Leggero',   min: 1.6, max: 2.9, color: '#3498DB', desc: 'Attività leggera: camminata lenta, lavori domestici.' },
      { label: 'Moderato',  min: 3.0, max: 5.9, color: '#2ECC71', desc: 'Attività moderata: camminata veloce, ciclismo.' },
      { label: 'Intenso',   min: 6.0, max: 8.9, color: '#F39C12', desc: 'Attività intensa: jogging, nuoto, palestra.' },
      { label: 'Molto int.', min: 9.0, max: 999, color: '#E74C3C', desc: 'Attività molto intensa: corsa, sport agonistico.' },
    ],
    explanation: 'Il MET (Metabolic Equivalent of Task) misura l\'intensità di un\'attività fisica rispetto al metabolismo basale. 1 MET = riposo. Valori tra 3 e 6 corrispondono ad attività moderata, sopra 6 ad attività intensa. L\'OMS raccomanda almeno 150 min/settimana a intensità moderata.',
    tips: [
      { icon: '🎯', text: 'Punta a 150 min/settimana di attività a MET ≥ 3 per benefici cardiovascolari.' },
      { icon: '🪜', text: 'Anche piccoli movimenti durante la giornata (scale, camminata) alzano il MET medio.' },
      { icon: '💪', text: 'L\'allenamento a intervalli (HIIT) massimizza i MET in meno tempo.' },
    ],
  },

  bodyComposition: {
    label:   'Composizione Corporea',
    unit:    '%',
    icon:    '📊',
    color:   '#3B82F6',
    histKey: null,
    ranges: [
      { label: 'Ottimale',    min: 10, max: 20, color: '#2ECC71', desc: 'Grasso corporeo nella fascia ideale per la salute.' },
      { label: 'Normale',     min: 21, max: 25, color: '#F39C12', desc: 'Nella media. Puoi migliorare con attività fisica.' },
      { label: 'Elevato',     min: 26, max: 30, color: '#E67E22', desc: 'Grasso corporeo sopra la media. Aumenta l\'attività aerobica.' },
      { label: 'Molto elev.', min: 31, max: 999, color: '#E74C3C', desc: 'Rischio metabolico elevato. Consulta un nutrizionista.' },
    ],
    explanation: 'La composizione corporea analizza le percentuali di grasso, muscolo, acqua e massa ossea. Una buona composizione non dipende solo dal peso: due persone con lo stesso peso possono avere composizioni completamente diverse. Il BMI da solo non è sufficiente — la percentuale di grasso è molto più informativa.',
    tips: [
      { icon: '🏋️', text: 'L\'allenamento con i pesi aumenta la massa muscolare e riduce il grasso anche a riposo.' },
      { icon: '💧', text: 'L\'idratazione influisce sulla lettura: misura sempre in condizioni simili.' },
      { icon: '🥩', text: 'Proteine adeguate (1.6-2 g/kg di peso) favoriscono il mantenimento muscolare.' },
    ],
  },

  bloodComponents: {
    label:   'Componenti del Sangue',
    unit:    'μmol/L',
    icon:    '🔴',
    color:   '#EF4444',
    histKey: 'uricAcid',
    // ranges per acido urico (tab default)
    ranges: [
      { label: 'Bassa',   min: 0,   max: 149, color: '#3498DB', desc: 'Acido urico sotto il range normale.' },
      { label: 'Normale', min: 150, max: 420, color: '#2ECC71', desc: 'Livello ottimale. Nessun rischio di gotta o calcoli.' },
      { label: 'Alta',    min: 421, max: 999, color: '#E74C3C', desc: 'Iperuricemia. Rischio di gotta e calcoli renali. Riduci carni rosse e alcol.' },
    ],
    explanation: 'L\'acido urico è un prodotto di scarto del metabolismo delle purine. Livelli elevati nel sangue (iperuricemia) possono causare gotta e calcoli renali. Il profilo lipidico valuta colesterolo, trigliceridi e lipoproteine HDL/LDL per il rischio cardiovascolare.',
    tips: [
      { icon: '💧', text: 'Bevi almeno 2L di acqua al giorno per favorire l\'eliminazione dell\'acido urico.' },
      { icon: '🥗', text: 'Riduci carni rosse, frattaglie e alcol — aumentano la produzione di acido urico.' },
      { icon: '🫐', text: 'Vitamina C e ciliegie riducono i livelli di acido urico nel sangue.' },
    ],
  },

  bloodPressure: {
    label:   'Pressione',
    unit:    'mmHg',
    icon:    '💉',
    color:   '#9B59B6',
    histKey: null,
    ranges: [
      { label: 'Bassa',       min: 0,   max: 89,  color: '#3498DB', desc: 'Pressione bassa (ipotensione). Possibili vertigini.' },
      { label: 'Ottimale',    min: 90,  max: 119, color: '#2ECC71', desc: 'Pressione ottimale. Eccellente per la salute cardiovascolare.' },
      { label: 'Normale',     min: 120, max: 129, color: '#2ECC71', desc: 'Pressione normale. Mantieni uno stile di vita sano.' },
      { label: 'Elevata',     min: 130, max: 139, color: '#F39C12', desc: 'Pressione elevata. Riduci sale e stress.' },
      { label: 'Ipertensione',min: 140, max: 999, color: '#E74C3C', desc: 'Ipertensione. Consulta un medico.' },
    ],
    explanation: 'La pressione sanguigna misura la forza del sangue sulle pareti arteriose. È espressa come sistolica/diastolica. Il valore ottimale è inferiore a 120/80 mmHg. Questa è una stima ottica — per diagnosi usa un sfigmomanometro certificato.',
    tips: [
      { icon: '🧂', text: 'Riduci il sale: ogni grammo in meno abbassa la pressione di 1-2 mmHg.' },
      { icon: '🏊', text: 'L\'esercizio aerobico regolare abbassa la pressione sistolica di 5-10 mmHg.' },
      { icon: '🍌', text: 'Il potassio (banane, legumi) aiuta a bilanciare la pressione.' },
    ],
  },
};

// ─── Grafico a linea con area ─────────────────────────────────────────────────
function SparkChart({ data, color, unit }) {
  if (!data || data.length < 2) return null;

  const vals = data.map(d => (typeof d === 'object' ? d.value : d));
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = (max - min) || 1;
  const pad = 8;

  const points = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (CHART_W - pad * 2);
    const y = pad + ((max - v) / range) * (CHART_H - pad * 2);
    return { x, y };
  });

  const lineStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaStr = [
    `M ${points[0].x},${CHART_H}`,
    ...points.map(p => `L ${p.x},${p.y}`),
    `L ${points[points.length - 1].x},${CHART_H}`,
    'Z',
  ].join(' ');

  const days = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  return (
    <Svg width={CHART_W} height={CHART_H + 24} viewBox={`0 0 ${CHART_W} ${CHART_H + 24}`}>
      <Defs>
        <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>

      {/* Area */}
      <Path d={areaStr} fill="url(#areaGrad)" />

      {/* Linea */}
      <Polyline
        points={lineStr}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Punti */}
      {points.map((p, i) => (
        <React.Fragment key={i}>
          <SvgText
            x={p.x}
            y={p.y - 6}
            fontSize="9"
            fill={color}
            textAnchor="middle"
            opacity="0.8"
          >
            {Math.round(vals[i])}
          </SvgText>
          {/* Etichette giorni */}
          <SvgText
            x={p.x}
            y={CHART_H + 16}
            fontSize="9"
            fill="rgba(255,255,255,0.35)"
            textAnchor="middle"
          >
            {days[i % 7]}
          </SvgText>
        </React.Fragment>
      ))}

      {/* Linee orizzontali guida */}
      {[0.25, 0.5, 0.75].map((frac, i) => (
        <Line
          key={i}
          x1={pad} y1={pad + frac * (CHART_H - pad * 2)}
          x2={CHART_W - pad} y2={pad + frac * (CHART_H - pad * 2)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
    </Svg>
  );
}

// ─── Barra range ──────────────────────────────────────────────────────────────
function RangeBar({ ranges, currentValue }) {
  const total = ranges[ranges.length - 1].max === 999
    ? ranges[ranges.length - 2].max + (ranges[ranges.length - 2].max - ranges[0].min) * 0.3
    : ranges[ranges.length - 1].max;
  const minVal = ranges[0].min;

  return (
    <View style={{ marginVertical: 12 }}>
      {/* Barra colorata a segmenti */}
      <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
        {ranges.map((r, i) => {
          const segMax = r.max === 999 ? total : r.max;
          const segMin = r.min;
          const width = ((segMax - segMin) / (total - minVal)) * 100;
          return (
            <View key={i} style={{ flex: width, backgroundColor: r.color, opacity: 0.7 }} />
          );
        })}
      </View>

      {/* Indicatore valore corrente */}
      {currentValue != null && (() => {
        const clampedVal = Math.min(Math.max(currentValue, minVal), total);
        const pct = ((clampedVal - minVal) / (total - minVal)) * 100;
        return (
          <View style={{ position: 'relative', height: 20 }}>
            <View style={{
              position: 'absolute',
              left: `${Math.min(Math.max(pct, 2), 96)}%`,
              top: 0,
              transform: [{ translateX: -6 }],
              width: 12, height: 12,
              borderRadius: 6,
              backgroundColor: '#fff',
              borderWidth: 2,
              borderColor: getCurrentRangeColor(ranges, currentValue),
              shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
              elevation: 3,
            }} />
          </View>
        );
      })()}

      {/* Etichette range */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        {ranges.map((r, i) => (
          <Text key={i} style={{ fontSize: 9, color: r.color, fontWeight: '600', flex: 1, textAlign: 'center' }}>
            {r.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function getCurrentRangeColor(ranges, value) {
  for (const r of ranges) {
    if (value >= r.min && value <= r.max) return r.color;
  }
  return '#fff';
}

function getCurrentRange(ranges, value) {
  for (const r of ranges) {
    if (value >= r.min && value <= r.max) return r;
  }
  return ranges[0];
}

// ─── Schermata principale ─────────────────────────────────────────────────────
export default function MetricDetailScreen({ route, navigation }) {
  const { metricKey } = route.params;
  const insets = useSafeAreaInsets();

  const store = useBiometricStore();
  const meta = METRIC_META[metricKey];

  if (!meta) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Metrica non trovata</Text>
      </View>
    );
  }

  const [bloodTab, setBloodTab] = useState(route.params?.tab === 'lipids' ? 'lipids' : 'uric');

  // Valore corrente
  let currentValue = null;
  if (metricKey === 'heartRate')       currentValue = store.heartRate;
  if (metricKey === 'hrv')             currentValue = store.hrv;
  if (metricKey === 'spo2')            currentValue = store.spo2;
  if (metricKey === 'stress')          currentValue = store.stress;
  if (metricKey === 'temperature')     currentValue = store.temperature;
  if (metricKey === 'bloodPressure')   currentValue = store.bloodPressureSys;
  if (metricKey === 'glucose')         currentValue = store.glucose;
  if (metricKey === 'met')             currentValue = store.met;
  if (metricKey === 'bodyComposition') currentValue = store.bodyFat;
  if (metricKey === 'bloodComponents') currentValue = bloodTab === 'lipids' ? store.cholesterol : store.uricAcid;

  const historyRaw = meta.histKey ? store.history?.[meta.histKey] : null;
  const currentRange = currentValue != null ? getCurrentRange(meta.ranges, currentValue) : null;

  const displayValue = metricKey === 'bloodPressure'
    ? `${store.bloodPressureSys}/${store.bloodPressureDia}`
    : metricKey === 'temperature'
    ? store.temperature?.toFixed(1)
    : metricKey === 'met'
    ? store.met?.toFixed(1)
    : metricKey === 'bodyComposition'
    ? `${store.bodyFat?.toFixed(1)}%`
    : metricKey === 'bloodComponents'
    ? (bloodTab === 'lipids' ? `${store.cholesterol?.toFixed(2)} mmol/L` : `${store.uricAcid} μmol/L`)
    : metricKey === 'glucose'
    ? store.glucose
    : currentValue;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 48 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header con back */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{meta.label}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero: valore grande + stato — nascosto in tab lipidi */}
      {!(metricKey === 'bloodComponents' && bloodTab === 'lipids') && (
      <View style={[styles.heroCard, { borderColor: meta.color + '44' }]}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroIcon}>{meta.icon}</Text>
          <View>
            <Text style={[styles.heroValue, { color: meta.color }]}>{displayValue}</Text>
            <Text style={styles.heroUnit}>{meta.unit}</Text>
          </View>
        </View>
        {currentRange && (
          <View style={[styles.statusBadge, { backgroundColor: currentRange.color + '22', borderColor: currentRange.color + '55' }]}>
            <View style={[styles.statusDot, { backgroundColor: currentRange.color }]} />
            <Text style={[styles.statusLabel, { color: currentRange.color }]}>{currentRange.label}</Text>
          </View>
        )}
      </View>

      )}

      {/* Tab switcher Acido urico / Lipidi */}
      {metricKey === 'bloodComponents' && (
        <View style={styles.tabSwitcher}>
          {[
            { key: 'uric',   label: 'Acido urico' },
            { key: 'lipids', label: 'Lipidi' },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, bloodTab === t.key && styles.tabBtnActive]}
              onPress={() => setBloodTab(t.key)}
            >
              <Text style={[styles.tabBtnText, bloodTab === t.key && styles.tabBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Pannello Lipidi (sostituisce la vista standard se tab=lipids) */}
      {metricKey === 'bloodComponents' && bloodTab === 'lipids' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profilo lipidico</Text>
          <View style={styles.card}>
            {/* Intestazione tabella */}
            <View style={[styles.lipidRow, { marginBottom: 4 }]}>
              <Text style={[styles.lipidName, { color: colors.textMuted, fontSize: 11 }]}>Parametro</Text>
              <Text style={[styles.lipidRange, { color: colors.textMuted, fontSize: 11 }]}>Intervallo</Text>
              <Text style={[styles.lipidValue, { color: colors.textMuted, fontSize: 11 }]}>Valore</Text>
            </View>
            {[
              { label: 'Colesterolo totale',        value: store.cholesterol,   unit: 'mmol/L', range: '2.8–5.17', color: '#3B82F6', status: store.cholesterol > 5.17 ? 'Alto' : 'OK' },
              { label: 'Trigliceridi',              value: store.triglycerides, unit: 'mmol/L', range: '0.56–1.7', color: '#2ECC71', status: store.triglycerides > 1.7 ? 'Alto' : 'OK' },
              { label: 'HDL (alta densità)',        value: store.hdl,           unit: 'mmol/L', range: '0.96–1.15', color: '#F59E0B', status: store.hdl < 0.96 ? 'Basso' : 'OK' },
              { label: 'LDL (bassa densità)',       value: store.ldl,           unit: 'mmol/L', range: '<3.1',     color: '#EF4444', status: store.ldl > 3.1 ? 'Alto' : 'OK' },
            ].map((item, i) => (
              <View key={i} style={[styles.lipidRow, i > 0 && styles.lipidRowBorder]}>
                <Text style={styles.lipidName}>{item.label}</Text>
                <View style={[styles.lipidRangeBadge, { backgroundColor: item.color + '22' }]}>
                  <Text style={[styles.lipidRangeText, { color: item.color }]}>{item.range}</Text>
                </View>
                <Text style={[styles.lipidValue, { color: item.status === 'OK' ? item.color : colors.error }]}>
                  {item.value?.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Barre range lipidi */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Note</Text>
          <View style={styles.card}>
            <View style={styles.legendRow}>
              {[{ label: 'Bassa', color: '#3498DB' }, { label: 'Normale', color: '#2ECC71' }, { label: 'Alta', color: '#F39C12' }].map(l => (
                <View key={l.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                  <Text style={styles.legendLabel}>{l.label}</Text>
                </View>
              ))}
            </View>
            {[
              { label: 'Colesterolo totale', low: 0, normal: 2.8, high: 5.17, max: 8, value: store.cholesterol },
              { label: 'Trigliceridi',       low: 0, normal: 0.56, high: 1.7, max: 4,  value: store.triglycerides },
              { label: 'HDL',                low: 0, normal: 0.96, high: 1.15, max: 2.5, value: store.hdl },
              { label: 'LDL',                low: 0, normal: 0,    high: 3.1,  max: 5,  value: store.ldl },
            ].map((item, i) => {
              const pctVal = Math.min((item.value / item.max) * 100, 100);
              const pctNorm = ((item.normal - item.low) / item.max) * 100;
              const pctHigh = ((item.high - item.normal) / item.max) * 100;
              const pctRed  = 100 - pctNorm - pctHigh;
              return (
                <View key={i} style={{ marginBottom: 14 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6, fontFamily: fonts.medium }}>{item.label}</Text>
                  <View style={{ height: 8, flexDirection: 'row', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ flex: pctNorm, backgroundColor: '#2ECC71' }} />
                    <View style={{ flex: pctHigh, backgroundColor: '#F39C12' }} />
                    <View style={{ flex: Math.max(pctRed, 0), backgroundColor: '#E74C3C' }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>0</Text>
                    <Text style={{ fontSize: 10, color: '#2ECC71' }}>{item.normal > 0 ? `${item.normal}–${item.high}` : `<${item.high}`}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>{item.max}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Consigli lipidi */}
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Consigli</Text>
          {[
            { icon: '🥑', text: 'Grassi insaturi (olio d\'oliva, avocado, noci) alzano l\'HDL e abbassano l\'LDL.' },
            { icon: '🐟', text: 'Pesce grasso 2-3 volte a settimana riduce i trigliceridi del 20-30%.' },
            { icon: '🚶', text: 'L\'esercizio aerobico regolare è il modo più efficace per alzare l\'HDL.' },
          ].map((tip, i) => (
            <View key={i} style={[styles.tipCard, { borderLeftColor: '#EF4444' }]}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Sub-valori composizione corporea */}
      {metricKey === 'bodyComposition' && (
        <View style={styles.subValuesGrid}>
          {[
            { label: 'Grasso',  value: `${store.bodyFat?.toFixed(1)}%`,   color: '#3B82F6' },
            { label: 'Muscoli', value: `${store.muscleMass?.toFixed(1)}%`, color: '#8B5CF6' },
            { label: 'Acqua',   value: `${store.bodyWater?.toFixed(1)}%`,  color: '#06B6D4' },
            { label: 'BMI',     value: store.bmi?.toFixed(1),              color: '#2ECC71' },
          ].map((s, i) => (
            <View key={i} style={[styles.subValCard, { borderColor: s.color + '44' }]}>
              <Text style={[styles.subValValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.subValLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Sub-valori sangue */}
      {metricKey === 'bloodComponents' && (
        <View style={styles.subValuesGrid}>
          {[
            { label: 'Emoglobina',    value: `${store.hemoglobin?.toFixed(1)} g/dL`,  color: '#EF4444' },
            { label: 'Ematocrito',    value: `${store.hematocrit?.toFixed(1)}%`,       color: '#F43F5E' },
            { label: 'Globuli bianchi', value: `${store.whiteBloodCells?.toFixed(1)} k/μL`, color: '#64748B' },
          ].map((s, i) => (
            <View key={i} style={[styles.subValCard, { borderColor: s.color + '44' }]}>
              <Text style={[styles.subValValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.subValLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Spiegazione range attuale */}
      {currentRange && (
        <View style={styles.rangeExplain}>
          <Text style={styles.rangeExplainText}>{currentRange.desc}</Text>
        </View>
      )}

      {/* Barra dei range */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Range di riferimento</Text>
        <View style={styles.card}>
          <RangeBar ranges={meta.ranges} currentValue={currentValue} />
          {meta.ranges.map((r, i) => (
            <View key={i} style={[styles.rangeRow, i < meta.ranges.length - 1 && styles.rangeRowBorder]}>
              <View style={[styles.rangeColorDot, { backgroundColor: r.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rangeRowLabel}>{r.label}</Text>
                <Text style={styles.rangeRowDesc}>{r.desc}</Text>
              </View>
              <Text style={[styles.rangeRowRange, { color: r.color }]}>
                {r.max === 999 ? `>${r.min}` : `${r.min}–${r.max}`}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Grafico storico */}
      {historyRaw && historyRaw.length >= 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ultimi 7 giorni</Text>
          <View style={styles.card}>
            <SparkChart data={historyRaw} color={meta.color} unit={meta.unit} />
          </View>
        </View>
      )}

      {/* Spiegazione */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cosa significa</Text>
        <View style={styles.card}>
          <Text style={styles.explanationText}>{meta.explanation}</Text>
        </View>
      </View>

      {/* Consigli */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consigli</Text>
        {meta.tips.map((tip, i) => (
          <View key={i} style={[styles.tipCard, { borderLeftColor: meta.color }]}>
            <Text style={styles.tipIcon}>{tip.icon}</Text>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {/* Disclaimer per pressione */}
      {metricKey === 'bloodPressure' && (
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️  La pressione stimata dalla patch è indicativa. Non sostituisce la misurazione con sfigmomanometro certificato.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Stili ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: colors.text,
    lineHeight: 22,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.text,
  },

  // Hero
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIcon: {
    fontSize: 36,
  },
  heroValue: {
    fontFamily: fonts.bold,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1,
  },
  heroUnit: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  statusLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },

  // Range explain
  rangeExplain: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  rangeExplainText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Sezioni
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },

  // Range rows
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
  },
  rangeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rangeColorDot: {
    width: 10, height: 10, borderRadius: 5,
    marginTop: 3,
  },
  rangeRowLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.text,
  },
  rangeRowDesc: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  rangeRowRange: {
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },

  // Explanation
  explanationText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Tips
  tipCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 22,
  },
  tipText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    flex: 1,
  },

  // Tab switcher (acido urico / lipidi)
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#EF4444',
  },
  tabBtnText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: '#fff',
    fontFamily: fonts.semiBold,
  },

  // Tabella lipidi
  lipidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  lipidRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lipidName: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  lipidRangeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lipidRangeText: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  lipidValue: {
    fontFamily: fonts.bold,
    fontSize: 15,
    minWidth: 40,
    textAlign: 'right',
  },

  // Legenda barre
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  legendLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Sub-valori (composizione corporea, sangue)
  subValuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  subValCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  subValValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  subValLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Disclaimer
  disclaimer: {
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '44',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.warning,
    lineHeight: 17,
  },
});
