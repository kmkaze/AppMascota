import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

import Pet, { PetExpression } from '../components/Pet';
import InstructionCard from '../components/InstructionCard';
import { colors } from '../theme/colors';
import { spacing, borderRadius, typography } from '../theme/spacing';

const MESSAGES = [
  'Despertando...',
  'Bostezando...',
  'Estirándose...',
  '¡Casi listo!',
];

const SPIN_MS = 1600;
const RING_SIZE = 190; // outer ring diameter
const PET_SIZE  = 130; // pet SVG — stays INSIDE the ring, never rotates

const LoadingScreen: React.FC = () => {
  const [messageIdx, setMessageIdx] = useState(0);
  const [expression, setExpression] = useState<PetExpression>('sleeping');

  // ── Shared values ────────────────────────────────────────────────────────
  // The ring (not the pet) rotates 0° → 360°
  const spinValue    = useSharedValue(0);
  // Progress fill: 0 % → 100 %, reverses (pulsing)
  const progressWidth = useSharedValue(0);

  // ── Mount: start both animations and the text timer ──────────────────────
  useEffect(() => {
    // withRepeat wraps withTiming so the ring loops forever with Easing.linear
    spinValue.value = withRepeat(
      withTiming(360, { duration: SPIN_MS, easing: Easing.linear }),
      -1,    // infinite repetitions
      false, // no reverse — 360° and 0° are visually the same, so the reset is seamless
    );

    // reverse:true → bar fills then empties in a smooth pulse
    progressWidth.value = withRepeat(
      withTiming(100, {
        duration: SPIN_MS * 1.5,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    const interval = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % MESSAGES.length);
    }, SPIN_MS);

    // cancelAnimation stops the UI-thread timer when this screen unmounts
    return () => {
      cancelAnimation(spinValue);
      cancelAnimation(progressWidth);
      clearInterval(interval);
    };
  }, []);

  // ── Swap expression on the last message ──────────────────────────────────
  // The ring keeps spinning; the pet face is upright and always readable
  useEffect(() => {
    setExpression(messageIdx === MESSAGES.length - 1 ? 'happy' : 'sleeping');
  }, [messageIdx]);

  // ── Animated styles (UI thread) ──────────────────────────────────────────
  // Only the ring view rotates — Pet is a sibling, not a child of this view
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.cardRow}>
        <InstructionCard
          text="Espera a que tu mascota despierte"
          emoji="☀️"
        />
      </View>

      <View style={styles.center}>
        {/*
          petContainer uses `position: relative`.
          The spinning ring is `position: absolute` so it orbits the pet
          without affecting its layout — the pet face is NEVER rotated.
        */}
        <View style={styles.petContainer}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <Pet size={PET_SIZE} expression={expression} />
        </View>

        {/* Cycling message — changes every SPIN_MS ms */}
        <Text style={styles.message}>{MESSAGES[messageIdx]}</Text>

        {/* Animated progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, fillStyle]} />
        </View>

        <Text style={styles.hint}>withRepeat + withTiming + Easing.linear</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cardRow: {
    paddingTop: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },

  // Container that holds both the ring and the pet on top of each other
  petContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // The arc that actually spins — absolute so it doesn't displace the pet
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 6,
    // Two visible quadrants create the classic half-arc spinner effect
    borderTopColor: colors.primary,
    borderRightColor: colors.secondary,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },

  message: {
    ...typography.h2,
    color: colors.primary,
    textAlign: 'center',
  },

  progressTrack: {
    width: '100%',
    height: 14,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  hint: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default LoadingScreen;
