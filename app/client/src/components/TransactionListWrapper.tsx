import { useEffect, useState } from "react";
import TransactionCard from "./TransactionCard";
import { socket } from "@/lib/socket";
import { Month, Transaction, WsEvent } from "@/types";
import { useBudgetStore } from "@/store/useBudgetStore";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import TransactionHeader from "./TransactionHeader";

interface Props {
  month: Month;
}

export default function TransactionList({ month }: Props) {
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);

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

  const handleAdd = () => {
    setNewTransaction({
      id: "" + Date.now(), // temporary ID for React keying
      description: "",
      date: new Date().toISOString().slice(0, 10),
      paid: false,
      amount: 0,
      balance: 0,
      monthId: month.id,
    });
  };

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
    <div>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>
        Add Transaction
      </button>
      <TransactionHeader />
      {transactions.map((txn) => (
        <TransactionCard key={txn.id} transaction={txn} />
      ))}
      {newTransaction && <TransactionCard key={newTransaction.id} transaction={newTransaction} isNew onDiscard={() => setNewTransaction(null)} onDone={handleDone} />}
      {!newTransaction && (
        <button className="my-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>
          Add Transaction
        </button>
      )}
    </div>
  );
}
