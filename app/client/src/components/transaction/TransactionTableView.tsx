import { useEffect, useState } from "react";
import { Transaction, WsEvent } from "@/types";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import { socket } from "@/lib/socket";
import TransactionCard from "../transaction/TransactionCard";
import TransactionHeader from "../transaction/TransactionHeader";
import { useActiveMonth } from "@/hooks/useActiveMonth";

type Props = {
  transactions: Transaction[];
  showHeader?: boolean;
  onCreate?: (txn: Transaction) => void;
  newTransaction?: Transaction | null;
  clearNewTransaction?: () => void;
};

export default function TransactionTableView({ transactions, showHeader = true, onCreate, newTransaction, clearNewTransaction }: Props) {
  const [calculated, setCalculated] = useState<Transaction[]>([]);
  const month = useActiveMonth();

  useEffect(() => {
    const updated = calculateTransactionBalances(month!, transactions);
    setCalculated(updated);
  }, [transactions]);

  useEffect(() => {
    const handleMessage = (message: WsEvent<Transaction>) => {
      if (message.source !== "api") return;
      if (message.entity !== "transaction") return;
      if (message.operation === "create") {
        clearNewTransaction?.();
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
    clearNewTransaction?.();
    onCreate?.(txn);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {showHeader && (
        <div className="sticky top-0 z-10 bg-white border-b">
          <TransactionHeader />
        </div>
      )}

      <div className="flex flex-col overflow-y-auto">
        {calculated.map((txn) => (
          <TransactionCard key={txn.id} transaction={txn} />
        ))}
        {newTransaction && <TransactionCard key={newTransaction.id} transaction={newTransaction} isNew onDiscard={clearNewTransaction} onDone={handleDone} />}
      </div>
    </div>
  );
}
