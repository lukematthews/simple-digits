import { useBudgetStore } from "@/store/useBudgetStore";

export const useActiveMonth = () => {
  const budget = useBudgetStore((s) => s.currentBudget);
  const activeMonthId = useBudgetStore((s) => s.activeMonthId);
  return budget?.months.find((m) => m.id === activeMonthId) ?? null;
};
