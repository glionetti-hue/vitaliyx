import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';

// ─── Chiavi AsyncStorage ──────────────────────────────────────────────────────
const KEY_LIVE    = 'vitaliyx_biometrics_live';
const KEY_HISTORY = 'vitaliyx_biometrics_history';
const KEY_ECG     = 'vitaliyx_ecg_records';

// ─── Genera waveform ECG demo plausibile ─────────────────────────────────────
function generateDemoEcg() {
  const points = [];
  for (let i = 0; i < 250; i++) {
    const t = i / 250;
    const beat = Math.floor(t * 4);
    const phase = (t * 4) - beat;
    let v = 0;
    if (phase < 0.10)       v = Math.sin(phase * Math.PI / 0.10) * 0.15;
    else if (phase < 0.25)  v = 0;
    else if (phase < 0.28)  v = -Math.sin((phase - 0.25) * Math.PI / 0.03) * 0.20;
    else if (phase < 0.32)  v = Math.sin((phase - 0.28) * Math.PI / 0.04) * 1.00;
    else if (phase < 0.36)  v = -Math.sin((phase - 0.32) * Math.PI / 0.04) * 0.15;
    else if (phase < 0.55)  v = Math.sin((phase - 0.36) * Math.PI / 0.19) * 0.20;
    else                    v = 0;
    points.push(+(v + (Math.random() - 0.5) * 0.02).toFixed(4));
  }
  return points;
}

// ─── Dati demo di default ─────────────────────────────────────────────────────
const DEMO_DATA = {
  heartRate:        72,
  hrv:              54,
  spo2:             98,
  stress:           34,
  steps:            6847,
  stepsGoal:        8000,
  temperature:      36.6,
  bloodPressureSys: 118,
  bloodPressureDia: 76,
  glucose:          92,
  bodyFat:          18.4,
  muscleMass:       44.2,
  bodyWater:        57.1,
  bmi:              22.8,
  uricAcid:         302,
  cholesterol:      3.46,
  triglycerides:    1.11,
  hdl:              1.05,
  ldl:              1.25,
  met:              1.4,
  sleep: {
    total:    7.2,
    deep:     1.4,
    light:    3.8,
    rem:      2.0,
    awake:    0.3,
    score:    78,        // qualità 0-100
    bedtime:  '23:14',
    wakeup:   '06:26',
    // timeline oraria: 0=sveglio 1=leggero 2=profondo 3=REM
    timeline: [
      { label: '23', stage: 0 },
      { label: '00', stage: 1 },
      { label: '01', stage: 2 },
      { label: '02', stage: 2 },
      { label: '03', stage: 3 },
      { label: '04', stage: 1 },
      { label: '05', stage: 2 },
      { label: '06', stage: 3 },
      { label: '07', stage: 0 },
    ],
  },
  lastSync: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
};

const DEMO_HISTORY = {
  hr:          [68, 71, 74, 72, 69, 75, 72],
  hrv:         [48, 51, 53, 49, 55, 52, 54],
  spo2:        [97, 98, 98, 97, 99, 98, 98],
  stress:      [42, 38, 35, 40, 30, 33, 34],
  steps:       [7200, 8100, 5900, 9300, 6400, 7800, 6847],
  glucose:     [88, 95, 91, 102, 87, 94, 92],
  met:         [1.2, 3.8, 1.5, 4.2, 1.3, 2.9, 1.4],
  uricAcid:    [290, 308, 297, 315, 302, 298, 302],
  cholesterol: [3.41, 3.52, 3.38, 3.60, 3.44, 3.49, 3.46],
};

const DEMO_ECG = [
  {
    id: 'demo-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    score: 12,
    waveform: generateDemoEcg(),
  },
];

// ─── Campi live da persistere (esclude funzioni e history) ───────────────────
const LIVE_FIELDS = [
  'heartRate', 'hrv', 'spo2', 'stress', 'steps', 'stepsGoal',
  'temperature', 'bloodPressureSys', 'bloodPressureDia',
  'glucose', 'bodyFat', 'muscleMass', 'bodyWater', 'bmi',
  'uricAcid', 'cholesterol', 'triglycerides', 'hdl', 'ldl',
  'met', 'sleep', 'lastSync',
];

function pickLive(state) {
  const obj = {};
  LIVE_FIELDS.forEach(k => { obj[k] = state[k]; });
  return obj;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useBiometricStore = create((set, get) => ({
  // Stato live iniziale = demo (viene sovrascritto da loadData o dal BLE)
  ...DEMO_DATA,
  history:    DEMO_HISTORY,
  ecgRecords: DEMO_ECG,

  // ── Carica i dati salvati al boot ──────────────────────────────────────────
  loadData: async () => {
    try {
      const [liveRaw, histRaw, ecgRaw] = await Promise.all([
        AsyncStorage.getItem(KEY_LIVE),
        AsyncStorage.getItem(KEY_HISTORY),
        AsyncStorage.getItem(KEY_ECG),
      ]);

      const live    = liveRaw  ? JSON.parse(liveRaw)  : null;
      const history = histRaw  ? JSON.parse(histRaw)  : null;
      const ecg     = ecgRaw   ? JSON.parse(ecgRaw)   : null;

      set({
        ...(live    || DEMO_DATA),
        history:    history    || DEMO_HISTORY,
        ecgRecords: ecg        || DEMO_ECG,
      });
    } catch {
      // fallback silenzioso: resta con i dati demo
    }
  },

  // ── Salva tutti i dati live ────────────────────────────────────────────────
  _saveLive: async () => {
    try {
      await AsyncStorage.setItem(KEY_LIVE, JSON.stringify(pickLive(get())));
    } catch {}
  },

  _saveHistory: async () => {
    try {
      await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(get().history));
    } catch {}
  },

  _saveEcg: async () => {
    try {
      await AsyncStorage.setItem(KEY_ECG, JSON.stringify(get().ecgRecords));
    } catch {}
  },

  // ── Aggiorna dati live (da BLE o manuale) e persiste ──────────────────────
  updateLiveData: (data) => {
    set((state) => ({ ...state, ...data }));
    get()._saveLive();
    // Controlla alert biometrici se ci sono obiettivi salvati
    AsyncStorage.getItem('vitaliyx_goals').then(raw => {
      if (!raw) return;
      try {
        const goals = JSON.parse(raw);
        notificationService.checkBiometricAlerts({ ...get(), ...data }, goals);
      } catch {}
    }).catch(() => {});
  },

  updateSleep: (sleep) => {
    set({ sleep });
    get()._saveLive();
  },

  // ── Aggiungi record ECG e persiste ─────────────────────────────────────────
  addEcgRecord: (record) => {
    set((state) => ({
      ecgRecords: [record, ...state.ecgRecords].slice(0, 50),
      lastEcgScore: record.score,
    }));
    get()._saveEcg();
  },

  // ── Appendi valore alla history e persiste ─────────────────────────────────
  appendHistory: (type, value, timestamp) => {
    set((state) => ({
      history: {
        ...state.history,
        [type]: [...(state.history[type] || []), { value, timestamp }].slice(-168),
      },
    }));
    get()._saveHistory();
  },

  setLastSync: () => {
    set({ lastSync: new Date().toISOString() });
    get()._saveLive();
  },

  // ── Reset ai dati demo (dopo logout) e svuota lo storage ──────────────────
  resetToDemo: async () => {
    set({ ...DEMO_DATA, history: DEMO_HISTORY, ecgRecords: DEMO_ECG });
    try {
      await Promise.all([
        AsyncStorage.removeItem(KEY_LIVE),
        AsyncStorage.removeItem(KEY_HISTORY),
        AsyncStorage.removeItem(KEY_ECG),
      ]);
    } catch {}
  },

  // ── Helper labels ──────────────────────────────────────────────────────────
  getHrvLabel: (val) => {
    const hrv = val ?? get().hrv;
    if (hrv <= 0)   return 'N/D';
    if (hrv <= 29)  return 'Basso';
    if (hrv <= 60)  return 'Normale';
    if (hrv <= 101) return 'Buono';
    return                 'Eccellente';
  },

  getStressLabel: (val) => {
    const stress = val ?? get().stress;
    if (stress < 30) return 'Rilassato';
    if (stress < 60) return 'Normale';
    if (stress < 80) return 'Moderato';
    return                  'Alto';
  },

  getEcgRiskLabel: (score) => {
    if (score == null) return 'NORMAL';
    if (score <= 5)  return 'NORMAL';
    if (score <= 50) return 'LOW';
    if (score <= 70) return 'MEDIUM';
    return                  'HIGH';
  },

  getRecommendedPatch: () => {
    const { hrv, stress, sleep } = get();
    const recs = [];
    if (hrv > 0 && hrv < 30 && stress > 60)
      recs.push({ patch: 'CALMX', reason: 'HRV bassa e stress elevato rilevati' });
    if (sleep.total > 0 && (sleep.total < 6 || sleep.deep < sleep.total * 0.2))
      recs.push({ patch: 'REMX', reason: 'Sonno insufficiente o carenza di sonno profondo' });
    if (hrv > 0 && hrv < 40)
      recs.push({ patch: 'FLOWX', reason: 'HRV ridotta: supporto cognitivo consigliato' });
    return recs;
  },
}));
