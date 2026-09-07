// Powered by OnSpace.AI — modèle de données de 123Finances.
// Les montants sont stockés en centimes (entiers) : aucune erreur d'arrondi
// flottant, l'affichage formate à l'euro près.

export type TransactionType = 'expense' | 'income';
export type CategoryKind = TransactionType;
export type AccountKind = 'checking' | 'savings' | 'cash' | 'other';

export type Account = {
  id: string;
  name: string;
  /** Nom d'icône MaterialIcons. */
  icon: string;
  color: string;
  kind: AccountKind;
  /** Solde de départ en centimes (peut être négatif). */
  initialCents: number;
};

export type Category = {
  id: string;
  name: string;
  /** Nom d'icône MaterialIcons. */
  icon: string;
  color: string;
  kind: CategoryKind;
  /** Catégories fournies par défaut : non supprimables. */
  isSystem: boolean;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  /** Montant en centimes, toujours positif (le type porte le signe). */
  amountCents: number;
  categoryId: string;
  accountId: string;
  /** Date locale au format YYYY-MM-DD. */
  date: string;
  note?: string;
};

export type Budget = {
  id: string;
  /** Budget mensuel d'une catégorie de dépense. */
  categoryId: string;
  monthlyLimitCents: number;
};

// ── Helpers de dates locales ────────────────────────────────────────────────

/** Clé de mois : "YYYY-MM" à partir d'une date locale ou d'un YYYY-MM-DD. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Aujourd'hui au format YYYY-MM-DD (heure locale, pas UTC). */
export function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

export const MONTH_LABELS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** "2026-09" → "Septembre 2026" pour l'affichage. */
export function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  const index = Number(month) - 1;
  const label = MONTH_LABELS[index] ?? month;
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${year}`;
}
