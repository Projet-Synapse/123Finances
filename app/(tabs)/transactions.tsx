// Powered by OnSpace.AI — Transactions : mois par mois, filtres par type,
// groupées par date. Toucher une transaction ouvre l'éditeur.
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Chip, EmptyState, MonthSwitcher, TransactionRow } from '@/components';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCents } from '@/services/money';
import { monthKey, monthLabel, type TransactionType } from '@/types';

type Filter = 'all' | TransactionType;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'expense', label: 'Dépenses' },
  { value: 'income', label: 'Revenus' },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactionsOfMonth, categories, monthTotals } = useFinance();
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [filter, setFilter] = useState<Filter>('all');

  const monthTransactions = useMemo(() => transactionsOfMonth(month), [transactionsOfMonth, month]);
  const filtered = useMemo(
    () => (filter === 'all' ? monthTransactions : monthTransactions.filter((t) => t.type === filter)),
    [monthTransactions, filter],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const transaction of filtered) {
      const list = groups.get(transaction.date) ?? [];
      list.push(transaction);
      groups.set(transaction.date, list);
    }
    return [...groups.entries()];
  }, [filtered]);

  const { incomeCents, expenseCents } = monthTotals(month);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Transactions</Text>

      <View style={styles.switcher}>
        <MonthSwitcher monthKey={month} onChange={setMonth} />
      </View>

      <View style={styles.totalsRow}>
        <Chip label={`Revenus ${formatCents(incomeCents)}`} color={Colors.success} />
        <Chip label={`Dépenses ${formatCents(expenseCents)}`} color={Colors.coral} />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(({ value, label }) => (
          <Pressable
            key={value}
            style={[styles.filterButton, filter === value && styles.filterOn]}
            onPress={() => setFilter(value)}
          >
            <Text style={[styles.filterLabel, filter === value && styles.filterLabelOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Button
        label="+ Nouvelle transaction"
        onPress={() => router.push('/transaction-editor')}
        style={styles.addButton}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="receipt-long"
          title="Aucune transaction"
          subtitle={`Rien à afficher pour ${monthLabel(month)}.`}
        />
      ) : (
        grouped.map(([date, list]) => (
          <View key={date} style={styles.dayGroup}>
            <Text style={styles.dayLabel}>{date}</Text>
            {list.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                category={categories.find((c) => c.id === transaction.categoryId)}
                onPress={() =>
                  router.push({ pathname: '/transaction-editor', params: { id: transaction.id } })
                }
              />
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl + Spacing.lg,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.lg,
  },
  switcher: {
    marginBottom: Spacing.md,
  },
  totalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterRow: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 9,
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  filterOn: {
    backgroundColor: Colors.primary,
  },
  filterLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
  },
  filterLabelOn: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
  addButton: {
    marginTop: Spacing.md,
  },
  dayGroup: {
    marginTop: Spacing.lg,
  },
  dayLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
});
