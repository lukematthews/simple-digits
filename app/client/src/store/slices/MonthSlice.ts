import { Month, Store } from "@/types";
import { calculateMonthBalances } from "@/lib/monthUtils";
import { SliceCreator } from "../types";

export type MonthSlice = {
  months: Month[];
  addMonth: (month: Month) => void;
  updateMonth: (month: Partial<Month>) => void;
  reorderMonths: (months: Month[]) => void;
};

export const createMonthSlice: SliceCreator<MonthSlice> = (set) => ({
  months: [],
  addMonth: (month) =>
    set((state: Store) => ({
      currentBudget: {
        ...state.currentBudget!,
        months: [...state.currentBudget!.months, month],
      },
    })),

  updateMonth: (updated) =>
    set((state: Store) => {
      const budget = state.currentBudget;
      if (!budget) return {};

      const updatedMonths = budget.months.map((m: Month) => (m.id === updated.id ? { ...m, ...updated } : m));

      const recalculatedMonths = calculateMonthBalances(updatedMonths);

      return {
        currentBudget: {
          ...budget,
          months: recalculatedMonths,
        },
      };
    }),

  reorderMonths: (months) =>
    set((state: Store) => ({
      currentBudget: {
        ...state.currentBudget!,
        months,
      },
    })),
});
