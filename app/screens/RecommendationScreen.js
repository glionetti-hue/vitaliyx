import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useBiometricStore } from '../store/biometricStore';
import { apiService } from '../services/apiService';
import PatchCard from '../components/PatchCard';
import { shopifyService } from '../services/shopifyService';
import * as Linking from 'expo-linking';

export default function RecommendationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { heartRate, hrv, spo2, stress, sleep, steps } = useBiometricStore();
  const [aiRec, setAiRec]     = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const DEMO_PRODUCTS = [
    { id: '1', title: 'CALMX',    price: '49.90', subscriptionPrice: '39.90', variantId: '1' },
    { id: '2', title: 'REMX',     price: '49.90', subscriptionPrice: '39.90', variantId: '2' },
    { id: '3', title: 'FLOWX',    price: '54.90', subscriptionPrice: '44.90', variantId: '3' },
    { id: '4', title: 'METABOLX', price: '54.90', subscriptionPrice: '44.90', variantId: '4' },
    { id: '5', title: 'VITALX',   price: '49.90', subscriptionPrice: '39.90', variantId: '5' },
    { id: '6', title: 'DEFENDX',  price: '59.90', subscriptionPrice: '49.90', variantId: '6' },
  ];

  async function loadAll() {
    setLoading(true);
    try {
      const [rec, prods] = await Promise.allSettled([
        apiService.getRecommendation({ hr: heartRate, hrv, spo2, stress, sleep }),
        shopifyService.getProducts(),
      ]);
      if (rec.status === 'fulfilled') setAiRec(rec.value);
      const shopifyProds = prods.status === 'fulfilled' ? prods.value : [];
      setProducts(shopifyProds.length > 0 ? shopifyProds : DEMO_PRODUCTS);
    } catch (_) {
      setProducts(DEMO_PRODUCTS);
    }
    setLoading(false);
  }

  async function handleBuy(product) {
    try {
      const checkout = await shopifyService.createCheckout(product.variantId);
      if (checkout?.webUrl) await Linking.openURL(checkout.webUrl);
    } catch {
      // Fallback: open shop directly
      await Linking.openURL('https://vitaliyx.com/shop');
    }
  }

  // Find product matching recommendation
  const recProduct = aiRec?.patch
    ? products.find(p => p.title?.toUpperCase().includes(aiRec.patch?.toUpperCase()))
    : null;

  const otherProducts = products.filter(p => p !== recProduct);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Patch X</Text>
      <Text style={styles.screenSub}>Raccomandazioni personalizzate basate sui tuoi parametri biometrici</Text>

      {/* Your metrics summary */}
      <View style={styles.metricsRow}>
        {[
          { label: 'HRV', value: hrv, unit: 'ms' },
          { label: 'Stress', value: stress, unit: '/100' },
          { label: 'SpO₂', value: spo2, unit: '%' },
          { label: 'Sonno', value: sleep?.total, unit: 'h' },
        ].map(m => (
          <View key={m.label} style={styles.metricPill}>
            <Text style={styles.metricVal}>{m.value ?? '—'}<Text style={styles.metricUnit}>{m.unit}</Text></Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.cyan} size="large" />
          <Text style={styles.loadingText}>Analisi in corso…</Text>
        </View>
      ) : (
        <>
          {/* AI recommendation */}
          {aiRec && (
            <View style={styles.aiBox}>
              <Text style={styles.aiLabel}>🤖 Intelligenza Artificiale</Text>
              <Text style={styles.aiText}>{aiRec.reason}</Text>
              {aiRec.confidence != null && (
                <Text style={styles.aiConf}>Confidenza: {Math.round(aiRec.confidence * 100)}%</Text>
              )}
            </View>
          )}

          {/* Recommended patch */}
          {recProduct && (
            <>
              <Text style={styles.sectionTitle}>Consigliato per te</Text>
              <PatchCard
                patchName={recProduct.title}
                reason={aiRec?.reason}
                confidence={aiRec?.confidence ? Math.round(aiRec.confidence * 100) : undefined}
                price={recProduct.price}
                subscriptionPrice={recProduct.subscriptionPrice}
                recommended
                onBuy={() => handleBuy(recProduct)}
              />
            </>
          )}

          {/* All other patches */}
          {otherProducts.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tutta la linea Patch X</Text>
              {otherProducts.map(p => (
                <PatchCard
                  key={p.id}
                  patchName={p.title}
                  price={p.price}
                  subscriptionPrice={p.subscriptionPrice}
                  onBuy={() => handleBuy(p)}
                />
              ))}
            </>
          )}

          {/* Fallback if no products */}
          {products.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Shop temporaneamente non disponibile</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20 },
  screenTitle: { fontFamily: fonts.bold, fontSize: 26, color: colors.text, marginBottom: 4 },
  screenSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 20, lineHeight: 18 },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  metricPill: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  metricVal: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  metricUnit: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  metricLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 14 },
  loadingText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  aiBox: {
    backgroundColor: colors.cyan + '12',
    borderWidth: 1,
    borderColor: colors.cyan + '44',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  aiLabel: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.cyan, marginBottom: 6 },
  aiText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  aiConf: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginTop: 6 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, marginBottom: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
});
