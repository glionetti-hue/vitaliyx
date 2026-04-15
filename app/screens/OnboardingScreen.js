import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import VitaliyxLogo from '../components/VitaliyxLogo';
import { useAppStore } from '../store/appStore';

const { width: W, height: H } = Dimensions.get('window');

// ─── Illustrazioni SVG per ogni slide ────────────────────────────────────────

function IllustrationHealth() {
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      <Defs>
        <LinearGradient id="hg1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#4444FF" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#9B59B6" stopOpacity="0.1" />
        </LinearGradient>
      </Defs>
      {/* Sfondo cerchio */}
      <Circle cx="110" cy="100" r="90" fill="url(#hg1)" />
      {/* Cuore */}
      <Path
        d="M110 140 C110 140 60 110 60 75 C60 55 75 45 90 45 C100 45 110 55 110 55 C110 55 120 45 130 45 C145 45 160 55 160 75 C160 110 110 140 110 140Z"
        fill="#E74C3C"
        opacity="0.9"
      />
      {/* Battito ECG sopra */}
      <Path
        d="M40 100 L70 100 L80 75 L90 120 L100 85 L110 100 L180 100"
        fill="none"
        stroke="#4444FF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IllustrationMetrics() {
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      <Defs>
        <LinearGradient id="mg1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4444FF" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#4444FF" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>
      {/* Card sfondo */}
      <Rect x="15" y="20" width="190" height="160" rx="20" fill="#0E0068" opacity="0.8" />
      {/* Griglia 2x2 di metriche */}
      {[
        { x: 30,  y: 40,  label: '❤️  72', sub: 'bpm',    color: '#E74C3C' },
        { x: 120, y: 40,  label: '💓  54', sub: 'HRV ms', color: '#2ECC71' },
        { x: 30,  y: 110, label: '🫧  98', sub: 'SpO₂ %', color: '#6B6BFF' },
        { x: 120, y: 110, label: '🧠  34', sub: 'Stress',  color: '#9B59B6' },
      ].map((m, i) => (
        <G key={i}>
          <Rect x={m.x} y={m.y} width="80" height="58" rx="12" fill={m.color} opacity="0.15" />
          <Path d={`M ${m.x+8} ${m.y+44} L ${m.x+72} ${m.y+44}`} stroke={m.color} strokeWidth="2" opacity="0.4" />
          <Path
            d={`M ${m.x+8} ${m.y+40} ${[0,1,2,3,4,5].map(j=>`L ${m.x+8+j*12} ${m.y+40-(Math.sin(j)*8)}`).join(' ')}`}
            fill="none" stroke={m.color} strokeWidth="1.5" opacity="0.7"
          />
        </G>
      ))}
    </Svg>
  );
}

function IllustrationPatch() {
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      <Defs>
        <LinearGradient id="pg1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#2ECC71" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#4444FF" stopOpacity="0.1" />
        </LinearGradient>
      </Defs>
      <Circle cx="110" cy="100" r="88" fill="url(#pg1)" />
      {/* Patch rettangolare con angoli arrotondati */}
      <Rect x="50" y="55" width="120" height="90" rx="18" fill="#2ECC71" opacity="0.2" />
      <Rect x="50" y="55" width="120" height="90" rx="18" fill="none" stroke="#2ECC71" strokeWidth="2" opacity="0.6" />
      {/* Croce medica */}
      <Rect x="97" y="75" width="26" height="50" rx="6" fill="#2ECC71" opacity="0.8" />
      <Rect x="82" y="90" width="56" height="20" rx="6" fill="#2ECC71" opacity="0.8" />
      {/* Badge AI */}
      <Circle cx="160" cy="60" r="22" fill="#4444FF" opacity="0.9" />
      <Path
        d="M153 60 L157 68 L167 55"
        fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function IllustrationDevice() {
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      <Defs>
        <LinearGradient id="dg1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#4444FF" stopOpacity="0.25" />
          <Stop offset="100%" stopColor="#9B59B6" stopOpacity="0.1" />
        </LinearGradient>
      </Defs>
      <Circle cx="110" cy="100" r="88" fill="url(#dg1)" />
      {/* Smartwatch */}
      <Rect x="75" y="40" width="70" height="120" rx="22" fill="#0E0068" opacity="0.9" />
      <Rect x="75" y="40" width="70" height="120" rx="22" fill="none" stroke="#4444FF" strokeWidth="2" opacity="0.8" />
      {/* Schermo */}
      <Rect x="83" y="58" width="54" height="84" rx="10" fill="#020028" />
      {/* ECG sullo schermo */}
      <Path
        d="M87 100 L93 100 L96 88 L100 112 L104 95 L108 100 L133 100"
        fill="none" stroke="#4444FF" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Cinturino */}
      <Rect x="83" y="155" width="54" height="25" rx="8" fill="#4444FF" opacity="0.4" />
      <Rect x="83" y="22"  width="54" height="22" rx="8" fill="#4444FF" opacity="0.4" />
      {/* Onde BLE */}
      {[18, 28, 38].map((r, i) => (
        <Path key={i}
          d={`M ${170-r} ${70-r*0.5} A ${r} ${r} 0 0 1 ${170+r} ${70+r*0.5}`}
          fill="none" stroke="#4444FF" strokeWidth="1.5" opacity={0.6 - i * 0.15}
        />
      ))}
    </Svg>
  );
}

// ─── Slide content ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    key: 'welcome',
    title: 'Benvenuto in Vitaliyx',
    subtitle: 'Il tuo compagno di salute personale, alimentato dall\'intelligenza artificiale.',
    Illustration: IllustrationHealth,
    accent: '#E74C3C',
  },
  {
    key: 'metrics',
    title: 'Parametri in tempo reale',
    subtitle: 'Monitora frequenza cardiaca, HRV, SpO₂, stress, glicemia e molto altro — tutto dal polso.',
    Illustration: IllustrationMetrics,
    accent: '#4444FF',
  },
  {
    key: 'patch',
    title: 'Patch X personalizzate',
    subtitle: 'L\'AI analizza i tuoi dati e consiglia la patch nutrizionale più adatta al tuo stato biologico.',
    Illustration: IllustrationPatch,
    accent: '#2ECC71',
  },
  {
    key: 'device',
    title: 'Connetti il tuo SENSES',
    subtitle: 'Il dispositivo indossabile SENSES rileva i tuoi parametri biometrici 24/7 via Bluetooth.',
    Illustration: IllustrationDevice,
    accent: '#9B59B6',
  },
];

// ─── Dot indicatore ───────────────────────────────────────────────────────────
function Dots({ count, active, accent }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active
              ? [styles.dotActive, { backgroundColor: accent, width: 24 }]
              : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Schermata principale ─────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentSlide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  function goToNext() {
    if (isLast) {
      handleComplete();
    } else {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
      const next = currentIndex + 1;
      setCurrentIndex(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    }
  }

  function goToPrev() {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      flatListRef.current?.scrollToIndex({ index: prev, animated: true });
    }
  }

  // Scrive AsyncStorage + aggiorna lo store → AppNavigator si aggiorna da solo
  async function handleComplete() {
    await completeOnboarding();
  }

  function onScroll(e) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    if (idx !== currentIndex) setCurrentIndex(idx);
  }

  const { Illustration } = currentSlide;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* Logo in alto */}
      <View style={styles.logoBar}>
        <VitaliyxLogo size={26} />
        <TouchableOpacity onPress={handleComplete} style={styles.skipBtn}>
          <Text style={styles.skipText}>Salta</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const Ill = item.Illustration;
          return (
            <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
              {/* Illustrazione */}
              <View style={[styles.illustrationWrap, { backgroundColor: item.accent + '12' }]}>
                <Ill />
              </View>

              {/* Testo */}
              <Text style={[styles.slideTitle, { color: '#fff' }]}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </Animated.View>
          );
        }}
      />

      {/* Footer: dots + bottoni */}
      <View style={styles.footer}>
        <Dots count={SLIDES.length} active={currentIndex} accent={currentSlide.accent} />

        <View style={styles.btnRow}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.prevBtn} onPress={goToPrev}>
              <Text style={styles.prevBtnText}>←</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: currentSlide.accent, flex: currentIndex > 0 ? 1 : undefined }]}
            onPress={goToNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {isLast ? 'Inizia ora  🚀' : 'Avanti'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Indicatore slide */}
        <Text style={styles.slideCounter}>
          {currentIndex + 1} / {SLIDES.length}
        </Text>
      </View>
    </View>
  );
}

// ─── Stili ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Slide
  slide: {
    width: W,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  illustrationWrap: {
    width: 240,
    height: 220,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  slideTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  slideSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 8,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    height: 8,
    borderRadius: 4,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.border,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  prevBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevBtnText: {
    fontSize: 20,
    color: colors.text,
  },
  nextBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  slideCounter: {
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
