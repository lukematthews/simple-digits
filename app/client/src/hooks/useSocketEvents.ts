// hooks/useSocketEvents.ts
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useBudgetStore } from "@/store/useBudgetStore";
import { Transaction, Account, Month } from "@/types";

export function useSocketEvents() {
  const {
    updateTransaction,
    addTransaction,
    deleteTransaction,
    updateAccount,
    addMonth,
    reorderMonths,
  } = useBudgetStore.getState();

  useEffect(() => {
    socket.on("transaction.updated", (tx: Transaction) => updateTransaction(tx));
    socket.on("transaction.created", (tx: Transaction) => addTransaction(tx));
    socket.on("transaction.deleted", ({ id, monthId }: { id: string; monthId: string }) =>
      deleteTransaction(id, monthId)
    );

    socket.on("account.updated", (acc: Account) => updateAccount(acc));
    socket.on("month.created", (month: Month) => addMonth(month));
    socket.on("months.reordered", (months: Month[]) => reorderMonths(months));

    return () => {
      socket.off("transaction.updated");
      socket.off("transaction.created");
      socket.off("transaction.deleted");
      socket.off("account.updated");
      socket.off("month.created");
      socket.off("months.reordered");
    };
  }, []);
}
