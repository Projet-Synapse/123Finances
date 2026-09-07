// Powered by OnSpace.AI — réglage numérique sans dépendance : − valeur ＋
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

export function Stepper({ label, value, min, max, step, onChange, format }: StepperProps) {
  const clamp = (next: number) => Math.min(Math.max(Math.round(next), min), max);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          style={styles.button}
          onPress={() => onChange(clamp(value - step))}
          disabled={value <= min}
          accessibilityLabel={`${label} : diminuer`}
        >
          <MaterialIcons
            name="remove"
            size={20}
            color={value <= min ? Colors.textMuted : Colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.value}>{format ? format(value) : String(value)}</Text>
        <Pressable
          style={styles.button}
          onPress={() => onChange(clamp(value + step))}
          disabled={value >= max}
          accessibilityLabel={`${label} : augmenter`}
        >
          <MaterialIcons name="add" size={20} color={value >= max ? Colors.textMuted : Colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  controls: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: Spacing.xs,
  },
  button: {
    alignItems: 'center',
    borderRadius: Radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 44,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    minWidth: 72,
    textAlign: 'center',
  },
});
