import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import Pet, { PetExpression } from '../components/Pet';
import InstructionCard from '../components/InstructionCard';
import { colors } from '../theme/colors';
import { spacing, borderRadius, typography } from '../theme/spacing';

const PET_SIZE = 150;

const MultitouchScreen: React.FC = () => {
  const [expression, setExpression] = useState<PetExpression>('happy');

  // ── Shared values ────────────────────────────────────────────────────────
  // Position — savedX/Y snapshot the resting point between gestures
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX     = useSharedValue(0);
  const savedY     = useSharedValue(0);

  // Scale — saved so each new pinch starts from the last size
  const scale      = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Rotation in radians — same accumulation pattern as scale
  const rotation      = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  // ── Individual gestures ──────────────────────────────────────────────────
  const pan = Gesture.Pan()
    .minDistance(5)
    .onStart(() => {
      runOnJS(setExpression)('dizzy');
    })
    .onChange((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      // Persist position for the next gesture
      savedX.value = translateX.value;
      savedY.value = translateY.value;
      runOnJS(setExpression)('happy');
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      runOnJS(setExpression)('dizzy');
    })
    .onChange((e) => {
      // Multiply saved scale by the live event scale (1.0 = no change)
      const next = savedScale.value * e.scale;
      // Clamp so the pet doesn't vanish or overflow the screen
      scale.value = Math.max(0.4, Math.min(next, 3.5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(setExpression)('happy');
    });

  // Gesture.Rotation gives event.rotation in radians
  const rot = Gesture.Rotation()
    .onStart(() => {
      runOnJS(setExpression)('dizzy');
    })
    .onChange((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(setExpression)('happy');
    });

  // Gesture.Simultaneous lets all three gestures fire at the same time
  const composed = Gesture.Simultaneous(pan, pinch, rot);

  // ── Reset ────────────────────────────────────────────────────────────────
  // Called from the JS thread — assigning withSpring to .value is valid here
  const handleReset = () => {
    setExpression('neutral');

    translateX.value = withSpring(0, { damping: 15, stiffness: 180 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 180 });
    scale.value      = withSpring(1, { damping: 12, stiffness: 150 });
    rotation.value   = withSpring(0, { damping: 15, stiffness: 180 });

    // Reset accumulators immediately so the next gesture starts fresh
    savedX.value        = 0;
    savedY.value        = 0;
    savedScale.value    = 1;
    savedRotation.value = 0;

    setTimeout(() => setExpression('happy'), 400);
  };

  // ── Animated style ───────────────────────────────────────────────────────
  const petStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      // React Native accepts 'rad' and 'deg' — using rad avoids a Math.PI conversion
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.cardRow}>
        <InstructionCard
          text="Pellizca, rota y mueve con 2 dedos"
          emoji="✨"
        />
      </View>

      {/* GestureDetector covers the whole canvas so gestures don't miss the pet */}
      <GestureDetector gesture={composed}>
        <View style={styles.canvas}>
          <Animated.View style={petStyle}>
            <Pet size={PET_SIZE} expression={expression} />
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleReset}
          activeOpacity={0.75}
        >
          <Text style={styles.resetText}>↺  Reiniciar</Text>
        </TouchableOpacity>
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
    paddingBottom: spacing.sm,
  },
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl + 8,
    borderRadius: borderRadius.full,
  },
  resetText: {
    ...typography.label,
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
});

export default MultitouchScreen;
