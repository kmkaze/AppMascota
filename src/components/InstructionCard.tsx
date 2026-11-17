import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius, typography } from '../theme/spacing';

interface InstructionCardProps {
  text: string;
  emoji?: string;
}

const InstructionCard: React.FC<InstructionCardProps> = ({
  text,
  emoji = '💡',
}) => (
  <View style={styles.container}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  text: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
});

export default InstructionCard;
