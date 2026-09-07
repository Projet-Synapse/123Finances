// Powered by OnSpace.AI — carte de compte : icône, solde calculé, actions.
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { formatCents } from '@/services/money';
import type { Account } from '@/types';

const KIND_LABELS: Record<Account['kind'], string> = {
  checking: 'Compte courant',
  savings: 'Épargne',
  cash: 'Espèces',
  other: 'Autre',
};

interface AccountCardProps {
  account: Account;
  balanceCents: number;
  onPress?: () => void;
}

export function AccountCard({ account, balanceCents, onPress }: AccountCardProps) {
  const negative = balanceCents < 0;
  const content = (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${account.color}22` }]}>
        <MaterialIcons
          name={account.icon as keyof typeof MaterialIcons.glyphMap}
          size={22}
          color={account.color}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.name}>{account.name}</Text>
        <Text style={styles.kind}>{KIND_LABELS[account.kind]}</Text>
      </View>
      <Text style={[styles.balance, { color: negative ? Colors.error : Colors.textPrimary }]}>
        {formatCents(balanceCents)}
      </Text>
    </Card>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  textWrap: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  kind: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  balance: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    fontVariant: ['tabular-nums'],
  },
  pressed: {
    opacity: 0.8,
  },
});
