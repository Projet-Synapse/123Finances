// Powered by OnSpace.AI — Budgets : limite mensuelle par catégorie de dépense,
// progression en direct, ajout et édition inline.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, Input, SectionHeader, Stepper } from '@/components';
import { BudgetCard } from '@/components/feature';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useBudgets } from '@/contexts/BudgetsContext';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCents, parseAmountToCents } from '@/services/money';
import { monthKey } from '@/types';

export default function BudgetsScreen() {
  const { budgets, addBudget, updateBudget, removeBudget, spentFor } = useBudgets();
  const { categories } = useFinance();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const month = monthKey(new Date());
  const expenseCategories = categories.filter((c) => c.kind === 'expense');
  // Une catégorie déjà budgétée ne propose plus de nouveau budget.
  const availableCategories = expenseCategories.filter((c) => !budgets.some((b) => b.categoryId === c.id));
  const editing = budgets.find((b) => b.id === editingId) ?? null;

  const resetForm = () => {
    setAdding(false);
    setEditingId(null);
    setSelectedCategoryId(null);
    setLimitInput('');
    setError(null);
  };

  const submit = () => {
    const cents = parseAmountToCents(limitInput);
    if (cents === null) {
      setError('Montant invalide — ex. 150 ou 150,50');
      return;
    }
    if (editing) {
      updateBudget(editing.id, { monthlyLimitCents: cents });
    } else {
      if (!selectedCategoryId) {
        setError('Choisissez une catégorie.');
        return;
      }
      addBudget(selectedCategoryId, cents);
    }
    resetForm();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Budgets</Text>
      <Text style={styles.subtitle}>
        Fixez une limite mensuelle par catégorie, la progression se met à jour à chaque transaction.
      </Text>

      {budgets.length === 0 && !adding ? (
        <EmptyState
          icon="savings"
          title="Aucun budget"
          subtitle="Ex. 300 € pour l'alimentation, 150 € pour les loisirs…"
        >
          <Button label="+ Créer un budget" onPress={() => setAdding(true)} />
        </EmptyState>
      ) : (
        <>
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              category={categories.find((c) => c.id === budget.categoryId)}
              spentCents={spentFor(budget, month)}
              onEdit={() => {
                setEditingId(budget.id);
                setLimitInput((budget.monthlyLimitCents / 100).toFixed(2).replace('.', ','));
              }}
            />
          ))}
          {!adding ? (
            <Button label="+ Créer un budget" variant="secondary" onPress={() => setAdding(true)} />
          ) : null}
        </>
      )}

      {editing ? (
        <Card style={styles.form}>
          <SectionHeader title={`Modifier — limite mensuelle`} action="Annuler" onAction={resetForm} />
          <Stepper
            label="Limite rapide"
            value={editing.monthlyLimitCents}
            min={1000}
            max={500000}
            step={5000}
            onChange={(cents) => updateBudget(editing.id, { monthlyLimitCents: cents })}
            format={(cents) => formatCents(cents)}
          />
          <View style={styles.spacing} />
          <Input
            label="Limite mensuelle (€)"
            value={limitInput}
            onChangeText={setLimitInput}
            keyboardType="decimal-pad"
            placeholder="150,00"
          />
          <Button label="Enregistrer" onPress={submit} style={styles.submit} />
          <Button
            label="Supprimer ce budget"
            variant="danger"
            onPress={() => {
              removeBudget(editing.id);
              resetForm();
            }}
            style={styles.submit}
          />
        </Card>
      ) : null}

      {adding ? (
        <Card style={styles.form}>
          <SectionHeader title="Nouveau budget" action="Annuler" onAction={resetForm} />
          {availableCategories.length === 0 ? (
            <Text style={styles.hint}>Toutes les catégories de dépense ont déjà un budget.</Text>
          ) : (
            <View style={styles.categoryGrid}>
              {availableCategories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategoryId === category.id && {
                      borderColor: category.color,
                      backgroundColor: `${category.color}22`,
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(category.id)}
                >
                  <Text style={styles.categoryLabel}>{category.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.spacing} />
          <Input
            label="Limite mensuelle (€)"
            value={limitInput}
            onChangeText={setLimitInput}
            keyboardType="decimal-pad"
            placeholder="150,00"
          />
          <Text style={styles.hint}>Presets rapides :</Text>
          <View style={styles.presets}>
            {[50, 100, 150, 300].map((euros) => (
              <Pressable key={euros} style={styles.preset} onPress={() => setLimitInput(String(euros))}>
                <Text style={styles.presetLabel}>{euros} €</Text>
              </Pressable>
            ))}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Créer le budget" onPress={submit} style={styles.submit} />
        </Card>
      ) : null}
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
  form: {
    marginTop: Spacing.lg,
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
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  preset: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  presetLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  categoryLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.sm,
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.sm,
  },
  submit: {
    marginTop: Spacing.md,
  },
});
