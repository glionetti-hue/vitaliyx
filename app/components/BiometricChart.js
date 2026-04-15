import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const SCREEN_W = Dimensions.get('window').width;

export default function BiometricChart({
  data = [],       // [{ x: timestamp_ms, y: value }]
  label,
  unit,
  color,
  type = 'line',   // 'line' | 'area'
  width,
  height = 160,
}) {
  const chartColor = color || colors.cyan;
  const chartWidth = width || SCREEN_W - 48;

  if (!data || data.length < 2) {
    return (
      <View style={[styles.empty, { width: chartWidth, height }]}>
        <Text style={styles.emptyText}>Nessun dato disponibile</Text>
      </View>
    );
  }

  const ChartComponent = type === 'area' ? VictoryArea : VictoryLine;

  // Format x-axis ticks as HH:MM
  const formatTick = (val) => {
    const d = new Date(val);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{label}</Text>
          {unit && <Text style={styles.unitText}>{unit}</Text>}
        </View>
      )}
      <VictoryChart
        width={chartWidth}
        height={height}
        padding={{ top: 10, bottom: 30, left: 36, right: 16 }}
        theme={VictoryTheme.material}
      >
        <VictoryAxis
          tickCount={4}
          tickFormat={formatTick}
          style={{
            axis:     { stroke: colors.border },
            ticks:    { stroke: 'transparent' },
            tickLabels: {
              fill:       colors.textMuted,
              fontSize:   9,
              fontFamily: fonts.regular,
            },
            grid: { stroke: 'transparent' },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickCount={4}
          style={{
            axis:     { stroke: 'transparent' },
            ticks:    { stroke: 'transparent' },
            tickLabels: {
              fill:       colors.textMuted,
              fontSize:   9,
              fontFamily: fonts.regular,
            },
            grid: {
              stroke: colors.border,
              strokeWidth: 0.5,
              strokeDasharray: '4,6',
            },
          }}
        />
        <ChartComponent
          data={data}
          style={{
            data: {
              stroke: chartColor,
              strokeWidth: 2,
              fill: type === 'area' ? chartColor + '33' : 'transparent',
            },
          }}
          interpolation="monotoneX"
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 14,
    marginBottom: 2,
  },
  labelText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.text,
  },
  unitText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  empty: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
