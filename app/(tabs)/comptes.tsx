// Powered by OnSpace.AI — Comptes : liste avec soldes calculés, création et
// édition via un éditeur modal.
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState } from '@/components';
import { AccountCard } from '@/components/feature';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCents } from '@/services/money';

export default function ComptesScreen() {
  const router = useRouter();
  const { accounts, balanceByAccount, totalBalanceCents } = useFinance();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Comptes</Text>
      <Text style={styles.subtitle}>
        Le solde de chaque compte part de votre solde initial et suit vos transactions.
      </Text>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Solde consolidé</Text>
        <Text style={[styles.totalValue, { color: totalBalanceCents < 0 ? Colors.error : Colors.success }]}>
          {formatCents(totalBalanceCents)}
        </Text>
      </View>

      {accounts.length === 0 ? (
        <EmptyState
          icon="account-balance-wallet"
          title="Aucun compte"
          subtitle="Compte courant, épargne, espèces… créez-en autant que nécessaire."
        >
          <Button label="+ Créer un compte" onPress={() => router.push('/account-editor')} />
        </EmptyState>
      ) : (
        <>
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              balanceCents={balanceByAccount[account.id] ?? 0}
              onPress={() => router.push({ pathname: '/account-editor', params: { id: account.id } })}
            />
          ))}
          <Button
            label="+ Nouveau compte"
            variant="secondary"
            onPress={() => router.push('/account-editor')}
          />
        </>
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
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.base,
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  totalCard: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginVertical: Spacing.xl,
    padding: Spacing.xl,
  },
  totalLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.sm,
    fontVariant: ['tabular-nums'],
  },
});
