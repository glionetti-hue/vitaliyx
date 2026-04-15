import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { apiService } from '../services/apiService';
import { useAuthStore } from '../store/authStore';
import VitaliyxLogo from '../components/VitaliyxLogo';

export default function LoginScreen({ navigation }) {
  const [tab, setTab]           = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);

  const { setToken, setUser } = useAuthStore();

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Errore', 'Inserisci email e password'); return; }
    setLoading(true);
    try {
      const res = await apiService.login(email.trim(), password);
      setToken(res.token);
      setUser(res.user);
    } catch (e) {
      Alert.alert('Accesso fallito', e?.response?.data?.message || 'Controlla le credenziali');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!email || !password || !name) { Alert.alert('Errore', 'Compila tutti i campi'); return; }
    setLoading(true);
    try {
      const res = await apiService.register({ name, email: email.trim(), password });
      setToken(res.token);
      setUser(res.user);
    } catch (e) {
      Alert.alert('Registrazione fallita', e?.response?.data?.message || 'Riprova');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoArea}>
          <VitaliyxLogo size={42} centered />
          <Text style={styles.logoSub}>Il tuo compagno di salute AI</Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          {['login', 'register'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'login' ? 'Accedi' : 'Registrati'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {tab === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={tab === 'login' ? handleLogin : handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>
                  {tab === 'login' ? 'Accedi' : 'Crea account'}
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => {
              setToken('demo-token-vitaliyx');
              setUser({ id: '1', name: 'Giovanni', email: 'demo@vitaliyx.com' });
            }}
            activeOpacity={0.75}
          >
            <Text style={styles.demoBtnText}>⚡ Accesso Demo (senza server)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Accedendo accetti i{' '}
          <Text style={styles.link}>Termini di Servizio</Text>
          {' '}e la{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoMark: {
    fontSize: 52,
    color: colors.cyan,
    lineHeight: 60,
  },
  logoName: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
    letterSpacing: 4,
    marginTop: 4,
  },
  logoSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.cyan,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#fff',
  },
  form: {
    gap: 12,
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.cyan,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  footer: {
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  link: {
    color: colors.cyan,
  },
  demoBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  demoBtnText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
