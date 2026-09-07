// Powered by OnSpace.AI — carte de budget : limite mensuelle vs dépensé, avec
// barre de progression et alerte de dépassement.
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { formatCents } from '@/services/money';
import type { Budget, Category } from '@/types';

interface BudgetCardProps {
  budget: Budget;
  category?: Category;
  spentCents: number;
  onEdit: () => void;
}

export function BudgetCard({ budget, category, spentCents, onEdit }: BudgetCardProps) {
  const limit = budget.monthlyLimitCents;
  const ratio = limit > 0 ? Math.min(spentCents / limit, 1) : 0;
  const over = spentCents > limit;
  const remaining = limit - spentCents;
  const barColor = over ? Colors.error : (category?.color ?? Colors.primary);

  return (
    <Pressable onPress={onEdit} accessibilityLabel={`Budget ${category?.name ?? ''}`}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: `${category?.color ?? Colors.surfaceMid}22` }]}>
            <MaterialIcons
              name={(category?.icon ?? 'savings') as keyof typeof MaterialIcons.glyphMap}
              size={20}
              color={category?.color ?? Colors.textMuted}
            />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.name}>{category?.name ?? 'Catégorie supprimée'}</Text>
            <Text style={styles.amounts}>
              {formatCents(spentCents)} sur {formatCents(limit)}
            </Text>
          </View>
          <Text style={[styles.remaining, { color: over ? Colors.error : Colors.success }]}>
            {over
              ? `Dépassement de ${formatCents(spentCents - limit)}`
              : `${formatCents(remaining)} restants`}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: barColor }]} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: Radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  textWrap: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  amounts: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  remaining: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    maxWidth: 130,
    textAlign: 'right',
  },
  track: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    borderWidth: 1,
    height: 10,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
    height: '100%',
  },
});
