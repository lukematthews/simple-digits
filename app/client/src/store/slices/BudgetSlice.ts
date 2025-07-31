import { WS_URL } from "@/config";
import { Budget, BudgetSummary, Role, Store } from "@/types";
import { populateMonthIds } from "../useBudgetStore";
import { SliceCreator } from "../types";
import { calculateMonthBalances } from "@/lib/monthUtils";

export type BudgetSlice = {
  budgets: Budget[];
  currentBudget: Budget | null;
  budgetSummaries: BudgetSummary[];
  currentBudgetSummary?: BudgetSummary;
  isBudgetLoading: boolean;
  activeMonthId: string | null;
  accessMap: Record<string, Role>;
  setBudgets: (b: Budget[]) => void;
  setBudgetSummaries: (b: BudgetSummary[]) => void;
  setCurrentBudgetSummary: (b: BudgetSummary) => void;
  setCurrentBudget: (b: Budget | null) => void;
  loadBudgets: () => Promise<void>;
  loadBudgetById: (id: string) => Promise<void>;
  getBudgetIdByShortCode: (shortCode: string) => string | undefined;
  loadBudgetSummaries: () => Promise<void>;
  setActiveMonthId: (id: string | null) => void;
  setAccess: (budgetId: string, role: Role) => void;
  hasRole: (budgetId: string, allowed: Role[]) => boolean;
};

export const createBudgetSlice: SliceCreator<BudgetSlice> = (set, get) => ({
  budgets: [],
  budgetSummaries: [],
  isBudgetLoading: false,
  currentBudget: null,
  activeMonthId: null,
  accessMap: {},

  setBudgets: (budgets) => set({ budgets }),
  setCurrentBudget: (budget) => set({ currentBudget: budget }),

  setBudgetSummaries: (budgetSummaries) => set({ budgetSummaries }),
  setCurrentBudgetSummary: (budgetSummary) => set({ currentBudgetSummary: budgetSummary }),
  getBudgetIdByShortCode: (shortCode: string) => {
    const summary = get?.().budgetSummaries.find((b: BudgetSummary) => b.shortCode === shortCode);
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

      console.log(
        "Raw month types:",
        rawBudget.months.map((m) => ({
          id: m.id,
          startingBalance: m.startingBalance,
          type: typeof m.startingBalance,
        }))
      );

      // Sort months by position
      const sortedBudget: Budget = {
        ...rawBudget,
        months: rawBudget.months
          .slice() // clone to avoid mutating original
          .sort((a, b) => a.position - b.position),
      };

      const budget = populateMonthIds(sortedBudget);
      const balancedMonths = calculateMonthBalances(budget.months);
      budget.months = balancedMonths;
      document.title = budget.name;
      set({ currentBudget: budget });
    } catch (err) {
      console.error("Error loading budget", err);
    } finally {
      set({ isBudgetLoading: false });
    }
  },

  setAccess: (budgetId, role) => {
    set((state: Store) => ({
      accessMap: { ...state.accessMap, [budgetId]: role },
    }));
  },
  hasRole: (budgetId, allowed) => {
    const role = get?.().accessMap[budgetId];
    return role ? allowed.includes(role) : false;
  },

  setActiveMonthId: (id) => set({ activeMonthId: id }),
});
