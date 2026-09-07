// Powered by OnSpace.AI — ligne de transaction : catégorie, note, montant signé.
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { formatSignedCents } from '@/services/money';
import type { Category, Transaction } from '@/types';

interface TransactionRowProps {
  transaction: Transaction;
  category?: Category;
  /** Affiche la date en sous-titre (listes non groupées par jour). */
  showDate?: boolean;
  onPress?: () => void;
}

export function TransactionRow({ transaction, category, showDate, onPress }: TransactionRowProps) {
  const income = transaction.type === 'income';
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityLabel={`Transaction : ${category?.name ?? 'Sans catégorie'}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${category?.color ?? Colors.surfaceMid}22` }]}>
        <MaterialIcons
          name={(category?.icon ?? 'help-outline') as keyof typeof MaterialIcons.glyphMap}
          size={20}
          color={category?.color ?? Colors.textMuted}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {category?.name ?? 'Sans catégorie'}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {showDate ? transaction.date : transaction.note || (income ? 'Revenu' : 'Dépense')}
        </Text>
      </View>
      <Text style={[styles.amount, { color: income ? Colors.success : Colors.textPrimary }]}>
        {formatSignedCents(transaction.amountCents, transaction.type)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  pressed: {
    opacity: 0.8,
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
  amount: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    fontVariant: ['tabular-nums'],
  },
});
