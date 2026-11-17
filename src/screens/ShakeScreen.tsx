import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Accelerometer } from 'expo-sensors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withRepeat,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import Pet, { PetExpression } from '../components/Pet';
import InstructionCard from '../components/InstructionCard';
import { colors } from '../theme/colors';
import { spacing, borderRadius, typography } from '../theme/spacing';

const SHAKE_THRESHOLD = 1.8; // g-force above which a shake is detected
const COOLDOWN_MS     = 650; // ignore new shakes while animation plays

const ShakeScreen: React.FC = () => {
  const [expression,  setExpression]  = useState<PetExpression>('neutral');
  const [shakeCount,  setShakeCount]  = useState(0);
  const [shaken,      setShaken]      = useState(false);

  // Prevents re-triggering while the shake animation is running
  const isCooling = useRef(false);

  // ── Shared values ────────────────────────────────────────────────────────
  const shakeX     = useSharedValue(0);  // horizontal shake offset
  const popScale   = useSharedValue(1);  // brief scale-up on impact
  const magnitudeSV = useSharedValue(0); // live accelerometer magnitude

  // ── Shake trigger — called from both button and accelerometer ────────────
  const triggerShake = useCallback(() => {
    if (isCooling.current) return;
    isCooling.current = true;

    setExpression('scared');
    setShakeCount(c => c + 1);
    setShaken(true);

    // Scale: pop up then settle (withSequence chains two springs)
    popScale.value = withSequence(
      withSpring(1.18, { damping: 8,  stiffness: 400 }),
      withSpring(1,    { damping: 14, stiffness: 300 }),
    );

    // Horizontal shake: left → (right/left × 4) → center
    // withRepeat wraps a withSequence of two withTimings for the oscillation
    shakeX.value = withSequence(
      withTiming(-20, { duration: 45 }),
      withRepeat(
        withSequence(
          withTiming( 20, { duration: 45 }),
          withTiming(-20, { duration: 45 }),
        ),
        4,     // 4 full oscillations
        false, // no reverse — each pass runs the same withSequence
      ),
      withTiming(0, { duration: 45 }),
    );
    // Total duration: 45 + 4*(45+45) + 45 = 450 ms

    setTimeout(() => {
      setExpression('neutral');
      setShaken(false);
      isCooling.current = false;
    }, COOLDOWN_MS);
  }, []); // empty deps — all used values are stable refs / setters / SharedValues

  // ── Accelerometer subscription ───────────────────────────────────────────
  useEffect(() => {
    Accelerometer.setUpdateInterval(80); // ~12 Hz — enough to catch a shake

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      // Update the live magnitude bar (assigned from JS thread → runs on UI thread)
      magnitudeSV.value = mag;

      if (mag > SHAKE_THRESHOLD) {
        triggerShake();
      }
    });

    // cancelAnimation / remove subscription when screen unmounts
    return () => subscription.remove();
  }, [triggerShake]);

  // ── Animated styles ──────────────────────────────────────────────────────
  const petStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { scale: popScale.value },
    ],
  }));

  // Live force bar: width goes from ~33% (rest ≈ 1g) to 100% (at threshold ≈ 1.8g)
  const barStyle = useAnimatedStyle(() => {
    const pct = Math.min((magnitudeSV.value / (SHAKE_THRESHOLD * 1.2)) * 100, 100);
    return {
      width: `${pct}%`,
      backgroundColor:
        magnitudeSV.value > SHAKE_THRESHOLD ? colors.error : colors.primary,
    };
  });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.cardRow}>
        <InstructionCard
          text="Agita el teléfono fuertemente"
          emoji="📱"
        />
      </View>

      <View style={styles.canvas}>
        {/* Pet with horizontal shake + pop-scale */}
        <Animated.View style={petStyle}>
          <Pet size={170} expression={expression} />
        </Animated.View>

        {/* Status text */}
        <Text style={[styles.status, shaken && styles.statusActive]}>
          {shaken ? '😱  ¡SACUDIDA!' : '🕐  Esperando sacudida...'}
        </Text>

        {/* Live accelerometer magnitude bar */}
        <View style={styles.barSection}>
          <Text style={styles.barLabel}>Fuerza del movimiento</Text>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, barStyle]} />
            {/* Threshold marker */}
            <View style={styles.thresholdMark} />
          </View>
          <View style={styles.barLegend}>
            <Text style={styles.barLegendText}>0</Text>
            <Text style={[styles.barLegendText, { color: colors.error }]}>
              umbral {SHAKE_THRESHOLD}g
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {shakeCount > 0 && (
          <Text style={styles.counter}>Sacudidas: {shakeCount} 📳</Text>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={triggerShake}
          activeOpacity={0.75}
        >
          <Text style={styles.btnText}>📳  Simular shake</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cardRow: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },

  status: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
  },
  statusActive: {
    ...typography.h3,
    color: colors.error,
  },

  // Live force bar
  barSection: {
    width: '100%',
    gap: spacing.xs,
  },
  barLabel: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
  barTrack: {
    width: '100%',
    height: 12,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  // Visual marker at the threshold position (83% = 1.8 / 2.16 * 100)
  thresholdMark: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    left: `${(SHAKE_THRESHOLD / (SHAKE_THRESHOLD * 1.2)) * 100}%`,
    backgroundColor: colors.error,
  },
  barLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLegendText: {
    ...typography.caption,
    color: colors.textLight,
  },

  footer: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  counter: {
    ...typography.label,
    color: colors.textLight,
  },
  btn: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl + 8,
    borderRadius: borderRadius.full,
  },
  btnText: {
    ...typography.label,
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
});

export default ShakeScreen;
