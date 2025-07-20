// store/useBudgetStore.ts
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { Budget, BudgetSummary, Month, Transaction, Account, Role } from "@/types";
import { WS_URL } from "@/config";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import { calculateMonthBalances } from "@/lib/monthUtils";

type BudgetSummarySlice = {
  budgetSummaries: BudgetSummary[];
  currentBudgetSummary?: BudgetSummary;
  setBudgetSummaries: (b: BudgetSummary[]) => void;
  setCurrentBudgetSummary: (b: BudgetSummary) => void;
  loadBudgetSummaries: () => Promise<void>;
  getBudgetIdByShortCode: (shortCode: string) => string | undefined;
};

type BudgetSlice = {
  budgets: Budget[];
  currentBudget: Budget | null;
  isBudgetLoading: boolean;
  setBudgets: (b: Budget[]) => void;
  setCurrentBudget: (b: Budget | null) => void;
  loadBudgets: () => Promise<void>;
  loadBudgetById: (id: string) => Promise<void>;
  accessMap: Record<string, Role>;
  setAccess: (budgetId: string, role: Role) => void;
  hasRole: (budgetId: string, allowed: Role[]) => boolean;
};

type TransactionSlice = {
  updateTransaction: (tx: Transaction) => void;
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string, monthId: string) => void;
};

type MonthSlice = {
  addMonth: (month: Month) => void;
  updateMonth: (month: Month) => void;
  reorderMonths: (months: Month[]) => void;
};

type AccountSlice = {
  updateAccount: (account: Account) => void;
  addAccount: (account: Account) => void;
  deleteAccount: (accountId: string, monthId: string) => void;
  getAccountsByMonthId: (monthId: string) => Account[];
};

type ActiveMonthSlice = {
  activeMonthId: string | null;
  setActiveMonthId: (id: string | null) => void;
};

type Store = BudgetSummarySlice & BudgetSlice & TransactionSlice & MonthSlice & AccountSlice & ActiveMonthSlice & { reset: () => void };

export function populateMonthIds(budget: Budget): Budget {
  const updatedMonths = budget.months.map((month) => {
    const updatedTransactions = month.transactions.map((tx) => ({
      ...tx,
      monthId: month.id,
    }));

    const updatedAccounts = month.accounts.map((acc) => ({
      ...acc,
      monthId: month.id,
    }));

    return {
      ...month,
      transactions: updatedTransactions,
      accounts: updatedAccounts,
    };
  });

  return {
    ...budget,
    months: updatedMonths,
  };
}

export const resetAllStores = () => {
  useBudgetStore.getState().reset();
};

export const useBudgetStore = createWithEqualityFn<Store>()(
  subscribeWithSelector(
    devtools((set, get) => ({
      // ─── Budget Slice ─────────────────────────────────────
      budgets: [],
      budgetSummaries: [],
      isBudgetLoading: false,
      currentBudget: null,
      activeMonthId: null,

      setBudgets: (budgets) => set({ budgets }),
      setCurrentBudget: (budget) => set({ currentBudget: budget }),

      setBudgetSummaries: (budgetSummaries) => set({ budgetSummaries }),
      setCurrentBudgetSummary: (budgetSummary) => set({ currentBudgetSummary: budgetSummary }),
      getBudgetIdByShortCode: (shortCode: string) => {
        const summary = get().budgetSummaries.find((b) => b.shortCode === shortCode);
        return summary?.id;
      },
      loadBudgetSummaries: async () => {
        try {
          const res = await fetch(WS_URL + "/budget/list", {
            method: "GET",
            credentials: "include",
          });

          if (res.status === 401 || res.status === 500) {
            // Unauthorized or server error — redirect to home
            window.location.href = "/";
            return;
          }

          if (!res.ok) {
            throw new Error("Failed to load budgets");
          }

          const data: BudgetSummary[] = await res.json();
          set({ budgetSummaries: data });
        } catch (err) {
          console.error("Error loading budgets:", err);
          // Fallback redirect (e.g., network failure)
          window.location.href = "/";
        }
      },
      loadBudgets: async () => {
        try {
          const res = await fetch(WS_URL + "/budget");
          if (!res.ok) throw new Error("Failed to load budgets");
          const data: Budget[] = await res.json();
          set({ budgets: data });
        } catch (err) {
          console.error("Error loading budgets:", err);
        }
      },
      loadBudgetById: async (id) => {
        set({ isBudgetLoading: true });
        try {
          const res = await fetch(`${WS_URL}/budget/${id}`, { method: "GET", credentials: "include" });

          if (!res.ok) throw new Error("Failed to load budget");

          const rawBudget: Budget = await res.json();

          // Sort months by position
          const sortedBudget: Budget = {
            ...rawBudget,
            months: rawBudget.months
              .slice() // clone to avoid mutating original
              .sort((a, b) => a.position - b.position),
          };

          const budget = populateMonthIds(sortedBudget);
          document.title = budget.name;
          set({ currentBudget: budget });
        } catch (err) {
          console.error("Error loading budget", err);
        } finally {
          set({ isBudgetLoading: false });
        }
      },

      setAccess: (budgetId, role) => {
        set((state) => ({
          accessMap: { ...state.accessMap, [budgetId]: role },
        }));
      },
      hasRole: (budgetId, allowed) => {
        const role = get().accessMap[budgetId];
        return allowed.includes(role);
      },

      // ─── Transaction Slice ────────────────────────────────
      updateTransaction: (updated) =>
        set((state) => {
          const budget = state.currentBudget;
          if (!budget) return {};

          const updatedMonths = budget.months.map((m) => {
            if (String(m.id) !== String(updated.monthId)) return m;

            const updatedTransactions = m.transactions.map((t) => (String(t.id) === String(updated.id) ? updated : t));
            const recalculatedTransactions = calculateTransactionBalances(m, updatedTransactions);

            return {
              ...m,
              transactions: recalculatedTransactions,
            };
          });

          const recalculatedMonths = calculateMonthBalances(updatedMonths);

          return {
            currentBudget: {
              ...budget,
              months: recalculatedMonths,
            },
          };
        }),

      addTransaction: (tx) =>
        set((state) => {
          const budget = state.currentBudget;
          if (!budget) return {};

          const updatedMonths = budget.months.map((m) => {
            if (String(m.id) !== String(tx.monthId)) return m;

            const updatedTransactions = calculateTransactionBalances(m, [...m.transactions, tx]);

            return {
              ...m,
              transactions: updatedTransactions,
            };
          });

          const recalculatedMonths = calculateMonthBalances(updatedMonths);

          return {
            currentBudget: {
              ...budget,
              months: recalculatedMonths,
            },
          };
        }),

      deleteTransaction: (id, monthId) =>
        set((state) => {
          const budget = state.currentBudget;
          if (!budget) return {};

          const updatedMonths = budget.months.map((m) => {
            if (String(m.id) !== String(monthId)) return m;

            const filteredTransactions = m.transactions.filter((t) => String(t.id) !== String(id));
            const recalculatedTransactions = calculateTransactionBalances(m, filteredTransactions);

            return {
              ...m,
              transactions: recalculatedTransactions,
            };
          });

          const recalculatedMonths = calculateMonthBalances(updatedMonths);

          return {
            currentBudget: {
              ...budget,
              months: recalculatedMonths,
            },
          };
        }),

      // ─── Month Slice ───────────────────────────────────────
      addMonth: (month) =>
        set((state) => ({
          currentBudget: {
            ...state.currentBudget!,
            months: [...state.currentBudget!.months, month],
          },
        })),

      updateMonth: (updated) =>
        set((state) => {
          const budget = state.currentBudget;
          if (!budget) return {};

          const updatedMonths = budget.months.map((m) => (m.id === updated.id ? { ...m, ...updated } : m));

          const recalculatedMonths = calculateMonthBalances(updatedMonths);

          return {
            currentBudget: {
              ...budget,
              months: recalculatedMonths,
            },
          };
        }),

      reorderMonths: (months) =>
        set((state) => ({
          currentBudget: {
            ...state.currentBudget!,
            months,
          },
        })),

      setActiveMonthId: (id) => set({ activeMonthId: id }),

      // ─── Account Slice ─────────────────────────────────────
      updateAccount: (updated) =>
        set((state) => {
          const budget = state.currentBudget;
          if (!budget) return {};

          const updatedMonths = budget.months.map((month) => {
            if (String(month.id) !== String(updated.monthId)) return month;

            // Update account
            const updatedAccounts = month.accounts.map((acc) => (String(acc.id) === String(updated.id) ? updated : acc));

            // Recalculate transactions for this month
            const recalculatedTransactions = calculateTransactionBalances(month, month.transactions);

            return {
              ...month,
              accounts: updatedAccounts,
              transactions: recalculatedTransactions,
            };
          });

          // Recalculate month balances based on all months
          const recalculatedMonths = calculateMonthBalances(updatedMonths);

          return {
            currentBudget: {
              ...budget,
              months: recalculatedMonths,
            },
          };
        }),

      addAccount: (newAcc) =>
        set((state) => {
          const budget = state.currentBudget;
          if (!budget) return {};

          const updatedMonths = budget.months.map((month) => {
            if (String(month.id) !== String(newAcc.monthId)) return month;
            return {
              ...month,
              accounts: [...month.accounts, newAcc],
            };
          });

          return {
            currentBudget: {
              ...budget,
              months: updatedMonths,
            },
          };
        }),

      deleteAccount: (accountId, monthId) =>
        set((state) => {
          const budget = state.currentBudget;
          if (!budget) return {};

          const updatedMonths = budget.months.map((month) => {
            if (String(month.id) !== String(monthId)) return month;
            return {
              ...month,
              accounts: month.accounts.filter((a) => a.id !== accountId),
            };
          });

          return {
            currentBudget: {
              ...budget,
              months: updatedMonths,
            },
          };
        }),
      getAccountsByMonthId: (monthId: string) => {
        const month = get().currentBudget?.months.find((m) => m.id === monthId);
        return month?.accounts ?? [];
      },
      reset: () =>
        set({
          budgets: [],
          budgetSummaries: [],
          currentBudget: undefined,
          currentBudgetSummary: undefined,
          isBudgetLoading: false,
          activeMonthId: null,
        }),
    }))
  )
);
