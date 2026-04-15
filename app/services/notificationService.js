/**
 * notificationService
 *
 * Le notifiche LOCALI (schedule) funzionano nel development build.
 * In Expo Go SDK 53+ expo-notifications ha rimosso il supporto push remoto
 * e il suo auto-load scatena un warning. Qui rileviamo l'ambiente e usiamo
 * uno stub silenzioso in Expo Go, il servizio reale nel build nativo.
 */

import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Rileva se gira dentro Expo Go
const IS_EXPO_GO =
  Constants.executionEnvironment === 'storeClient' ||
  Constants.appOwnership === 'expo';

const KEY_PERM = 'vitaliyx_notif_permission';

// ─── Stub silenzioso per Expo Go ─────────────────────────────────────────────
const stubService = {
  async requestPermissions()              { return false; },
  async sendAlert()                       {},
  async scheduleStepsReminder()           {},
  async scheduleSleepReminder()           {},
  async checkBiometricAlerts()            {},
  async applyGoalSettings()               {},
  async cancelAll()                       {},
};

// ─── Servizio reale (development build / produzione) ─────────────────────────
function buildRealService() {
  // Import dinamico per evitare che il modulo venga inizializzato in Expo Go
  const Notifications = require('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge:  false,
    }),
  });

  const ID = {
    stepsReminder: 'vitaliyx-steps-daily',
    sleepReminder: 'vitaliyx-sleep-daily',
  };

  return {
    async requestPermissions() {
      try {
        const cached = await AsyncStorage.getItem(KEY_PERM);
        if (cached === 'granted') return true;
        const { status } = await Notifications.requestPermissionsAsync();
        await AsyncStorage.setItem(KEY_PERM, status);
        return status === 'granted';
      } catch { return false; }
    },

    async sendAlert(title, body, data = {}) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: { title, body, data },
          trigger: null,
        });
      } catch {}
    },

    async scheduleStepsReminder(enabled, goalSteps = 8000) {
      try {
        await Notifications.cancelScheduledNotificationAsync(ID.stepsReminder).catch(() => {});
        if (!enabled) return;
        await Notifications.scheduleNotificationAsync({
          identifier: ID.stepsReminder,
          content: {
            title: '🦶 Come stai andando con i passi?',
            body:  `Obiettivo: ${goalSteps.toLocaleString('it-IT')} passi. Fai una passeggiata!`,
          },
          trigger: { hour: 17, minute: 0, repeats: true },
        });
      } catch {}
    },

    async scheduleSleepReminder(enabled) {
      try {
        await Notifications.cancelScheduledNotificationAsync(ID.sleepReminder).catch(() => {});
        if (!enabled) return;
        await Notifications.scheduleNotificationAsync({
          identifier: ID.sleepReminder,
          content: {
            title: '😴 È ora di dormire',
            body:  'Vai a letto adesso per rispettare il tuo obiettivo di sonno.',
          },
          trigger: { hour: 22, minute: 30, repeats: true },
        });
      } catch {}
    },

    async checkBiometricAlerts(liveData, goals) {
      if (!goals) return;
      const {
        hrv = 0, stress = 0, heartRate = 0, spo2 = 0,
        temperature = 0, bloodPressureSys = 0,
        glucose = 0, uricAcid = 0, cholesterol = 0,
      } = liveData;
      const {
        notifHrv,
        hrvTarget = 0, stressLimit = 0, hrMax = 0,
        spo2Min = 0, tempMax = 0, bpSysMax = 0, bpDiaMax = 0,
        glucoseMax = 0, uricAcidMax = 0, cholesterolMax = 0,
      } = goals;

      const alerts = [];

      if (notifHrv && hrv > 0 && hrvTarget > 0 && hrv < hrvTarget)
        alerts.push(['💓 HRV bassa', `HRV ${hrv} ms — sotto la soglia di ${hrvTarget} ms.`]);

      if (notifHrv && stressLimit > 0 && stress > stressLimit)
        alerts.push(['🧠 Stress elevato', `Stress ${stress}/100 — oltre il limite di ${stressLimit}.`]);

      if (hrMax > 0 && heartRate > hrMax)
        alerts.push(['🫀 Frequenza cardiaca alta', `FC ${heartRate} bpm — oltre il massimo di ${hrMax} bpm.`]);

      if (spo2Min > 0 && spo2 > 0 && spo2 < spo2Min)
        alerts.push(['🫧 SpO₂ bassa', `Ossigenazione ${spo2}% — sotto la soglia di ${spo2Min}%.`]);

      if (tempMax > 0 && temperature > tempMax)
        alerts.push(['🌡️ Temperatura elevata', `Temperatura ${temperature}°C — oltre ${tempMax}°C.`]);

      if (bpSysMax > 0 && bloodPressureSys > bpSysMax)
        alerts.push(['🩸 Pressione sistolica alta', `Sistolica ${bloodPressureSys} mmHg — oltre ${bpSysMax} mmHg.`]);

      if (bpDiaMax > 0 && liveData.bloodPressureDia > 0 && liveData.bloodPressureDia > bpDiaMax)
        alerts.push(['🩸 Pressione diastolica alta', `Diastolica ${liveData.bloodPressureDia} mmHg — oltre ${bpDiaMax} mmHg.`]);

      if (glucoseMax > 0 && glucose > glucoseMax)
        alerts.push(['🍬 Glicemia alta', `Glicemia stimata ${glucose} mg/dL — oltre ${glucoseMax} mg/dL.`]);

      if (uricAcidMax > 0 && uricAcid > uricAcidMax)
        alerts.push(['🧪 Acido urico alto', `Acido urico ${uricAcid} μmol/L — oltre la soglia di ${uricAcidMax}.`]);

      if (cholesterolMax > 0 && cholesterol > cholesterolMax)
        alerts.push(['💊 Colesterolo alto', `Colesterolo ${cholesterol} mmol/L — oltre ${cholesterolMax} mmol/L.`]);

      for (const [title, body] of alerts) {
        await this.sendAlert(title, body);
      }
    },

    async applyGoalSettings(goals) {
      const ok = await this.requestPermissions();
      if (!ok) return;
      await Promise.all([
        this.scheduleStepsReminder(goals.notifSteps, goals.steps),
        this.scheduleSleepReminder(goals.notifSleep),
      ]);
    },

    async cancelAll() {
      try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
    },
  };
}

// ─── Esporta lo stub in Expo Go, il servizio reale nel build nativo ───────────
export const notificationService = IS_EXPO_GO ? stubService : buildRealService();
