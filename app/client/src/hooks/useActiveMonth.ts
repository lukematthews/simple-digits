import { useBudgetStore } from "@/store/useBudgetStore";

export const useActiveMonth = () => {
  const { currentBudget, activeMonthId } = useBudgetStore((s) => ({
    currentBudget: s.currentBudget,
    activeMonthId: s.activeMonthId,
  }));

  return currentBudget?.months.find((m) => m.id === activeMonthId) ?? null;
};
