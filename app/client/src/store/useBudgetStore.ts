import { devtools, subscribeWithSelector } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { Budget, Store } from "@/types";
import { createBudgetSlice } from "./slices/BudgetSlice";
import { createTransactionSlice } from "./slices/TransactionSlice";
import { createMonthSlice } from "./slices/MonthSlice";
import { createAccountSlice } from "./slices/AccountSlice";

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
      ...createBudgetSlice(set, get),
      ...createTransactionSlice(set, get),
      ...createMonthSlice(set, get),
      ...createAccountSlice(set, get),
      reset: () => {
        set({
          budgets: [],
          budgetSummaries: [],
          currentBudget: null,
          currentBudgetSummary: undefined,
          isBudgetLoading: false,
          activeMonthId: null,
          accessMap: {},
          transactions: [],
          accounts: [],
          months: [],
        });
      },
    }))
  )
);