// Powered by OnSpace.AI — budgets mensuels par catégorie de dépense, avec le
// calcul de la part dépensée dans le mois courant.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/constants/config';
import { loadJson, saveJson, uid } from '@/services/storage';
import { monthKey, type Budget } from '@/types';
import { useFinance } from './FinanceContext';

interface BudgetsContextValue {
  budgets: Budget[];
  addBudget: (categoryId: string, monthlyLimitCents: number) => void;
  updateBudget: (id: string, patch: Partial<Omit<Budget, 'id'>>) => void;
  removeBudget: (id: string) => void;
  /** Dépenses du mois courant pour chaque budget, en centimes. */
  spentFor: (budget: Budget, key: string) => number;
}

const BudgetsContext = createContext<BudgetsContextValue | null>(null);

export function BudgetsProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { transactions, categories } = useFinance();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadJson<Budget[]>(STORAGE_KEYS.budgets, []);
      if (!cancelled) {
        setBudgets(stored);
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveJson(STORAGE_KEYS.budgets, budgets);
  }, [budgets, hydrated]);

  const addBudget = useCallback((categoryId: string, monthlyLimitCents: number) => {
    setBudgets((prev) => [...prev, { id: uid('budget'), categoryId, monthlyLimitCents }]);
  }, []);

  const updateBudget = useCallback((id: string, patch: Partial<Omit<Budget, 'id'>>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const removeBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const spentFor = useCallback(
    (budget: Budget, key: string) => {
      const category = categories.find((c) => c.id === budget.categoryId);
      if (!category) return 0;
      return transactions
        .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId)
        .filter((t) => monthKey(new Date(t.date)) === key)
        .reduce((sum, t) => sum + t.amountCents, 0);
    },
    [transactions, categories],
  );

  const value = useMemo<BudgetsContextValue>(
    () => ({ budgets, addBudget, updateBudget, removeBudget, spentFor }),
    [budgets, addBudget, updateBudget, removeBudget, spentFor],
  );

  return <BudgetsContext.Provider value={value}>{children}</BudgetsContext.Provider>;
}

export function useBudgets(): BudgetsContextValue {
  const context = useContext(BudgetsContext);
  if (!context) throw new Error('useBudgets doit être utilisé dans <BudgetsProvider>');
  return context;
}
