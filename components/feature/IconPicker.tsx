// Powered by OnSpace.AI — palette d'icônes élargie : un jeu varié, présent
// dans MaterialIcons sur toutes les plateformes cibles.
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

/** Icônes disponibles pour modes, docks et raccourcis. */
export const ICON_CHOICES = [
  'nightlight',
  'work',
  'sports-esports',
  'menu-book',
  'eco',
  'movie',
  'music-note',
  'flight',
  'directions-car',
  'fitness-center',
  'brush',
  'code',
  'school',
  'home',
  'public',
  'folder',
  'terminal',
  'edit-note',
  'mail',
  'chat',
  'calendar-month',
  'photo-camera',
  'videogame-asset',
  'calculate',
  'settings',
  'bolt',
  'auto-awesome',
  'schedule',
  'hourglass-top',
  'grid-view',
  'monitor',
  'smartphone',
  'storage',
  'cloud',
  'favorite',
  'star',
  'bookmark',
  'shopping-cart',
  'restaurant',
  'map',
] as const;

interface IconPickerProps {
  label: string;
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ label, value, onChange }: IconPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {ICON_CHOICES.map((name) => {
          const selected = name === value;
          return (
            <Pressable
              key={name}
              onPress={() => onChange(name)}
              style={[styles.icon, selected && styles.iconSelected]}
              accessibilityLabel={`Icône ${name}`}
              accessibilityState={{ selected }}
            >
              <MaterialIcons
                name={name}
                size={22}
                color={selected ? Colors.textInverse : Colors.textSecondary}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
});
