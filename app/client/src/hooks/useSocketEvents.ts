import { useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import { useBudgetStore } from "@/store/useBudgetStore";
import { Transaction, Account, Month, WsEvent, Budget, BudgetSummary } from "@/types";
import { calculateMonthBalances } from "@/lib/monthUtils";
import { useNavigate } from "react-router-dom";
import { useActiveMonth } from "./useActiveMonth";

export function useSocketEvents() {
  /* ---- grab store actions once (stable refs) ---- */
  const { addTransaction, updateTransaction, deleteTransaction, addMonth, updateMonth, reorderMonths, addAccount, updateAccount, deleteAccount } = useBudgetStore.getState();
  const navigate = useNavigate();
  const activeMonth = useActiveMonth(); // <-- Use hook here

  /* ---- keep latest budget reference inside a ref so the handler never closes over stale data ---- */
  const budgetRef = useRef(useBudgetStore.getState().currentBudget);
  useBudgetStore.subscribe(
    (state) => state.currentBudget,
    (budget) => {
      budgetRef.current = budget;
    }
  );

  /* ---- stable handler references ---- */
  const handleBudgetEvent = (message: WsEvent<Account | Month | Transaction | Budget>) => {
    if (message.source !== "api") return;

    switch (message.entity) {
      case "budget": {
        const budget = message.payload as Budget;
        if (message.operation === "create") {
          useBudgetStore.getState().setCurrentBudget(budget);
        } else if (message.operation === "update") {
          const updatedBudget = message.payload as Budget;
          const store = useBudgetStore.getState();

          // Update list
          store.setBudgets(store.budgets.map((b: Budget) => (b.id === updatedBudget.id ? updatedBudget : b)));
          store.setBudgetSummaries(
            store.budgetSummaries.map((b: BudgetSummary) => {
              if (b.id === updatedBudget.id) {
                return {
                  ...b,
                  name: updatedBudget.name,
                  shortCode: updatedBudget.shortCode,
                };
              }
              return b;
            })
          );

          // If it's the current budget, update it
          if (store.currentBudget?.id === updatedBudget.id) {
            const previousShortCode = store.currentBudget.shortCode;
            store.setCurrentBudget(updatedBudget);

            if (previousShortCode && previousShortCode !== updatedBudget.shortCode) {
              const newPath = activeMonth ? `/b/${updatedBudget.shortCode}/${activeMonth.name}` : `/b/${updatedBudget.shortCode}`;
              navigate(newPath, { replace: true });
            }
          }
        } else if (message.operation === "delete") {
          useBudgetStore.getState().setCurrentBudget(null);
        }
        break;
      }
      case "transaction": {
        const tx = message.payload as Transaction;
        if (message.operation === "create") addTransaction(tx);
        else if (message.operation === "update") updateTransaction(tx);
        else if (message.operation === "delete") deleteTransaction(tx.id!, tx.monthId);
        break;
      }
      case "month": {
        const m = message.payload as Month;
        if (message.operation === "create") addMonth(m);
        else if (message.operation === "update") updateMonth(m);
        break;
      }
      case "account": {
        const acc = message.payload as Account;
        if (message.operation === "create") addAccount(acc);
        else if (message.operation === "update") updateAccount(acc);
        else if (message.operation === "delete") deleteAccount(acc.id!, acc.monthId);
        break;
      }
    }

    const currentBudget = budgetRef.current;
    if (currentBudget) calculateMonthBalances(currentBudget.months);
  };

  const handleAccountUpdated = (acc: Account) => updateAccount(acc);
  const handleMonthsReordered = (months: Month[]) => reorderMonths(months);

  useEffect(() => {
    const addListeners = () => {
      console.log("Socket: adding listeners");
      socket.on("budgetEvent", handleBudgetEvent);
      socket.on("account.updated", handleAccountUpdated);
      socket.on("months.reordered", handleMonthsReordered);
    };

    const removeListeners = () => {
      console.log("Socket: removing listeners");
      socket.off("budgetEvent", handleBudgetEvent);
      socket.off("account.updated", handleAccountUpdated);
      socket.off("months.reordered", handleMonthsReordered);
    };

    addListeners(); // Attach immediately

    socket.on("connect", () => {
      console.log("[SOCKET] Connected (event)");
    });

    socket.on("disconnect", () => {
      console.warn("[SOCKET] Disconnected");
    });

    return () => {
      removeListeners();
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);
}
