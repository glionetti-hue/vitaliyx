import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Polyline, Line, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';

// Sample ECG-like path points (normalized 0-1 on Y axis, evenly spaced on X)
const BASE_ECG = [
  0.5, 0.5, 0.5, 0.48, 0.52, 0.5,  // flatline
  0.5, 0.42, 0.3, 0.7, 0.1, 0.9,   // QRS complex
  0.5, 0.45, 0.55, 0.5, 0.5,        // T-wave
  0.5, 0.5, 0.5, 0.48, 0.52, 0.5,  // flatline
  0.5, 0.42, 0.3, 0.7, 0.1, 0.9,   // QRS complex
  0.5, 0.45, 0.55, 0.5, 0.5,
];

function buildPoints(waveform, width, height) {
  const data = waveform && waveform.length > 5 ? waveform : BASE_ECG;
  const step = width / (data.length - 1);
  return data
    .map((v, i) => `${(i * step).toFixed(1)},${(v * height).toFixed(1)}`)
    .join(' ');
}

export default function ECGWaveform({
  waveform,
  width = 300,
  height = 80,
  color,
  animated = true,
}) {
  const strokeColor = color || colors.ecgGreen;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [animated]);

  const points = buildPoints(waveform, width, height);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0"   stopColor={strokeColor} stopOpacity="0" />
            <Stop offset="0.3" stopColor={strokeColor} stopOpacity="1" />
            <Stop offset="0.7" stopColor={strokeColor} stopOpacity="1" />
            <Stop offset="1"   stopColor={strokeColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(v => (
          <Line
            key={v}
            x1="0" y1={v * height}
            x2={width} y2={v * height}
            stroke={colors.border}
            strokeWidth="0.5"
            strokeDasharray="4,6"
          />
        ))}

        {/* Waveform */}
        <Polyline
          points={points}
          fill="none"
          stroke="url(#ecgGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
