// Powered by OnSpace.AI
/** Where the update tracker sends users whose platform cannot self-install. */
export const RELEASES_URL = 'https://github.com/Projet-Synapse/123Finances/releases/latest';

/** Clés de persistance locale — un préfixe commun, une clé par domaine. */
export const STORAGE_KEYS = {
  accounts: 'finances.accounts',
  categories: 'finances.categories',
  transactions: 'finances.transactions',
  budgets: 'finances.budgets',
} as const;
