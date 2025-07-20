import { useBudgetStore } from "@/store/useBudgetStore";
import { shallow } from "zustand/shallow";
import { Account } from "@/types";

export function useAccountsForMonth(monthId: string): Account[] {
  return useBudgetStore(
    (s) => s.currentBudget?.months.find((m) => m.id === monthId)?.accounts ?? [],
    shallow
  );
}