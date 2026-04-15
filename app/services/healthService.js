/**
 * healthService — integrazione Google Health Connect (Android).
 * Usa react-native-health-connect nel build nativo.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_ENABLED = 'vitaliyx_health_enabled';

// Rileva se il modulo nativo è disponibile (non disponibile in Expo Go)
let HealthConnect = null;
try { HealthConnect = require('react-native-health-connect'); } catch {}

const HAS_NATIVE = Platform.OS === 'android' && HealthConnect !== null;

const PERMISSIONS = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'HeartRateVariabilitySdnn' },
  { accessType: 'read', recordType: 'OxygenSaturation' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'BloodGlucose' },
  { accessType: 'read', recordType: 'BloodPressure' },
  { accessType: 'read', recordType: 'BodyTemperature' },
  { accessType: 'read', recordType: 'Weight' },
  { accessType: 'read', recordType: 'BodyFat' },
];

export const healthService = {
  isAvailable: HAS_NATIVE,

  async isConnected() {
    const v = await AsyncStorage.getItem(KEY_ENABLED);
    return v === 'true';
  },

  async connect() {
    if (!HAS_NATIVE) {
      return {
        success: false,
        message: 'Google Health Connect richiede il build nativo EAS. In Expo Go è disponibile solo l\'anteprima dell\'interfaccia.',
      };
    }
    try {
      const { initialize, requestPermission, getSdkStatus, SdkAvailabilityStatus } = HealthConnect;

      // Controlla che Health Connect sia installato sul dispositivo
      const status = await getSdkStatus();
      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        return {
          success: false,
          message: 'Google Health Connect non è installato. Installalo dal Play Store e riprova.',
        };
      }

      await initialize();
      const granted = await requestPermission(PERMISSIONS);

      if (granted && granted.length > 0) {
        await AsyncStorage.setItem(KEY_ENABLED, 'true');
        return { success: true, message: 'Connesso con successo!' };
      }
      return { success: false, message: 'Permesso negato. Abilita i permessi nelle impostazioni.' };
    } catch (e) {
      return { success: false, message: 'Errore durante la connessione: ' + e.message };
    }
  },

  async disconnect() {
    await AsyncStorage.removeItem(KEY_ENABLED);
  },

  async fetchTodayData() {
    const connected = await this.isConnected();
    if (!connected || !HAS_NATIVE) return null;

    try {
      const { readRecords } = HealthConnect;
      const startTime = new Date(); startTime.setHours(0, 0, 0, 0);
      const endTime   = new Date();
      const timeRange = {
        operator: 'between',
        startTime: startTime.toISOString(),
        endTime:   endTime.toISOString(),
      };

      const [stepsRes, hrRes, hrvRes, spo2Res, bpRes, tempRes, glucoseRes] =
        await Promise.allSettled([
          readRecords('Steps',                    { timeRangeFilter: timeRange }),
          readRecords('HeartRate',                { timeRangeFilter: timeRange }),
          readRecords('HeartRateVariabilitySdnn', { timeRangeFilter: timeRange }),
          readRecords('OxygenSaturation',         { timeRangeFilter: timeRange }),
          readRecords('BloodPressure',            { timeRangeFilter: timeRange }),
          readRecords('BodyTemperature',          { timeRangeFilter: timeRange }),
          readRecords('BloodGlucose',             { timeRangeFilter: timeRange }),
        ]);

      const mapped = {};

      // Passi — somma totale del giorno
      if (stepsRes.status === 'fulfilled' && stepsRes.value?.length > 0) {
        mapped.steps = stepsRes.value.reduce((s, r) => s + (r.count ?? 0), 0);
      }

      // Frequenza cardiaca — ultima lettura
      if (hrRes.status === 'fulfilled' && hrRes.value?.length > 0) {
        const last = hrRes.value[hrRes.value.length - 1];
        mapped.heartRate = Math.round(last.samples?.[0]?.beatsPerMinute ?? last.beatsPerMinute ?? 0);
      }

      // HRV — ultima lettura
      if (hrvRes.status === 'fulfilled' && hrvRes.value?.length > 0) {
        const last = hrvRes.value[hrvRes.value.length - 1];
        mapped.hrv = Math.round(last.heartRateVariabilityMillis ?? 0);
      }

      // SpO₂ — ultima lettura
      if (spo2Res.status === 'fulfilled' && spo2Res.value?.length > 0) {
        const last = spo2Res.value[spo2Res.value.length - 1];
        mapped.spo2 = Math.round((last.percentage?.value ?? last.percentage ?? 0));
      }

      // Pressione — ultima lettura
      if (bpRes.status === 'fulfilled' && bpRes.value?.length > 0) {
        const last = bpRes.value[bpRes.value.length - 1];
        mapped.bloodPressureSys = Math.round(last.systolic?.inMillimetersOfMercury ?? 0);
        mapped.bloodPressureDia = Math.round(last.diastolic?.inMillimetersOfMercury ?? 0);
      }

      // Temperatura — ultima lettura
      if (tempRes.status === 'fulfilled' && tempRes.value?.length > 0) {
        const last = tempRes.value[tempRes.value.length - 1];
        mapped.temperature = +(last.temperature?.inCelsius ?? 0).toFixed(1);
      }

      // Glicemia — ultima lettura
      if (glucoseRes.status === 'fulfilled' && glucoseRes.value?.length > 0) {
        const last = glucoseRes.value[glucoseRes.value.length - 1];
        // Health Connect usa mmol/L, convertiamo in mg/dL
        const mmol = last.level?.inMillimolesPerLiter ?? 0;
        mapped.glucose = mmol > 0 ? Math.round(mmol * 18.016) : 0;
      }

      return Object.keys(mapped).length > 0 ? mapped : null;
    } catch {
      return null;
    }
  },
};
