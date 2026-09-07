// Powered by OnSpace.AI — éditeur de transaction (modal) : dépense ou revenu,
// montant, catégorie, compte, date, note. Création et édition.
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Input, SectionHeader } from '@/components';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCents, parseAmountToCents } from '@/services/money';
import { todayIso, type TransactionType } from '@/types';

export default function TransactionEditorScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { transactions, categories, accounts, addTransaction, updateTransaction, removeTransaction } =
    useFinance();

  const existing = useMemo(
    () => transactions.find((t) => t.id === params.id) ?? null,
    [transactions, params.id],
  );

  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [amountInput, setAmountInput] = useState(
    existing ? (existing.amountCents / 100).toFixed(2).replace('.', ',') : '',
  );
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? null);
  const [accountId, setAccountId] = useState(existing?.accountId ?? null);
  const [date, setDate] = useState(existing?.date ?? todayIso());
  const [note, setNote] = useState(existing?.note ?? '');
  const [error, setError] = useState<string | null>(null);

  const visibleCategories = categories.filter((c) => c.kind === type);

  const switchType = (next: TransactionType) => {
    setType(next);
    // La catégorie choisie doit correspondre au type : on retombe sur la
    // première du bon type plutôt que de laisser un couple incohérent.
    setCategoryId(null);
  };

  const save = () => {
    const cents = parseAmountToCents(amountInput);
    if (cents === null) {
      setError('Montant invalide — ex. 12,50');
      return;
    }
    if (!categoryId) {
      setError('Choisissez une catégorie.');
      return;
    }
    if (!accountId) {
      setError('Choisissez un compte.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Date attendue au format AAAA-MM-JJ.');
      return;
    }
    if (existing) {
      updateTransaction(existing.id, {
        type,
        amountCents: cents,
        categoryId,
        accountId,
        date,
        note: note.trim() || undefined,
      });
    } else {
      addTransaction({
        type,
        amountCents: cents,
        categoryId,
        accountId,
        date,
        note: note.trim() || undefined,
      });
    }
    router.back();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{existing ? 'Modifier la transaction' : 'Nouvelle transaction'}</Text>

      <View style={styles.typeRow}>
        <Pressable
          style={[styles.typeButton, type === 'expense' && styles.typeExpense]}
          onPress={() => switchType('expense')}
        >
          <Text style={[styles.typeLabel, type === 'expense' && styles.typeLabelOn]}>− Dépense</Text>
        </Pressable>
        <Pressable
          style={[styles.typeButton, type === 'income' && styles.typeIncome]}
          onPress={() => switchType('income')}
        >
          <Text style={[styles.typeLabel, type === 'income' && styles.typeLabelOn]}>+ Revenu</Text>
        </Pressable>
      </View>

      <Card>
        <Input
          label={`Montant (€)${amountInput ? ` — ${parseAmountToCents(amountInput) !== null ? formatCents(parseAmountToCents(amountInput) ?? 0) : 'invalide'}` : ''}`}
          placeholder="12,50"
          keyboardType="decimal-pad"
          value={amountInput}
          onChangeText={setAmountInput}
        />
        <View style={styles.spacing} />
        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.grid}>
          {visibleCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.category,
                categoryId === category.id && {
                  borderColor: category.color,
                  backgroundColor: `${category.color}22`,
                },
              ]}
              onPress={() => setCategoryId(category.id)}
            >
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <SectionHeader title="Compte" />
      {accounts.length === 0 ? (
        <Card>
          <Text style={styles.hint}>Aucun compte : créez-en un d'abord dans l'onglet Comptes.</Text>
          <View style={styles.spacing} />
          <Button
            label="Aller aux comptes"
            variant="secondary"
            onPress={() => router.replace('/(tabs)/comptes')}
          />
        </Card>
      ) : (
        <View style={styles.grid}>
          {accounts.map((account) => (
            <Pressable
              key={account.id}
              style={[
                styles.category,
                accountId === account.id && {
                  borderColor: account.color,
                  backgroundColor: `${account.color}22`,
                },
              ]}
              onPress={() => setAccountId(account.id)}
            >
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {account.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <SectionHeader title="Détails" />
      <Card>
        <Input label="Date (AAAA-MM-JJ)" value={date} onChangeText={setDate} />
        <View style={styles.spacing} />
        <Input
          label="Note (facultatif)"
          placeholder="Ex. courses du samedi"
          value={note}
          onChangeText={setNote}
          multiline
        />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Button label={existing ? 'Enregistrer' : 'Ajouter la transaction'} onPress={save} />
        {existing ? (
          <Button
            label="Supprimer"
            variant="danger"
            onPress={() => {
              removeTransaction(existing.id);
              router.back();
            }}
          />
        ) : null}
        <Button label="Annuler" variant="ghost" onPress={router.back} />
      </View>
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
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
  },
  typeButton: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.md,
  },
  typeExpense: {
    backgroundColor: Colors.coral,
    borderColor: Colors.coral,
  },
  typeIncome: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  typeLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
  },
  typeLabelOn: {
    color: Colors.textInverse,
  },
  spacing: {
    height: Spacing.lg,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  category: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 110,
  },
  categoryLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.md,
  },
  footer: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
});
