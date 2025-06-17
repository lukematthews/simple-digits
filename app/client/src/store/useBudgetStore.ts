// store/useBudgetStore.ts
import { create } from "zustand";
import { Budget, BudgetSummary, Month, Transaction, Account } from "@/types";
import { WS_URL } from "@/config";

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
  currentBudget?: Budget;
  isBudgetLoading: boolean;
  setBudgets: (b: Budget[]) => void;
  setCurrentBudget: (b: Budget) => void;
  loadBudgets: () => Promise<void>;
  loadBudgetById: (id: string) => Promise<void>;
};

type TransactionSlice = {
  updateTransaction: (tx: Transaction) => void;
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string, monthId: string) => void;
};

type MonthSlice = {
  addMonth: (month: Month) => void;
  reorderMonths: (months: Month[]) => void;
};

type AccountSlice = {
  updateAccount: (account: Account) => void;
};

type Store = BudgetSummarySlice & BudgetSlice & TransactionSlice & MonthSlice & AccountSlice;

export const useBudgetStore = create<Store>((set, get) => ({
  // ─── Budget Slice ─────────────────────────────────────
  budgets: [],
  budgetSummaries: [],
  isBudgetLoading: false,

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
      const res = await fetch(WS_URL + "/budget/list");
      if (!res.ok) throw new Error("Failed to load budgets");
      const data: BudgetSummary[] = await res.json();
      set({ budgetSummaries: data });
    } catch (err) {
      console.error("Error loading budgets:", err);
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
      const res = await fetch(`${WS_URL}/budget/${id}`);
      if (!res.ok) throw new Error("Failed to load budget");
      const budget: Budget = await res.json();
      set({ currentBudget: budget });
    } catch (err) {
      console.error("Error loading budget", err);
    } finally {
      set({ isBudgetLoading: false });
    }
  },
  // ─── Transaction Slice ────────────────────────────────
  updateTransaction: (updated) =>
    set((state) => ({
      currentBudget: {
        ...state.currentBudget!,
        months: state.currentBudget!.months.map((m) =>
          m.id === updated.monthId
            ? {
                ...m,
                transactions: m.transactions.map((t) => (t.id === updated.id ? updated : t)),
              }
            : m
        ),
      },
    })),

  addTransaction: (tx) =>
    set((state) => ({
      currentBudget: {
        ...state.currentBudget!,
        months: state.currentBudget!.months.map((m) =>
          m.id === tx.monthId
            ? {
                ...m,
                transactions: [...m.transactions, tx],
              }
            : m
        ),
      },
    })),

  deleteTransaction: (id, monthId) =>
    set((state) => ({
      currentBudget: {
        ...state.currentBudget!,
        months: state.currentBudget!.months.map((m) =>
          m.id === monthId
            ? {
                ...m,
                transactions: m.transactions.filter((t) => t.id !== id),
              }
            : m
        ),
      },
    })),

  // ─── Month Slice ───────────────────────────────────────
  addMonth: (month) =>
    set((state) => ({
      currentBudget: {
        ...state.currentBudget!,
        months: [...state.currentBudget!.months, month],
      },
    })),

  reorderMonths: (months) =>
    set((state) => ({
      currentBudget: {
        ...state.currentBudget!,
        months,
      },
    })),

  // ─── Account Slice ─────────────────────────────────────
  updateAccount: (updated) =>
    set((state) => ({
      currentBudget: {
        ...state.currentBudget!,
        accounts: state.currentBudget!.accounts.map((a) => (a.id === updated.id ? updated : a)),
      },
    })),
}));
