import { Account, Month, Store } from "@/types";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import { calculateMonthBalances } from "@/lib/monthUtils";
import { SliceCreator } from "../types";

export type AccountSlice = {
  accounts: [];
  updateAccount: (account: Account) => void;
  addAccount: (account: Account) => void;
  deleteAccount: (accountId: string, monthId: string) => void;
  getAccountsByMonthId: (monthId: string) => Account[];
};

export const createAccountSlice: SliceCreator<AccountSlice> = (set, get) => ({  
    accounts: [],
    updateAccount: (updated) =>
    set((state: Store) => {
      const budget = state.currentBudget;
      if (!budget) return {};

      const updatedMonths = budget.months.map((month: Month) => {
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
    set((state: Store) => {
      const budget = state.currentBudget;
      if (!budget) return {};

      const updatedMonths = budget.months.map((month: Month) => {
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
    set((state: Store) => {
      const budget = state.currentBudget;
      if (!budget) return {};

      const updatedMonths = budget.months.map((month: Month) => {
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
    const month = get?.().currentBudget?.months.find((m: Month) => m.id === monthId);
    return month?.accounts ?? [];
  },
});
