import { create } from 'zustand';

export const useDeviceStore = create((set) => ({
  device:          null,   // paired BLE device object
  isConnected:     false,
  isScanning:      false,
  batteryLevel:    0,
  firmwareVersion: '',
  nearbyDevices:   [],

  setDevice:       (device)    => set({ device, isConnected: !!device }),
  setConnected:    (v)         => set({ isConnected: v }),
  setScanning:     (v)         => set({ isScanning: v }),
  setBattery:      (level)     => set({ batteryLevel: level }),
  setFirmware:     (ver)       => set({ firmwareVersion: ver }),
  setNearbyDevices:(devices)   => set({ nearbyDevices: devices }),
  disconnect:      ()          => set({ device: null, isConnected: false, batteryLevel: 0 }),
}));
