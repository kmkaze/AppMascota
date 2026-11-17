import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';

import Pet, { PetExpression } from '../components/Pet';
import InstructionCard from '../components/InstructionCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const PET_SIZE = 150;

const DragRotateScreen: React.FC = () => {
  // Expression lives on the JS thread (drives Pet SVG re-render)
  const [expression, setExpression] = useState<PetExpression>('happy');

  // ── Shared values (UI thread) ────────────────────────────────────────────
  // Accumulated position: each drag adds to the previous resting point
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Snapshot taken at the START of each new gesture to allow accumulation
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  // Rotation derived from horizontal drag delta
  const rotation = useSharedValue(0);
  // Slight scale-up while dragging ("lift" feedback)
  const scale = useSharedValue(1);

  // ── Gesture ──────────────────────────────────────────────────────────────
  const pan = Gesture.Pan()
    .minDistance(5) // ignore tiny taps, avoid conflicting with drawer swipe
    .onStart(() => {
      // runOnJS bridges UI-thread worklet → JS thread for React setState
      runOnJS(setExpression)('neutral');
      scale.value = withSpring(1.1, { damping: 20, stiffness: 300 });
    })
    .onChange((event) => {
      // Position = last resting point + current gesture delta
      translateX.value = savedX.value + event.translationX;
      translateY.value = savedY.value + event.translationY;

      // Rotation: drag 160 px right → +30°, 160 px left → −30°
      // Extrapolation.CLAMP prevents going beyond the range
      rotation.value = interpolate(
        event.translationX,
        [-160, 0, 160],
        [-30, 0, 30],
        Extrapolation.CLAMP,
      );
    })
    .onEnd(() => {
      // Persist final position so the next gesture accumulates correctly
      savedX.value = translateX.value;
      savedY.value = translateY.value;

      // withSpring snaps rotation back to 0° — damping=18 gives one gentle overshoot
      rotation.value = withSpring(0, { damping: 18, stiffness: 200 });
      scale.value = withSpring(1, { damping: 18, stiffness: 250 });

      runOnJS(setExpression)('happy');
    });

  // ── Animated style (UI thread) ───────────────────────────────────────────
  // useAnimatedStyle never calls setState — it only reads .value
  const petStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Fixed instruction card at the top */}
      <View style={styles.cardRow}>
        <InstructionCard
          text="Arrastra a tu mascota por la pantalla"
          emoji="🐾"
        />
      </View>

      {/* Drag canvas — GestureDetector covers the whole area */}
      <GestureDetector gesture={pan}>
        <View style={styles.canvas}>
          {/* Pet starts centered; transforms move it from that origin */}
          <Animated.View style={petStyle}>
            <Pet size={PET_SIZE} expression={expression} />
          </Animated.View>
        </View>
      </GestureDetector>
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
});

export default DragRotateScreen;
