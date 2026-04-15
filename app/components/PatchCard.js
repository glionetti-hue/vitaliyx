import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const PATCH_META = {
  CALMX:   { color: colors.patchCalm,    emoji: '🧘', tagline: 'Stress & Cortisolo' },
  REMX:    { color: colors.patchRem,     emoji: '🌙', tagline: 'Sonno Profondo'      },
  FLOWX:   { color: colors.patchFlow,    emoji: '⚡', tagline: 'Performance & Focus' },
  METABOLX:{ color: colors.patchMetabol, emoji: '🔥', tagline: 'Metabolismo'         },
  VITALX:  { color: colors.patchVital,   emoji: '💧', tagline: 'Vitalità Generale'   },
};

export default function PatchCard({
  patchName,
  reason,
  confidence,
  price,
  subscriptionPrice,
  image,
  onBuy,
  recommended = false,
}) {
  const meta = PATCH_META[patchName?.toUpperCase()] || { color: colors.cyan, emoji: '🩹', tagline: '' };

  return (
    <View style={[styles.card, { borderColor: meta.color + (recommended ? 'cc' : '33') }]}>
      {recommended && (
        <View style={[styles.recBanner, { backgroundColor: meta.color }]}>
          <Text style={styles.recText}>✦ RACCOMANDATO PER TE</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={[styles.emojiBox, { backgroundColor: meta.color + '22' }]}>
          <Text style={styles.emoji}>{meta.emoji}</Text>
        </View>
        <View style={styles.titleGroup}>
          <Text style={[styles.patchName, { color: meta.color }]}>{patchName}</Text>
          <Text style={styles.tagline}>{meta.tagline}</Text>
        </View>
        {confidence != null && (
          <View style={[styles.confBadge, { backgroundColor: meta.color + '22' }]}>
            <Text style={[styles.confText, { color: meta.color }]}>{confidence}%</Text>
          </View>
        )}
      </View>

      {reason ? (
        <Text style={styles.reason}>{reason}</Text>
      ) : null}

      <View style={styles.priceRow}>
        {price != null && (
          <Text style={styles.price}>€{parseFloat(price).toFixed(2)}</Text>
        )}
        {subscriptionPrice != null && (
          <Text style={styles.subPrice}>€{parseFloat(subscriptionPrice).toFixed(2)}/mese abbonamento</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.buyBtn, { backgroundColor: meta.color }]}
        onPress={onBuy}
        activeOpacity={0.8}
      >
        <Text style={styles.buyText}>Acquista ora →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  recBanner: {
    paddingVertical: 5,
    alignItems: 'center',
  },
  recText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#fff',
    letterSpacing: 1.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingBottom: 8,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  titleGroup: {
    flex: 1,
  },
  patchName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  confBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  confText: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  reason: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginHorizontal: 14,
    marginBottom: 10,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 12,
  },
  price: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  subPrice: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  buyBtn: {
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#fff',
  },
});
