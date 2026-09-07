// Powered by OnSpace.AI — sélecteur de mois : ← Septembre 2026 →
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Typography } from '@/constants/theme';
import { monthLabel } from '@/types';

interface MonthSwitcherProps {
  monthKey: string;
  onChange: (key: string) => void;
  /** Empêche d'aller dans le futur (mois courant par défaut). */
  maxToday?: boolean;
}

export function MonthSwitcher({ monthKey: key, onChange, maxToday = true }: MonthSwitcherProps) {
  const [year, month] = key.split('-').map(Number);

  const shift = (delta: number) => {
    const date = new Date(year, month - 1 + delta, 1);
    const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    if (maxToday && next > current) return;
    onChange(next);
  };

  const nowKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const canGoForward = !maxToday || key < nowKey;

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => shift(-1)} style={styles.button} accessibilityLabel="Mois précédent">
        <MaterialIcons name="chevron-left" size={22} color={Colors.textSecondary} />
      </Pressable>
      <Text style={styles.label}>{monthLabel(key)}</Text>
      <Pressable
        onPress={() => canGoForward && shift(1)}
        style={styles.button}
        disabled={!canGoForward}
        accessibilityLabel="Mois suivant"
      >
        <MaterialIcons
          name="chevron-right"
          size={22}
          color={canGoForward ? Colors.textSecondary : Colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    textTransform: 'capitalize',
  },
});
