import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useBiometricStore } from '../store/biometricStore';
import { notificationService } from '../services/notificationService';

const STORAGE_KEY = 'vitaliyx_goals';

// ─── Slider numerico con + / - ───────────────────────────────────────────────
function NumberStepper({ value, min, max, step = 1, onChange, unit }) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => onChange(Math.max(min, value - step))}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </TouchableOpacity>
      <View style={styles.stepValue}>
        <Text style={styles.stepValueText}>{value.toLocaleString('it-IT')}</Text>
        <Text style={styles.stepUnit}>{unit}</Text>
      </View>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => onChange(Math.min(max, value + step))}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Sezione con titolo ───────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

// ─── Riga goal ────────────────────────────────────────────────────────────────
function GoalRow({ icon, label, sublabel, children, last = false }) {
  return (
    <View style={[styles.goalRow, !last && styles.goalRowBorder]}>
      <View style={styles.goalLeft}>
        <Text style={styles.goalIcon}>{icon}</Text>
        <View>
          <Text style={styles.goalLabel}>{label}</Text>
          {sublabel ? <Text style={styles.goalSublabel}>{sublabel}</Text> : null}
        </View>
      </View>
      <View style={styles.goalRight}>{children}</View>
    </View>
  );
}

// ─── Schermata principale ─────────────────────────────────────────────────────
export default function GoalsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { stepsGoal, updateLiveData } = useBiometricStore();

  const [steps,       setSteps]       = useState(stepsGoal || 8000);
  const [sleep,       setSleep]       = useState(8);
  const [water,       setWater]       = useState(2000);
  const [calories,    setCalories]    = useState(2000);
  const [weight,      setWeight]      = useState(75);
  const [hrvTarget,    setHrvTarget]    = useState(60);
  const [stressLimit,  setStressLimit]  = useState(50);
  const [hrMax,        setHrMax]        = useState(100);   // FC massima bpm
  const [spo2Min,      setSpo2Min]      = useState(95);    // SpO₂ minima %
  const [tempMax,      setTempMax]      = useState(37.5);  // Temperatura max °C
  const [bpSysMax,     setBpSysMax]     = useState(130);   // Pressione sistolica max mmHg
  const [bpDiaMax,     setBpDiaMax]     = useState(85);    // Pressione diastolica max mmHg
  const [glucoseMax,   setGlucoseMax]   = useState(120);   // Glicemia max mg/dL
  const [uricAcidMax,  setUricAcidMax]  = useState(360);   // Acido urico max μmol/L
  const [cholesterolMax, setCholesterolMax] = useState(5.2); // Colesterolo totale max mmol/L
  const [notifSteps,  setNotifSteps]  = useState(true);
  const [notifHrv,    setNotifHrv]    = useState(true);
  const [notifSleep,  setNotifSleep]  = useState(false);

  // Carica obiettivi salvati
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const g = JSON.parse(raw);
        if (g.steps       != null) setSteps(g.steps);
        if (g.sleep       != null) setSleep(g.sleep);
        if (g.water       != null) setWater(g.water);
        if (g.calories    != null) setCalories(g.calories);
        if (g.weight      != null) setWeight(g.weight);
        if (g.hrvTarget      != null) setHrvTarget(g.hrvTarget);
        if (g.stressLimit    != null) setStressLimit(g.stressLimit);
        if (g.hrMax          != null) setHrMax(g.hrMax);
        if (g.spo2Min        != null) setSpo2Min(g.spo2Min);
        if (g.tempMax        != null) setTempMax(g.tempMax);
        if (g.bpSysMax       != null) setBpSysMax(g.bpSysMax);
        if (g.bpDiaMax       != null) setBpDiaMax(g.bpDiaMax);
        if (g.glucoseMax     != null) setGlucoseMax(g.glucoseMax);
        if (g.uricAcidMax    != null) setUricAcidMax(g.uricAcidMax);
        if (g.cholesterolMax != null) setCholesterolMax(g.cholesterolMax);
        if (g.notifSteps  != null) setNotifSteps(g.notifSteps);
        if (g.notifHrv    != null) setNotifHrv(g.notifHrv);
        if (g.notifSleep  != null) setNotifSleep(g.notifSleep);
      } catch {}
    }).catch(() => {});
  }, []);

  async function saveGoals() {
    const goals = {
      steps, sleep, water, calories, weight,
      hrvTarget, stressLimit,
      hrMax, spo2Min, tempMax, bpSysMax, bpDiaMax,
      glucoseMax, uricAcidMax, cholesterolMax,
      notifSteps, notifHrv, notifSleep,
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
      // Aggiorna lo store con il nuovo obiettivo passi
      updateLiveData({ stepsGoal: steps });
      // Applica le notifiche schedulat (steps reminder + sleep reminder)
      notificationService.applyGoalSettings(goals).catch(() => {});
      Alert.alert('✅ Salvato', 'I tuoi obiettivi sono stati aggiornati!');
      navigation.goBack();
    } catch {
      Alert.alert('Errore', 'Impossibile salvare gli obiettivi.');
    }
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Obiettivi personali</Text>
        <TouchableOpacity onPress={saveGoals} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Salva</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.intro}>
        Personalizza i tuoi target giornalieri. L'app li userà per calcolare progressi e notifiche.
      </Text>

      {/* Attività fisica */}
      <Section title="🏃  Attività fisica">
        <GoalRow icon="🦶" label="Passi giornalieri" sublabel="Obiettivo di movimento">
          <NumberStepper value={steps} min={1000} max={30000} step={500} unit="passi" onChange={setSteps} />
        </GoalRow>
        <GoalRow icon="🔥" label="Calorie bruciate" sublabel="Dispendio energetico target" last>
          <NumberStepper value={calories} min={500} max={5000} step={50} unit="kcal" onChange={setCalories} />
        </GoalRow>
      </Section>

      {/* Sonno */}
      <Section title="😴  Sonno">
        <GoalRow icon="🕐" label="Ore di sonno" sublabel="Durata consigliata: 7-9h" last>
          <NumberStepper value={sleep} min={4} max={12} step={0.5} unit="ore" onChange={setSleep} />
        </GoalRow>
      </Section>

      {/* Idratazione */}
      <Section title="💧  Idratazione">
        <GoalRow icon="🥤" label="Acqua giornaliera" sublabel="OMS: almeno 2L al giorno" last>
          <NumberStepper value={water} min={500} max={5000} step={250} unit="mL" onChange={setWater} />
        </GoalRow>
      </Section>

      {/* Peso */}
      <Section title="⚖️  Composizione corporea">
        <GoalRow icon="🎯" label="Peso target" sublabel="Obiettivo a lungo termine" last>
          <NumberStepper value={weight} min={30} max={200} step={0.5} unit="kg" onChange={setWeight} />
        </GoalRow>
      </Section>

      {/* Parametri biologici SENSES */}
      <Section title="❤️  Parametri biologici">
        <GoalRow icon="💓" label="HRV minima" sublabel="Avviso se scende sotto questa soglia">
          <NumberStepper value={hrvTarget} min={10} max={120} step={5} unit="ms" onChange={setHrvTarget} />
        </GoalRow>
        <GoalRow icon="🧠" label="Limite stress" sublabel="Avviso se stress supera questo valore">
          <NumberStepper value={stressLimit} min={20} max={90} step={5} unit="/100" onChange={setStressLimit} />
        </GoalRow>
        <GoalRow icon="🫀" label="FC massima" sublabel="Avviso se frequenza cardiaca supera">
          <NumberStepper value={hrMax} min={60} max={200} step={5} unit="bpm" onChange={setHrMax} />
        </GoalRow>
        <GoalRow icon="🫧" label="SpO₂ minima" sublabel="Avviso se ossigenazione scende sotto">
          <NumberStepper value={spo2Min} min={85} max={99} step={1} unit="%" onChange={setSpo2Min} />
        </GoalRow>
        <GoalRow icon="🌡️" label="Temperatura max" sublabel="Avviso se temperatura supera">
          <NumberStepper value={tempMax} min={36.0} max={42.0} step={0.1} unit="°C" onChange={setTempMax} />
        </GoalRow>
        <GoalRow icon="🩸" label="Pressione sistolica max" sublabel="Avviso se pressione sistolica supera">
          <NumberStepper value={bpSysMax} min={100} max={180} step={5} unit="mmHg" onChange={setBpSysMax} />
        </GoalRow>
        <GoalRow icon="🩸" label="Pressione diastolica max" sublabel="Avviso se pressione diastolica supera">
          <NumberStepper value={bpDiaMax} min={60} max={120} step={5} unit="mmHg" onChange={setBpDiaMax} />
        </GoalRow>
        <GoalRow icon="🍬" label="Glicemia massima" sublabel="Avviso se glicemia stimata supera">
          <NumberStepper value={glucoseMax} min={70} max={250} step={5} unit="mg/dL" onChange={setGlucoseMax} />
        </GoalRow>
        <GoalRow icon="🧪" label="Acido urico max" sublabel="Soglia di allerta iperuricemia">
          <NumberStepper value={uricAcidMax} min={200} max={600} step={10} unit="μmol/L" onChange={setUricAcidMax} />
        </GoalRow>
        <GoalRow icon="💊" label="Colesterolo totale max" sublabel="Soglia di allerta colesterolo" last>
          <NumberStepper value={cholesterolMax} min={3.0} max={8.0} step={0.1} unit="mmol/L" onChange={setCholesterolMax} />
        </GoalRow>
      </Section>

      {/* Notifiche */}
      <Section title="🔔  Notifiche">
        <GoalRow icon="🦶" label="Promemoria passi" sublabel="Avviso se sei indietro con i passi">
          <Switch
            value={notifSteps}
            onValueChange={setNotifSteps}
            trackColor={{ false: colors.surface, true: colors.cyan + '88' }}
            thumbColor={notifSteps ? colors.cyan : colors.textMuted}
          />
        </GoalRow>
        <GoalRow icon="💓" label="Allerta HRV bassa" sublabel="Notifica se HRV scende sotto target">
          <Switch
            value={notifHrv}
            onValueChange={setNotifHrv}
            trackColor={{ false: colors.surface, true: colors.cyan + '88' }}
            thumbColor={notifHrv ? colors.cyan : colors.textMuted}
          />
        </GoalRow>
        <GoalRow icon="😴" label="Promemoria sonno" sublabel="Avviso per andare a dormire" last>
          <Switch
            value={notifSleep}
            onValueChange={setNotifSleep}
            trackColor={{ false: colors.surface, true: colors.cyan + '88' }}
            thumbColor={notifSleep ? colors.cyan : colors.textMuted}
          />
        </GoalRow>
      </Section>

      {/* Bottone salva */}
      <TouchableOpacity style={styles.saveFullBtn} onPress={saveGoals} activeOpacity={0.85}>
        <Text style={styles.saveFullBtnText}>💾  Salva obiettivi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Stili ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.card, borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 20, color: colors.text, lineHeight: 22 },
  headerTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  saveBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10, backgroundColor: colors.cyan,
  },
  saveBtnText: { fontFamily: fonts.semiBold, fontSize: 13, color: '#fff' },

  intro: {
    fontFamily: fonts.regular, fontSize: 13,
    color: colors.textMuted, lineHeight: 19,
    marginBottom: 20,
  },

  // Sezione
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: fonts.semiBold, fontSize: 14,
    color: colors.textMuted, letterSpacing: 0.3,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 18, borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  // Goal row
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  goalRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  goalLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1,
  },
  goalIcon: { fontSize: 22 },
  goalLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  goalSublabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 1 },
  goalRight: { alignItems: 'flex-end' },

  // Stepper
  stepper: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  stepBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  stepBtnText: { fontSize: 18, color: colors.text, lineHeight: 22 },
  stepValue: { alignItems: 'center', minWidth: 60 },
  stepValueText: { fontFamily: fonts.bold, fontSize: 16, color: colors.cyan },
  stepUnit: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },

  // Bottone salva in fondo
  saveFullBtn: {
    backgroundColor: colors.cyan,
    borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  saveFullBtnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
});
