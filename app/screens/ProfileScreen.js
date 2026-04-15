import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert,
  ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useAuthStore } from '../store/authStore';
import { useDeviceStore } from '../store/deviceStore';
import { apiService } from '../services/apiService';
import { bleService } from '../services/bleService';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuthStore();
  const { isConnected, batteryLevel, firmwareVersion, disconnect } = useDeviceStore();

  const [editMode, setEditMode] = useState(false);
  const [name, setName]         = useState(user?.name || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [saving, setSaving]     = useState(false);

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await apiService.updateProfile({ name, email });
      updateProfile(updated);
      setEditMode(false);
    } catch {
      Alert.alert('Errore', 'Impossibile salvare il profilo');
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    await bleService.disconnect();
    Alert.alert('Disconnesso', 'Il SENSES è stato disconnesso.');
  }

  async function handleLogout() {
    Alert.alert(
      'Esci', 'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Esci', style: 'destructive', onPress: logout },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {(user?.name?.[0] || 'V').toUpperCase()}
          </Text>
        </View>
        {!editMode ? (
          <>
            <Text style={styles.userName}>{user?.name || 'Utente'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
              <Text style={styles.editBtnText}>Modifica profilo</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.editForm}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setEditMode(false); setName(user?.name || ''); setEmail(user?.email || ''); }}
              >
                <Text style={styles.cancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveText}>Salva</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Device section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dispositivo</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Stato</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : colors.error }]} />
              <Text style={[styles.rowValue, { color: isConnected ? colors.success : colors.error }]}>
                {isConnected ? 'Connesso' : 'Non connesso'}
              </Text>
            </View>
          </View>
          {isConnected && batteryLevel > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Batteria</Text>
              <Text style={styles.rowValue}>{batteryLevel}%</Text>
            </View>
          )}
          {firmwareVersion ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Firmware</Text>
              <Text style={styles.rowValue}>{firmwareVersion}</Text>
            </View>
          ) : null}
          <View style={styles.deviceActions}>
            {isConnected ? (
              <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                <Text style={styles.disconnectText}>Disconnetti SENSES</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.pairBtn}
                onPress={() => navigation.navigate('Pairing')}
              >
                <Text style={styles.pairText}>Connetti dispositivo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* App section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.card}>
          {[
            { label: 'Versione', value: '1.0.0' },
            { label: 'Piano', value: user?.plan || 'Starter' },
          ].map(r => (
            <View key={r.label} style={styles.row}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={styles.rowValue}>{r.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Obiettivi */}
      <TouchableOpacity
        style={styles.goalsBtn}
        onPress={() => navigation.navigate('Goals')}
        activeOpacity={0.75}
      >
        <Text style={styles.goalsBtnText}>🎯  Obiettivi personali</Text>
        <Text style={{ color: colors.cyan, fontSize: 18 }}>→</Text>
      </TouchableOpacity>

      {/* Salute & Fitness */}
      <TouchableOpacity
        style={[styles.goalsBtn, { borderColor: colors.success + '55' }]}
        onPress={() => navigation.navigate('HealthConnect')}
        activeOpacity={0.75}
      >
        <Text style={styles.goalsBtnText}>
          {Platform.OS === 'ios' ? '🍎  Apple Health' : '🏃  Google Health Connect'}
        </Text>
        <Text style={{ color: colors.cyan, fontSize: 18 }}>→</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Esci dall'account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarInitial: { fontFamily: fonts.bold, fontSize: 32, color: '#fff' },
  userName: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  userEmail: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  editBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  editBtnText: { fontFamily: fonts.medium, fontSize: 13, color: colors.cyan },
  editForm: { width: '100%', gap: 10, marginTop: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    backgroundColor: colors.cyan, alignItems: 'center',
  },
  saveText: { fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textMuted, marginBottom: 8, letterSpacing: 0.5 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  rowValue: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  deviceActions: { padding: 12 },
  disconnectBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  disconnectText: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
  pairBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.cyan,
    alignItems: 'center',
  },
  pairText: { fontFamily: fonts.medium, fontSize: 13, color: '#fff' },
  goalsBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: colors.cyan + '55',
    padding: 16, marginBottom: 12,
  },
  goalsBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  logoutBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.error + '88',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.error },
});
