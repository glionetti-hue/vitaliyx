import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// HRV scale per VITRO device: LOW <20, MEDIUM 20-50, GOOD 50-80, EXCELLENT >80
const HRV_LEVELS = [
  { max: 20,  label: 'BASSA',     color: colors.hrvLow      },
  { max: 50,  label: 'MEDIA',     color: colors.hrvNormal   },
  { max: 80,  label: 'BUONA',     color: colors.hrvGood     },
  { max: 9999,label: 'ECCELLENTE',color: colors.hrvExcellent},
];

function getLevel(hrv) {
  return HRV_LEVELS.find(l => hrv < l.max) || HRV_LEVELS[HRV_LEVELS.length - 1];
}

export default function HRVBadge({ hrv, size = 'md', showLabel = true }) {
  const level = getLevel(hrv ?? 0);
  const isSmall = size === 'sm';

  return (
    <View style={[styles.container, isSmall && styles.containerSm]}>
      {/* Arc / ring */}
      <View style={[styles.ring, { borderColor: level.color }, isSmall && styles.ringSm]}>
        <Text style={[styles.value, { color: level.color }, isSmall && styles.valueSm]}>
          {hrv ?? '—'}
        </Text>
        {!isSmall && <Text style={styles.unit}>ms</Text>}
      </View>

      {showLabel && (
        <View style={[styles.badge, { backgroundColor: level.color + '22' }]}>
          <View style={[styles.dot, { backgroundColor: level.color }]} />
          <Text style={[styles.label, { color: level.color }]}>{level.label}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  containerSm: {
    gap: 4,
  },
  ring: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  ringSm: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 30,
  },
  valueSm: {
    fontSize: 16,
    lineHeight: 18,
  },
  unit: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: -2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
});
