import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';

import Pet, { PetExpression } from '../components/Pet';
import InstructionCard from '../components/InstructionCard';
import { colors } from '../theme/colors';
import { spacing, borderRadius, typography } from '../theme/spacing';

// ── Layout constants ──────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_TOTAL_WIDTH = 240;          // width each item occupies in the scroll axis
const ITEM_MARGIN      = 12;           // horizontal padding inside each item slot
const ITEM_WIDTH       = ITEM_TOTAL_WIDTH - ITEM_MARGIN * 2;  // visible card width
const PET_ITEM_SIZE    = 130;
// Padding that places the first and last item in screen-center when scrolled to them
const SIDE_PADDING     = (SCREEN_WIDTH - ITEM_TOTAL_WIDTH) / 2;

// ── Data ─────────────────────────────────────────────────────────────────────
const EXPRESSIONS: Array<{
  key: string;
  expression: PetExpression;
  label: string;
  emoji: string;
}> = [
  { key: 'happy',    expression: 'happy',    label: 'Feliz',    emoji: '😊' },
  { key: 'sad',      expression: 'sad',      label: 'Triste',   emoji: '😢' },
  { key: 'scared',   expression: 'scared',   label: 'Asustado', emoji: '😱' },
  { key: 'dizzy',    expression: 'dizzy',    label: 'Mareado',  emoji: '😵' },
  { key: 'neutral',  expression: 'neutral',  label: 'Normal',   emoji: '😐' },
  { key: 'sleeping', expression: 'sleeping', label: 'Dormido',  emoji: '😴' },
];

// ── Carousel item ─────────────────────────────────────────────────────────────
// Defined outside CarouselScreen so it isn't re-created on every parent render
interface ItemProps {
  item: typeof EXPRESSIONS[0];
  index: number;
  scrollX: SharedValue<number>;
}

const CarouselItem: React.FC<ItemProps> = ({ item, index, scrollX }) => {
  /*
   * inputRange maps the three key scroll positions for this item:
   *   • previous item centered → index-1 * ITEM_TOTAL_WIDTH
   *   • THIS item centered     → index   * ITEM_TOTAL_WIDTH
   *   • next item centered     → index+1 * ITEM_TOTAL_WIDTH
   *
   * This works because SIDE_PADDING is exactly (SCREEN_WIDTH - ITEM_TOTAL_WIDTH)/2,
   * which makes item-i centered on screen when scrollX === i * ITEM_TOTAL_WIDTH.
   */
  const itemStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * ITEM_TOTAL_WIDTH,
      index       * ITEM_TOTAL_WIDTH,
      (index + 1) * ITEM_TOTAL_WIDTH,
    ];

    const scale   = interpolate(scrollX.value, inputRange, [0.72, 1.0,  0.72], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.4,  1.0,  0.4 ], Extrapolation.CLAMP);
    const rotate  = interpolate(scrollX.value, inputRange, [-8,   0,    8   ], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ scale }, { rotate: `${rotate}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.itemSlot, itemStyle]}>
      <View style={styles.itemCard}>
        <Pet size={PET_ITEM_SIZE} expression={item.expression} />
        <Text style={styles.itemLabel}>{item.emoji}  {item.label}</Text>
      </View>
    </Animated.View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
const CarouselScreen: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // scrollX lives on the UI thread — no bridge crossing on every scroll frame
  const scrollX = useSharedValue(0);

  // useAnimatedScrollHandler runs the callback on the UI thread,
  // so each pixel of scroll updates scrollX without touching JS
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.cardRow}>
        <InstructionCard
          text="Desliza para elegir el estado de ánimo"
          emoji="🎠"
        />
      </View>

      {/* Carousel fills the remaining vertical space */}
      <View style={styles.carouselArea}>
        <Animated.ScrollView
          horizontal
          onScroll={scrollHandler}
          scrollEventThrottle={16}        // iOS: fires every 16 ms (~60 fps)
          snapToInterval={ITEM_TOTAL_WIDTH}
          decelerationRate="fast"          // combined with snapToInterval → crisp snap
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
          onMomentumScrollEnd={(e) => {
            // After scroll settles, compute which item is centered
            const idx = Math.round(e.nativeEvent.contentOffset.x / ITEM_TOTAL_WIDTH);
            setActiveIndex(Math.max(0, Math.min(idx, EXPRESSIONS.length - 1)));
          }}
        >
          {EXPRESSIONS.map((item, index) => (
            <CarouselItem
              key={item.key}
              item={item}
              index={index}
              scrollX={scrollX}
            />
          ))}
        </Animated.ScrollView>
      </View>

      {/* Dot indicators — driven by React state, updated after scroll settles */}
      <View style={styles.dots}>
        {EXPRESSIONS.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Name of the currently selected expression */}
      <View style={styles.footer}>
        <Text style={styles.selectedLabel}>
          {EXPRESSIONS[activeIndex].emoji}{'  '}{EXPRESSIONS[activeIndex].label}
        </Text>
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
  carouselArea: {
    flex: 1,
    justifyContent: 'center',
  },

  // Each item occupies ITEM_TOTAL_WIDTH in the horizontal axis
  itemSlot: {
    width: ITEM_TOTAL_WIDTH,
    paddingHorizontal: ITEM_MARGIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCard: {
    width: ITEM_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    // Android shadow
    elevation: 4,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
  },
  itemLabel: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },

  footer: {
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  selectedLabel: {
    ...typography.h2,
    color: colors.primary,
  },
});

export default CarouselScreen;
