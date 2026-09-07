// Powered by OnSpace.AI — comptes, catégories et transactions, 100 % locaux.
// Les soldes sont toujours recalculés depuis les transactions : pas d'état
// dérivé stocké, donc jamais de désynchronisation.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/constants/config';
import { loadJson, saveJson, uid } from '@/services/storage';
import { monthKey, type Account, type Category, type Transaction, type TransactionType } from '@/types';

// ── Catégories fournies : modifiables mais non supprimables ─────────────────

function systemCategory(
  id: string,
  name: string,
  icon: string,
  color: string,
  kind: TransactionType,
): Category {
  return { id, name, icon, color, kind, isSystem: true };
}

export const SYSTEM_CATEGORIES: Category[] = [
  systemCategory('cat_food', 'Alimentation', 'restaurant', '#FF6B6B', 'expense'),
  systemCategory('cat_housing', 'Logement', 'home', '#7C5CFC', 'expense'),
  systemCategory('cat_transport', 'Transport', 'directions-car', '#74B9FF', 'expense'),
  systemCategory('cat_leisure', 'Loisirs', 'sports-esports', '#00CEC9', 'expense'),
  systemCategory('cat_health', 'Santé', 'favorite', '#E17055', 'expense'),
  systemCategory('cat_shopping', 'Shopping', 'shopping-cart', '#FDCB6E', 'expense'),
  systemCategory('cat_subscriptions', 'Abonnements', 'autorenew', '#A29BFE', 'expense'),
  systemCategory('cat_other_expense', 'Autres dépenses', 'more-horiz', '#6B6390', 'expense'),
  systemCategory('cat_salary', 'Salaire', 'payments', '#55EFC4', 'income'),
  systemCategory('cat_freelance', 'Freelance', 'work', '#00CEC9', 'income'),
  systemCategory('cat_refunds', 'Remboursements', 'replay', '#74B9FF', 'income'),
  systemCategory('cat_gifts', 'Cadeaux', 'card-giftcard', '#FDCB6E', 'income'),
  systemCategory('cat_other_income', 'Autres revenus', 'more-horiz', '#6B6390', 'income'),
];

const ACCOUNT_COLORS = ['#7C5CFC', '#00CEC9', '#FF6B6B', '#FDCB6E', '#55EFC4', '#74B9FF'];

interface FinanceContextValue {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  /** Solde de chaque compte, initial + transactions. */
  balanceByAccount: Record<string, number>;
  /** Solde total consolidé, en centimes. */
  totalBalanceCents: number;
  addAccount: (account: Omit<Account, 'id'>) => Account;
  updateAccount: (id: string, patch: Partial<Omit<Account, 'id'>>) => void;
  removeAccount: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'isSystem'>) => Category;
  removeCategory: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id'>>) => void;
  removeTransaction: (id: string) => void;
  /** Revenus et dépenses d'un mois "YYYY-MM", en centimes. */
  monthTotals: (key: string) => { incomeCents: number; expenseCents: number };
  /** Dépenses du mois par catégorie (top trié décroissant). */
  monthSpendByCategory: (key: string) => { category: Category; cents: number }[];
  transactionsOfMonth: (key: string) => Transaction[];
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [storedAccounts, storedCategories, storedTransactions] = await Promise.all([
        loadJson<Account[]>(STORAGE_KEYS.accounts, []),
        loadJson<Category[]>(STORAGE_KEYS.categories, []),
        loadJson<Transaction[]>(STORAGE_KEYS.transactions, []),
      ]);
      if (cancelled) return;
      setAccounts(storedAccounts);
      setCustomCategories(storedCategories);
      setTransactions(storedTransactions);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveJson(STORAGE_KEYS.accounts, accounts);
  }, [accounts, hydrated]);
  useEffect(() => {
    if (hydrated) void saveJson(STORAGE_KEYS.categories, customCategories);
  }, [customCategories, hydrated]);
  useEffect(() => {
    if (hydrated) void saveJson(STORAGE_KEYS.transactions, transactions);
  }, [transactions, hydrated]);

  const categories = useMemo(() => [...SYSTEM_CATEGORIES, ...customCategories], [customCategories]);

  // ── Comptes ────────────────────────────────────────────────────────────────
  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const created: Account = { ...account, id: uid('account') };
    setAccounts((prev) => [...prev, created]);
    return created;
  }, []);

  const updateAccount = useCallback((id: string, patch: Partial<Omit<Account, 'id'>>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const removeAccount = useCallback((id: string) => {
    // Les transactions du compte supprimé perdent leur rattachement : on les
    // supprime aussi, sinon les totaux deviendraient faux en silence.
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.accountId !== id));
  }, []);

  // ── Catégories ─────────────────────────────────────────────────────────────
  const addCategory = useCallback((category: Omit<Category, 'id' | 'isSystem'>) => {
    const created: Category = { ...category, id: uid('category'), isSystem: false };
    setCustomCategories((prev) => [...prev, created]);
    return created;
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    setTransactions((prev) => prev.filter((t) => t.categoryId !== id));
  }, []);

  // ── Transactions ───────────────────────────────────────────────────────────
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactions((prev) => [...prev, { ...transaction, id: uid('tx') }]);
  }, []);

  const updateTransaction = useCallback((id: string, patch: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Dérivés ────────────────────────────────────────────────────────────────
  const balanceByAccount = useMemo(() => {
    const balances: Record<string, number> = {};
    for (const account of accounts) balances[account.id] = account.initialCents;
    for (const transaction of transactions) {
      if (balances[transaction.accountId] === undefined) continue;
      balances[transaction.accountId] +=
        transaction.type === 'income' ? transaction.amountCents : -transaction.amountCents;
    }
    return balances;
  }, [accounts, transactions]);

  const totalBalanceCents = useMemo(
    () => Object.values(balanceByAccount).reduce((sum, cents) => sum + cents, 0),
    [balanceByAccount],
  );

  const monthTotals = useCallback(
    (key: string) => {
      let incomeCents = 0;
      let expenseCents = 0;
      for (const transaction of transactions) {
        if (monthKey(new Date(transaction.date)) !== key) continue;
        if (transaction.type === 'income') incomeCents += transaction.amountCents;
        else expenseCents += transaction.amountCents;
      }
      return { incomeCents, expenseCents };
    },
    [transactions],
  );

  const monthSpendByCategory = useCallback(
    (key: string) => {
      const byCategory = new Map<string, number>();
      for (const transaction of transactions) {
        if (transaction.type !== 'expense') continue;
        if (monthKey(new Date(transaction.date)) !== key) continue;
        byCategory.set(
          transaction.categoryId,
          (byCategory.get(transaction.categoryId) ?? 0) + transaction.amountCents,
        );
      }
      return [...byCategory.entries()]
        .map(([categoryId, cents]) => ({
          category: categories.find((c) => c.id === categoryId),
          cents,
        }))
        .filter((entry): entry is { category: Category; cents: number } => Boolean(entry.category))
        .sort((a, b) => b.cents - a.cents);
    },
    [transactions, categories],
  );

  const transactionsOfMonth = useCallback(
    (key: string) =>
      transactions
        .filter((t) => monthKey(new Date(t.date)) === key)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions],
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      accounts,
      categories,
      transactions,
      balanceByAccount,
      totalBalanceCents,
      addAccount,
      updateAccount,
      removeAccount,
      addCategory,
      removeCategory,
      addTransaction,
      updateTransaction,
      removeTransaction,
      monthTotals,
      monthSpendByCategory,
      transactionsOfMonth,
    }),
    [
      accounts,
      categories,
      transactions,
      balanceByAccount,
      totalBalanceCents,
      addAccount,
      updateAccount,
      removeAccount,
      addCategory,
      removeCategory,
      addTransaction,
      updateTransaction,
      removeTransaction,
      monthTotals,
      monthSpendByCategory,
      transactionsOfMonth,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance doit être utilisé dans <FinanceProvider>');
  return context;
}

export { ACCOUNT_COLORS };
