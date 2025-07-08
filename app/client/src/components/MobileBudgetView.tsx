// src/components/MobileBudgetView.tsx
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Budget, Month, Transaction, WsEvent } from "@/types";
import { useBudgetStore } from "@/store/useBudgetStore";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import TransactionHeader from "./TransactionHeader";
import { socket } from "@/lib/socket";
import TransactionCardMobile from "./TransactionCardMobile";

interface Props {
  month: Month | null;
  budget: Budget;
  onSelectMonth: (month: Month) => void;
  onCreateTransaction: (tx: { description: string; amount: number; date: string }) => void;
}

export default function MobileBudgetView({ month, budget, onSelectMonth }: Props) {
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);
  const updateMonth = useBudgetStore((s) => s.updateMonth);
  const monthFromStore = useBudgetStore((s) => s.currentBudget?.months.find((m) => String(m.id) === String(month?.id)));
  const transactions = monthFromStore?.transactions ?? [];

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

  if (!month) return <div>No month selected</div>;

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 space-y-3">
        <select
          className="w-full border rounded-md px-3 py-2 text-base"
          value={month.id}
          onChange={(e) => {
            const m = budget.months.find((x) => x.id.toString() === e.target.value);
            if (m) onSelectMonth(m);
          }}
        >
          {budget.months.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
          <option value="add">➕ Add Month</option>
        </select>
        <div className="flex justify-between text-center">
          <div className="w-1/2">
            <p className={`text-lg font-semibold px-2 py-1 rounded ${month.startingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              {month.startingBalance?.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            </p>
            <p className="text-xs text-gray-500">Starting</p>
          </div>
          <div className="w-1/2">
            <p className={`text-lg font-semibold px-2 py-1 rounded ${month.closingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              {month.closingBalance?.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            </p>
            <p className="text-xs text-gray-500">Closing</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-24">
        <details className="mb-4">
          <summary className="cursor-pointer py-2 font-medium text-lg border-b flex justify-between">
            <span>Accounts</span>
            <span> {month.accounts.reduce((sum, a) => sum + (isNaN(parseFloat(a.balance)) ? 0 : parseFloat(a.balance)), 0).toLocaleString("en-AU", { style: "currency", currency: "AUD" })}</span>
          </summary>
          <div className="space-y-2 mt-2">
            {month.accounts.map((a) => (
              <div key={a.id} className="border rounded-md p-2 bg-gray-50 flex justify-between">
                <span>{a.name}</span>
                <span>{a.balance.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}</span>
              </div>
            ))}
          </div>
        </details>
        {/* Render existing transactions */}
        {transactions.map((txn) => (
          <TransactionCardMobile key={txn.id} transaction={txn} />
        ))}
        {/* Render new transaction if present */}
        {newTransaction && <TransactionCardMobile key={newTransaction.id} transaction={newTransaction} isNew onDiscard={() => setNewTransaction(null)} onDone={handleDone} />}{" "}
      </main>

      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
        aria-label="Add Transaction"
        onClick={() =>
          setNewTransaction({
            id: "temp-" + Date.now(),
            description: "",
            amount: 0,
            date: new Date().toISOString().substring(0, 10),
            paid: false,
            balance: 0,
            monthId: month.id,
          })
        }
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
