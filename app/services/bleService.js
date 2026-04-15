import { useDeviceStore } from '../store/deviceStore';
import { useBiometricStore } from '../store/biometricStore';

// react-native-ble-plx richiede build nativo — non disponibile in Expo Go
let BleManager = null;
try {
  BleManager = require('react-native-ble-plx').BleManager;
} catch (_) {}

// VITRO device identifiers (from HBandSDK)
const VITRO_DEVICE_NAME = 'VITRO';
const VITRO_SERVICE_UUID = '14839AC4-7D7E-415C-9A42-167340CF2339';
const VITRO_CHAR_REALTIME  = '8B00ACE7-EB0B-49B0-BE61-1D8F8208557D';
const VITRO_CHAR_HISTORY   = '0734594A-A8E7-4B1A-A6B1-CD5243059A57';
const VITRO_CHAR_ECG       = 'BE781658-5F78-4597-81EF-E30D4DC2F8FA';

let manager = null;

export const bleService = {

  init() {
    if (!BleManager) return null; // Expo Go — BLE non disponibile
    if (!manager) manager = new BleManager();
    return manager;
  },

  async checkState() {
    const m = this.init();
    return await m.state();
  },

  async startScan(onDeviceFound) {
    const m = this.init();
    const { setScanning, setNearbyDevices } = useDeviceStore.getState();
    const found = [];

    setScanning(true);

    m.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) { setScanning(false); return; }
      if (device?.name?.includes(VITRO_DEVICE_NAME)) {
        const exists = found.find(d => d.id === device.id);
        if (!exists) {
          found.push(device);
          setNearbyDevices([...found]);
          onDeviceFound?.(device);
        }
      }
    });

    // stop scan after 10 seconds
    setTimeout(() => this.stopScan(), 10000);
  },

  stopScan() {
    manager?.stopDeviceScan();
    useDeviceStore.getState().setScanning(false);
  },

  async connect(device) {
    const m = this.init();
    const { setDevice, setConnected, setBattery } = useDeviceStore.getState();

    try {
      const connected = await m.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      setDevice(connected);
      setConnected(true);

      // listen for disconnect
      connected.onDisconnected(() => {
        setConnected(false);
      });

      // start reading real-time data
      this.subscribeToRealtime(connected);

      return connected;
    } catch (e) {
      console.error('BLE connect error:', e);
      throw e;
    }
  },

  subscribeToRealtime(device) {
    const { updateLiveData, updateSleep } = useBiometricStore.getState();

    device.monitorCharacteristicForService(
      VITRO_SERVICE_UUID,
      VITRO_CHAR_REALTIME,
      (error, characteristic) => {
        if (error || !characteristic?.value) return;

        try {
          const raw = atob(characteristic.value);
          const data = JSON.parse(raw);

          updateLiveData({
            heartRate:        data.hr        ?? 0,
            hrv:              data.hrv       ?? 0,
            spo2:             data.spo2      ?? 0,
            stress:           data.stress    ?? 0,
            steps:            data.steps     ?? 0,
            temperature:      data.temp      ?? 0,
            bloodPressureSys: data.bpSys     ?? 0,
            bloodPressureDia: data.bpDia     ?? 0,
          });

          if (data.sleep) updateSleep(data.sleep);
        } catch (_) {}
      }
    );
  },

  async readECG(device) {
    try {
      const char = await device.readCharacteristicForService(
        VITRO_SERVICE_UUID,
        VITRO_CHAR_ECG
      );
      const raw = atob(char.value);
      return JSON.parse(raw); // { score, waveform: [], timestamp }
    } catch (e) {
      console.error('ECG read error:', e);
      throw e;
    }
  },

  async disconnect() {
    const { device, disconnect } = useDeviceStore.getState();
    if (device) {
      try { await device.cancelConnection(); } catch (_) {}
    }
    disconnect();
  },
};
