import { useEffect } from "react";
import TransactionCard from "./TransactionCard";
import { socket } from "@/lib/socket";
import { Month, Transaction, WsEvent } from "@/types";
import { useBudgetStore } from "@/store/useBudgetStore";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import TransactionHeader from "./TransactionHeader";

interface Props {
  month: Month;
  newTransaction: Transaction | null;
  setNewTransaction: (t: Transaction | null) => void;
}

export default function TransactionList({ month, newTransaction, setNewTransaction }: Props) {

  const monthFromStore = useBudgetStore((s) => s.currentBudget?.months.find((m) => String(m.id) === String(month.id)));
  const transactions = monthFromStore?.transactions ?? [];
  const updateMonth = useBudgetStore((s) => s.updateMonth);

  useEffect(() => {
    if (monthFromStore) {
      const updated = {
        ...monthFromStore,
        transactions: calculateTransactionBalances(monthFromStore, transactions),
      };
      updateMonth(updated);
    }
  }, [transactions.length, monthFromStore?.startingBalance]);

  useEffect(() => {
    const handleMessage = (message: WsEvent<Transaction>) => {
      if (message.source !== "api") return;
      if (message.entity !== "transaction") return;
      if (message.operation === "create") {
        setNewTransaction(null);
      }
    };

    socket.on("budgetEvent", handleMessage);
    return () => {
      socket.off("budgetEvent", handleMessage);
    };
  }, []);

  const handleDone = (txn: Transaction) => {
    const event: WsEvent<Transaction> = {
      source: "frontend",
      entity: "transaction",
      operation: "create",
      payload: {
        date: txn.date,
        description: txn.description,
        amount: txn.amount,
        paid: txn.paid,
        monthId: txn.monthId,
      },
    };
    socket.emit("budgetEvent", event);
    setNewTransaction(null);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b">
        <TransactionHeader />
      </div>

      {transactions.map((txn) => (
        <TransactionCard key={txn.id} transaction={txn} />
      ))}

      {newTransaction && <TransactionCard key={newTransaction.id} transaction={newTransaction} isNew onDiscard={() => setNewTransaction(null)} onDone={handleDone} />}

      {/* {!newTransaction && (
        <button className="my-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>
          Add Transaction
        </button>
      )} */}
    </div>
  );
}
