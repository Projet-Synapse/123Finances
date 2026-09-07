// Powered by OnSpace.AI
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Typography } from '@/constants/theme';

interface ChipProps {
  label: string;
  color?: string;
  icon?: string;
}

export function Chip({ label, color }: ChipProps) {
  return (
    <View style={[styles.chip, color ? { backgroundColor: `${color}22`, borderColor: `${color}55` } : null]}>
      <Text style={[styles.label, color ? { color } : null]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
});
