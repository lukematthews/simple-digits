import { useEffect, useState } from "react";
import { Transaction, WsEvent } from "@/types";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import { socket } from "@/lib/socket";
import TransactionHeader from "../transaction/TransactionHeader";
import { useActiveMonth } from "@/hooks/useActiveMonth";
import TransactionCardMobile from "./TransactionCardMobile";
import { format } from "date-fns";

type Props = {
  transactions: Transaction[];
  showHeader?: boolean;
  onCreate?: (txn: Transaction) => void;
};

export default function MobileTransactionTableView({ transactions, showHeader = true }: Props) {
  const [calculated, setCalculated] = useState<Transaction[]>([]);
  const month = useActiveMonth();

  useEffect(() => {
    if (month) {
      const updated = calculateTransactionBalances(month, transactions);
      setCalculated(updated);
    }
  }, [transactions, month]);

  const emitUpdate = (transaction: Transaction) => {
    const event: WsEvent<Transaction> = {
      source: "frontend",
      entity: "transaction",
      operation: "update",
      id: transaction.id!,
      payload: transaction,
    };
    socket.emit("budgetEvent", event);
  };

  const handleDelete = (transaction: Transaction) => {
    const event: WsEvent<Transaction> = {
      source: "frontend",
      entity: "transaction",
      operation: "delete",
      id: transaction.id!,
      payload: transaction,
    };
    socket.emit("budgetEvent", event);
  };

  // Group transactions by date into a Map and sort keys
  const groupedTransactions = (() => {
    const map = new Map<string, Transaction[]>();
    for (const txn of calculated) {
      if (!map.has(txn.date)) {
        map.set(txn.date, []);
      }
      map.get(txn.date)!.push(txn);
    }
    return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
  })();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {showHeader && (
        <div className="sticky top-0 z-10 bg-white border-b">
          <TransactionHeader />
        </div>
      )}

      <div className="flex flex-col overflow-y-auto">
        {[...groupedTransactions.entries()].map(([date, txns]) => (
          <section key={date} className="mb-4">
            <h3 className="px-4 py-2 font-semibold sticky top-0 bg-white border-b">{format(date, 'd MMMM yyyy')}</h3>
            {txns.map((txn) => (
              <TransactionCardMobile key={txn.id} transaction={txn} onUpdate={emitUpdate} onDelete={handleDelete} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
