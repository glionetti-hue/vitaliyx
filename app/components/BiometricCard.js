import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function BiometricCard({
  label,
  value,
  unit,
  icon,
  sublabel,
  color,
  onPress,
  alert = false,
  barValue,      // 0-100 for progress bar
  barMax = 100,
  time,
}) {
  const accentColor = color || colors.cyan;
  const barPercent = barValue != null ? Math.min(100, Math.max(0, (barValue / barMax) * 100)) : null;

  return (
    <TouchableOpacity
      style={[styles.card, alert && styles.cardAlert]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* Top row: label + icon */}
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.iconBadge, { backgroundColor: accentColor + '25' }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
      </View>

      {/* Main value */}
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accentColor }]}>
          {value ?? '—'}
        </Text>
        {unit ? <Text style={[styles.unit, { color: accentColor + 'AA' }]}>{unit}</Text> : null}
      </View>

      {/* Progress bar */}
      {barPercent != null && (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${barPercent}%`, backgroundColor: accentColor }]} />
        </View>
      )}

      {/* Bottom: status / time */}
      {(sublabel || time) && (
        <View style={styles.bottomRow}>
          {sublabel ? (
            <Text style={[styles.sublabel, alert && { color: colors.error }]}>
              {alert ? '● ' : ''}{sublabel}
            </Text>
          ) : null}
          {time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardAlert: {
    borderColor: colors.error + '99',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    flexWrap: 'wrap',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  iconText: {
    fontSize: 20,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 36,
  },
  unit: {
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: 2,
  },
  barTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  sublabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
  },
});
