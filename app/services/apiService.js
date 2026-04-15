import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.vitaliyx.com/v1';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('vitaliyx_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiService = {

  // Auth
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data; // { token, user }
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/user/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/user/profile', data);
    return res.data;
  },

  // Biometrics sync
  async syncBiometrics(payload) {
    // payload: { userId, timestamp, hr, hrv, spo2, stress, steps, sleep, temperature, bloodPressure }
    const res = await api.post('/biometrics', payload);
    return res.data;
  },

  async getBiometricHistory(type, days = 7) {
    const res = await api.get(`/biometrics/history`, { params: { type, days } });
    return res.data;
  },

  // ECG
  async saveEcgRecord(record) {
    const res = await api.post('/ecg', record);
    return res.data;
  },

  async getEcgHistory() {
    const res = await api.get('/ecg');
    return res.data;
  },

  // Patch recommendations
  async getRecommendation(biometrics) {
    const res = await api.post('/ai/recommend', biometrics);
    return res.data; // { patch, reason, confidence }
  },
};
