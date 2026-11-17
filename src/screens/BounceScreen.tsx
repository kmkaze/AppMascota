import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';

import Pet, { PetExpression } from '../components/Pet';
import InstructionCard from '../components/InstructionCard';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/spacing';

const PET_SIZE = 170;

const BounceScreen: React.FC = () => {
  const [expression, setExpression] = useState<PetExpression>('neutral');
  const [caresses, setCaresses]     = useState(0);

  // ── Shared values ────────────────────────────────────────────────────────
  // Pet scale — compresses on press, bounces back on release
  const scale = useSharedValue(1);

  // Floating heart — opacity, vertical position, and pop-in scale
  const heartOpacity = useSharedValue(0);
  const heartY       = useSharedValue(0);
  const heartScale   = useSharedValue(0.5);

  // ── Press handlers (JS thread — no runOnJS needed) ───────────────────────
  const handlePressIn = () => {
    // High damping → reaches target quickly without oscillating (feels like a press)
    scale.value = withSpring(0.82, { damping: 25, stiffness: 500 });
    setExpression('scared');
  };

  const handlePressOut = () => {
    // LOW damping → pet overshoots and bounces several times before settling
    scale.value = withSpring(1, { damping: 4, stiffness: 200 });
    setExpression('happy');
    setCaresses(c => c + 1);

    // Reset heart to initial state before starting a new animation
    cancelAnimation(heartY);
    cancelAnimation(heartOpacity);
    cancelAnimation(heartScale);

    heartY.value = 0;

    // Pop-in: overshoot to 1.4× then settle at 1× (spring gives organic feel)
    heartScale.value = withSequence(
      withSpring(1.4, { damping: 8,  stiffness: 300 }),
      withSpring(1,   { damping: 15, stiffness: 300 }),
    );

    // Appear instantly, hold, then fade out after 400 ms
    heartOpacity.value = withSequence(
      withTiming(1,  { duration: 100 }),
      withDelay(400, withTiming(0, { duration: 400 })),
    );

    // Float upward over the whole animation lifetime
    heartY.value = withTiming(-90, { duration: 900 });
  };

  // ── Animated styles (UI thread) ──────────────────────────────────────────
  const petStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [
      { translateY: heartY.value },
      { scale: heartScale.value },
    ],
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.cardRow}>
        <InstructionCard
          text="Presiona a tu mascota para acariciarla"
          emoji="💖"
        />
      </View>

      <View style={styles.canvas}>
        {/*
          The heart sits above the pet in the flex column.
          It starts invisible (opacity 0) so the layout gap is barely noticeable.
          withSequence makes it pop in and float upward on each press.
        */}
        <Animated.Text style={[styles.heart, heartStyle]}>💗</Animated.Text>

        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Animated.View style={petStyle}>
            <Pet size={PET_SIZE} expression={expression} />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.counter}>
          {caresses === 0 ? '¡Tócame! 🐾' : `Caricias: ${caresses} 💕`}
        </Text>
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
  heart: {
    fontSize: 44,
  },
  footer: {
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  counter: {
    ...typography.h3,
    color: colors.primary,
  },
});

export default BounceScreen;
