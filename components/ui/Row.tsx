// Powered by OnSpace.AI — ligne de liste standard : icône, titres, action.
import { MaterialIcons } from '@expo/vector-icons';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface RowProps extends PropsWithChildren {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: string;
}

export function Row({ icon, iconColor, title, subtitle, onPress, right, children }: RowProps) {
  const content = (
    <View style={styles.row}>
      <View style={[styles.iconWrap, iconColor ? { backgroundColor: `${iconColor}22` } : null]}>
        <MaterialIcons
          name={icon as keyof typeof MaterialIcons.glyphMap}
          size={20}
          color={iconColor ?? Colors.primary}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
      {right ? <Text style={styles.right}>{right}</Text> : null}
    </View>
  );

  if (!onPress) return <View style={styles.container}>{content}</View>;
  return (
    <Pressable style={({ pressed }) => [styles.container, pressed && styles.pressed]} onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderRadius: Radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  right: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
