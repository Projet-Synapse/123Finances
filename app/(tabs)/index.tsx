// Powered by OnSpace.AI — Accueil : solde consolidé, flux du mois, répartition
// par catégorie et dernières transactions. Toutes les valeurs sont calculées
// depuis les transactions réelles.
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, SectionHeader, TransactionRow } from '@/components';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCents } from '@/services/money';
import { monthKey } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { accounts, totalBalanceCents, monthTotals, monthSpendByCategory, transactionsOfMonth, categories } =
    useFinance();
  const currentMonth = monthKey(new Date());
  const { incomeCents, expenseCents } = useMemo(() => monthTotals(currentMonth), [monthTotals, currentMonth]);
  const spendByCategory = useMemo(
    () => monthSpendByCategory(currentMonth).slice(0, 5),
    [monthSpendByCategory, currentMonth],
  );
  const recent = useMemo(
    () => transactionsOfMonth(currentMonth).slice(0, 5),
    [transactionsOfMonth, currentMonth],
  );
  const maxSpend = spendByCategory[0]?.cents ?? 0;

  if (accounts.length === 0) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>123Finances</Text>
        <EmptyState
          icon="account-balance-wallet"
          title="Bienvenue !"
          subtitle="Créez votre premier compte pour commencer à suivre vos finances. Tout reste sur cet appareil."
        >
          <Button label="+ Créer un compte" onPress={() => router.push('/account-editor')} />
        </EmptyState>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>Solde total</Text>
      <Text style={[styles.total, { color: totalBalanceCents < 0 ? Colors.error : Colors.textPrimary }]}>
        {formatCents(totalBalanceCents)}
      </Text>
      <Text style={styles.accountsHint}>
        sur {accounts.length} compte{accounts.length > 1 ? 's' : ''}
      </Text>

      <View style={styles.fluxRow}>
        <Card style={styles.fluxCard}>
          <Text style={styles.fluxLabel}>Revenus du mois</Text>
          <Text style={[styles.fluxValue, { color: Colors.success }]}>{formatCents(incomeCents)}</Text>
        </Card>
        <Card style={styles.fluxCard}>
          <Text style={styles.fluxLabel}>Dépenses du mois</Text>
          <Text style={[styles.fluxValue, { color: Colors.coral }]}>{formatCents(expenseCents)}</Text>
        </Card>
      </View>

      <Pressable style={styles.quickAdd} onPress={() => router.push('/transaction-editor')}>
        <Text style={styles.quickAddLabel}>+ Ajouter une transaction</Text>
      </Pressable>

      <SectionHeader title="Répartition du mois" subtitle="Vos principales dépenses, par catégorie" />
      {spendByCategory.length === 0 ? (
        <Text style={styles.hint}>Aucune dépense enregistrée ce mois-ci.</Text>
      ) : (
        <Card>
          {spendByCategory.map(({ category, cents }) => (
            <View key={category.id} style={styles.barRow}>
              <Text style={styles.barLabel}>{category.name}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: category.color,
                      width: maxSpend > 0 ? `${Math.max(Math.round((cents / maxSpend) * 100), 6)}%` : '0%',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{formatCents(cents)}</Text>
            </View>
          ))}
        </Card>
      )}

      <SectionHeader
        title="Dernières transactions"
        action="Tout voir"
        onAction={() => router.push('/(tabs)/transactions')}
      />
      {recent.length === 0 ? (
        <EmptyState
          icon="receipt-long"
          title="Rien pour le moment"
          subtitle="Vos transactions du mois apparaîtront ici."
        />
      ) : (
        recent.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            category={categories.find((c) => c.id === transaction.categoryId)}
            showDate
            onPress={() => router.push({ pathname: '/transaction-editor', params: { id: transaction.id } })}
          />
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
  greeting: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.base,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
  },
  total: {
    fontSize: Typography.sizes.xxxl + 8,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  accountsHint: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
  },
  fluxRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  fluxCard: {
    flex: 1,
  },
  fluxLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    textTransform: 'uppercase',
  },
  fluxValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  quickAdd: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  quickAddLabel: {
    color: Colors.textInverse,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
  },
  barRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  barLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.xs,
    width: 100,
  },
  track: {
    backgroundColor: Colors.surfaceMid,
    borderRadius: Radius.full,
    flex: 1,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
    height: '100%',
  },
  barValue: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.xs,
    fontVariant: ['tabular-nums'],
    minWidth: 70,
    textAlign: 'right',
  },
});
