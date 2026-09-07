// Powered by OnSpace.AI — éditeur de compte (modal) : nom, type, icône,
// couleur, solde initial. Création et édition.
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, IconPicker, Input } from '@/components';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { ACCOUNT_COLORS, useFinance } from '@/contexts/FinanceContext';
import { parseAmountToCents } from '@/services/money';
import type { AccountKind } from '@/types';

const KINDS: { value: AccountKind; label: string }[] = [
  { value: 'checking', label: 'Courant' },
  { value: 'savings', label: 'Épargne' },
  { value: 'cash', label: 'Espèces' },
  { value: 'other', label: 'Autre' },
];

const KIND_ICONS: Record<AccountKind, string> = {
  checking: 'account-balance',
  savings: 'savings',
  cash: 'payments',
  other: 'wallet',
};

export default function AccountEditorScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { accounts, addAccount, updateAccount, removeAccount } = useFinance();

  const existing = useMemo(() => accounts.find((a) => a.id === params.id) ?? null, [accounts, params.id]);

  const [name, setName] = useState(existing?.name ?? '');
  const [kind, setKind] = useState<AccountKind>(existing?.kind ?? 'checking');
  const [icon, setIcon] = useState(existing?.icon ?? 'account-balance');
  const [color, setColor] = useState(existing?.color ?? ACCOUNT_COLORS[0]);
  const [initialInput, setInitialInput] = useState(
    existing ? (existing.initialCents / 100).toFixed(2).replace('.', ',') : '0',
  );
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!name.trim()) {
      setError('Donnez un nom au compte.');
      return;
    }
    // Solde initial : nombre décimal signé ("−12,50" ou "-12,50" acceptés).
    const raw = initialInput.trim().replace(',', '.');
    const negative = raw.startsWith('-');
    const cents = parseAmountToCents(negative ? raw.slice(1) : raw);
    if (cents === null) {
      setError('Solde initial invalide — ex. 250 ou −12,50');
      return;
    }
    const initialCents = negative ? -cents : cents;
    if (existing) {
      updateAccount(existing.id, { name: name.trim(), kind, icon, color, initialCents });
    } else {
      addAccount({ name: name.trim(), kind, icon, color, initialCents });
    }
    router.back();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{existing ? 'Modifier le compte' : 'Nouveau compte'}</Text>

      <Card>
        <Input label="Nom" placeholder="Ex. Compte courant, Livret A…" value={name} onChangeText={setName} />
        <View style={styles.spacing} />
        <Text style={styles.label}>Type</Text>
        <View style={styles.kindRow}>
          {KINDS.map(({ value, label }) => (
            <Pressable
              key={value}
              style={[styles.kindButton, kind === value && styles.kindButtonOn]}
              onPress={() => {
                setKind(value);
                setIcon(KIND_ICONS[value]);
              }}
            >
              <Text style={[styles.kindLabel, kind === value && styles.kindLabelOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.spacing} />
        <Input
          label="Solde initial (€) — négatif si vous êtes à découvert"
          placeholder="250,00"
          keyboardType="numbers-and-punctuation"
          value={initialInput}
          onChangeText={setInitialInput}
        />
      </Card>

      <View style={styles.spacing} />
      <Card>
        <IconPicker label="Icône" value={icon} onChange={setIcon} />
        <View style={styles.spacing} />
        <Text style={styles.label}>Couleur</Text>
        <View style={styles.swatches}>
          {ACCOUNT_COLORS.map((value) => (
            <Pressable
              key={value}
              onPress={() => setColor(value)}
              style={[styles.swatch, { backgroundColor: value }, color === value && styles.swatchSelected]}
              accessibilityLabel={`Couleur ${value}`}
            />
          ))}
        </View>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Button label={existing ? 'Enregistrer' : 'Créer le compte'} onPress={save} />
        {existing ? (
          <Button
            label="Supprimer (et ses transactions)"
            variant="danger"
            onPress={() => {
              removeAccount(existing.id);
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
  spacing: {
    height: Spacing.lg,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  kindRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kindButton: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 90,
  },
  kindButtonOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  kindLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  kindLabelOn: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    borderColor: Colors.border,
    borderRadius: Radius.full,
    borderWidth: 2,
    height: 36,
    width: 36,
  },
  swatchSelected: {
    borderColor: '#FFFFFF',
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
