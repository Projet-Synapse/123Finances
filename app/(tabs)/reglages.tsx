// Powered by OnSpace.AI — Réglages : catégories personnalisées, export CSV des
// transactions, réinitialisation des données. Aucun compte, aucun serveur.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  IconPicker,
  Input,
  Row,
  SectionHeader,
  Toggle,
} from '@/components';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { STORAGE_KEYS } from '@/constants/config';
import { useFinance } from '@/contexts/FinanceContext';
import { useUpdates } from '@/hooks/useUpdates';
import { desktop, isBrowser, isNative } from '@/services/platform';
import { formatCents } from '@/services/money';
import type { TransactionType } from '@/types';

const KINDS: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Dépense' },
  { value: 'income', label: 'Revenu' },
];

function buildCsv(
  transactions: {
    id: string;
    type: string;
    amountCents: number;
    categoryId: string;
    accountId: string;
    date: string;
    note?: string;
  }[],
  categories: { id: string; name: string }[],
  accounts: { id: string; name: string }[],
): string {
  const lines = ['type;date;montant;categorie;compte;note'];
  for (const t of transactions) {
    const note = (t.note ?? '').replace(/;/g, ',');
    lines.push(
      [
        t.type,
        t.date,
        (t.amountCents / 100).toFixed(2),
        categories.find((c) => c.id === t.categoryId)?.name ?? '',
        accounts.find((a) => a.id === t.accountId)?.name ?? '',
        note,
      ].join(';'),
    );
  }
  return lines.join('\n');
}

export default function ReglagesScreen() {
  const { categories, addCategory, removeCategory, transactions, accounts, totalBalanceCents } = useFinance();
  const update = useUpdates();
  const [kind, setKind] = useState<TransactionType>('expense');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('label');
  const [message, setMessage] = useState<string | null>(null);

  const customCategories = categories.filter((c) => !c.isSystem);

  const createCategory = () => {
    if (!name.trim()) {
      setMessage('Donnez un nom à la catégorie.');
      return;
    }
    addCategory({ name: name.trim(), icon, color: kind === 'expense' ? '#FF6B6B' : '#55EFC4', kind });
    setName('');
    setMessage(null);
  };

  const exportCsv = async () => {
    const csv = buildCsv(transactions, categories, accounts);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(csv);
        setMessage('CSV copié dans le presse-papiers.');
        return;
      }
      if (isNative()) {
        const { Share } = await import('react-native');
        await Share.share({ message: csv });
        return;
      }
      setMessage('Export indisponible sur cette plateforme.');
    } catch {
      setMessage("L'export a échoué.");
    }
  };

  const [confirmReset, setConfirmReset] = useState(false);

  const resetAll = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    setConfirmReset(false);
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    } else {
      setMessage("Données effacées — redémarrez l'app pour repartir de zéro.");
    }
  };

  const bridge = desktop();

  const updateStatusLabel = (u: ReturnType<typeof useUpdates>): string => {
    switch (u.stage) {
      case 'checking':
        return 'Vérification…';
      case 'available':
        return u.latestVersion ? `${u.latestVersion} disponible` : 'Mise à jour disponible';
      case 'downloading':
        return typeof u.progress === 'number' ? `Téléchargement ${u.progress}%` : 'Téléchargement…';
      case 'ready':
        return 'Prête à installer';
      case 'error':
        return 'Échec de la vérification';
      case 'up-to-date':
        return 'À jour';
      default:
        return '—';
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Réglages</Text>

      <SectionHeader title="Catégories personnalisées" subtitle="Complétez les catégories fournies" />
      <Card>
        <View style={styles.kindRow}>
          {KINDS.map(({ value, label }) => (
            <Pressable
              key={value}
              style={[styles.kindButton, kind === value && styles.kindButtonOn]}
              onPress={() => setKind(value)}
            >
              <Text style={[styles.kindLabel, kind === value && styles.kindLabelOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Input label="Nom" placeholder="Ex. Animaux, Épargne voyage…" value={name} onChangeText={setName} />
        <View style={styles.spacing} />
        <IconPicker label="Icône" value={icon} onChange={setIcon} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <View style={styles.spacing} />
        <Button label="+ Ajouter la catégorie" variant="secondary" onPress={createCategory} />
      </Card>

      {customCategories.length === 0 ? (
        <EmptyState
          icon="label"
          title="Aucune catégorie personnalisée"
          subtitle="Les catégories fournies couvrent déjà l'essentiel ; ajoutez les vôtres ici."
        />
      ) : (
        customCategories.map((category) => (
          <Row
            key={category.id}
            icon={category.icon}
            iconColor={category.color}
            title={category.name}
            subtitle={category.kind === 'expense' ? 'Dépense' : 'Revenu'}
            right="Retirer"
            onPress={() => removeCategory(category.id)}
          />
        ))
      )}

      <SectionHeader
        title="Vos données"
        subtitle={`${transactions.length} transaction(s) · ${accounts.length} compte(s)`}
      />
      <Card style={styles.dataCard}>
        <Text style={styles.dataLine}>Solde total : {formatCents(totalBalanceCents)}</Text>
        <Text style={styles.dataNote}>
          Tout vit dans le stockage local de l'appareil : aucun compte, aucun serveur, aucune donnée envoyée.{' '}
          {isBrowser() ? 'Attention : vider le cache du navigateur efface les données.' : ''}
        </Text>
        <View style={styles.spacing} />
        <Button
          label="Exporter les transactions (CSV)"
          variant="secondary"
          onPress={() => void exportCsv()}
        />
        <View style={styles.spacing} />
        <Button
          label={confirmReset ? 'Confirmer la réinitialisation complète' : 'Réinitialiser toutes les données'}
          variant="danger"
          onPress={resetAll}
        />
      </Card>

      <SectionHeader title="Mises à jour" subtitle="Gardez l'application à jour" />
      <Card>
        <Text style={styles.dataLine}>Version installée : {update.currentVersion}</Text>
        <Text style={styles.dataNote}>{updateStatusLabel(update)}</Text>
        {update.error ? <Text style={styles.updateError}>{update.error}</Text> : null}
        <View style={styles.spacing} />
        <Button
          label={update.stage === 'checking' ? 'Vérification…' : 'Rechercher une mise à jour'}
          variant="secondary"
          onPress={() => void update.check()}
          loading={update.stage === 'checking'}
        />
        {(update.stage === 'available' || update.stage === 'ready') && update.canSelfInstall ? (
          <>
            <View style={styles.spacing} />
            <Button
              label={update.stage === 'ready' ? 'Redémarrer et installer' : 'Installer et redémarrer'}
              onPress={() => void update.applyUpdate()}
            />
          </>
        ) : null}
        <Toggle
          label="Mise à jour automatique"
          description="Télécharge les nouvelles versions en arrière-plan et les installe à la fermeture de l'application."
          value={update.autoUpdate}
          onChange={update.setAutoUpdate}
        />
      </Card>

      <SectionHeader title="À propos" />
      <Text style={styles.about}>
        123Finances fait partie du projet Synapse. Version locale-first : vos finances ne quittent jamais
        votre appareil. {bridge ? `Bureau ${bridge.platform}, v${bridge.appVersion}.` : ''}
      </Text>
      <View style={styles.chipsRow}>
        <Chip label="100 % local" color={Colors.success} />
        <Chip label="Sans compte" color={Colors.primary} />
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
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
  },
  kindRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kindButton: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.sm,
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
  spacing: {
    height: Spacing.lg,
  },
  message: {
    color: Colors.gold,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.sm,
  },
  dataCard: {
    gap: Spacing.xs,
  },
  dataLine: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  dataNote: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
  },
  updateError: {
    color: Colors.error,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
  },
  about: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
});
