import { Transaction, Store, Month } from "@/types";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import { calculateMonthBalances } from "@/lib/monthUtils";
import { SliceCreator } from "../types";

export type TransactionSlice = {
  transactions: Transaction[];
  updateTransaction: (tx: Transaction) => void;
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string, monthId: string) => void;
};

export const createTransactionSlice: SliceCreator<TransactionSlice> = (set) => ({
  transactions: [],
  updateTransaction: (updated) =>
    set((state: Store) => {
      const budget = state.currentBudget;
      if (!budget) return {};

      const updatedMonths = budget.months.map((m: Month) => {
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
    set((state: Store) => {
      const budget = state.currentBudget;
      if (!budget) return {};

      const updatedMonths = budget.months.map((m: Month) => {
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
    set((state: Store) => {
      const budget = state.currentBudget;
      if (!budget) return {};

      const updatedMonths = budget.months.map((m: Month) => {
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
});
