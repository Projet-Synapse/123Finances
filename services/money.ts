// Powered by OnSpace.AI — formatage et saisie des montants en euros.
// Tout est stocké en centimes entiers ; ces helpers ne font qu'afficher et
// parser la saisie utilisateur ("12,50" → 1250).

/** 1250 → "12,50 €" (séparateurs français). */
export function formatCents(cents: number): string {
  const euros = cents / 100;
  return `${euros.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

/** +12,50 € / −12,50 € selon le signe, pour les listes de transactions. */
export function formatSignedCents(cents: number, type: 'expense' | 'income'): string {
  const sign = type === 'income' ? '+' : '−';
  return `${sign} ${formatCents(Math.abs(cents))}`;
}

/** Saisie utilisateur ("12,5", "12.50", " 12,50 ") → centimes, ou null. */
export function parseAmountToCents(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}
