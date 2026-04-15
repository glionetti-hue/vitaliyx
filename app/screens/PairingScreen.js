import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { bleService } from '../services/bleService';
import { useDeviceStore } from '../store/deviceStore';
import { notificationService } from '../services/notificationService';

export default function PairingScreen({ navigation }) {
  const { nearbyDevices, isScanning, isConnected } = useDeviceStore();
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    startScan();
    return () => bleService.stopScan();
  }, []);

  async function startScan() {
    const state = await bleService.checkState();
    if (state !== 'PoweredOn') {
      Alert.alert('Bluetooth spento', 'Attiva il Bluetooth per cercare il dispositivo SENSES.');
      return;
    }
    bleService.startScan();
  }

  async function handleConnect(device) {
    setConnecting(device.id);
    try {
      await bleService.connect(device);
      await notificationService.requestPermissions();
      navigation.replace('Main');
    } catch {
      Alert.alert('Connessione fallita', 'Non riesco a connettermi al SENSES. Avvicinati al dispositivo e riprova.');
    } finally {
      setConnecting(null);
    }
  }

  return (
    <View style={styles.root}>

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>📡</Text>
        <Text style={styles.title}>Collega il tuo SENSES</Text>
        <Text style={styles.subtitle}>
          Assicurati che il dispositivo sia sul polso e acceso. Il SENSES si connette via Bluetooth.
        </Text>
      </View>

      {isScanning && (
        <View style={styles.scanRow}>
          <ActivityIndicator color={colors.cyan} size="small" />
          <Text style={styles.scanText}>Ricerca in corso…</Text>
        </View>
      )}

      <FlatList
        data={nearbyDevices}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isScanning ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nessun dispositivo trovato</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={startScan}>
                <Text style={styles.retryText}>Riprova</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deviceCard}
            onPress={() => handleConnect(item)}
            disabled={connecting != null}
          >
            <View style={styles.deviceIcon}>
              <Text style={{ fontSize: 24 }}>⌚</Text>
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{item.name || 'SENSES'}</Text>
              <Text style={styles.deviceId}>{item.id}</Text>
            </View>
            {connecting === item.id
              ? <ActivityIndicator color={colors.cyan} />
              : <Text style={styles.connectArrow}>→</Text>
            }
          </TouchableOpacity>
        )}
      />

      <Text style={styles.hint}>
        Questo dispositivo non usa profili Bluetooth standard:{'\n'}la connessione avviene tramite GATT diretto.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 28,
    marginBottom: 32,
  },
  heroIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.cyan,
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 32,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.cyan,
    borderRadius: 10,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#fff',
  },
  deviceCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.cyan + '22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  deviceId: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  connectArrow: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.cyan,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
});
