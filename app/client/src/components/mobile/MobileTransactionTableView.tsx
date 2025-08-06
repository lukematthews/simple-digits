import { useEffect, useState } from "react";
import { Transaction, WsEvent } from "@/types";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import { socket } from "@/lib/socket";
import TransactionHeader from "../transaction/TransactionHeader";
import { useActiveMonth } from "@/hooks/useActiveMonth";
import TransactionCardMobile from "./TransactionCardMobile";

type Props = {
  transactions: Transaction[];
  showHeader?: boolean;
  onCreate?: (txn: Transaction) => void;
};

export default function MobileTransactionTableView({
  transactions,
  showHeader = true,
}: Props) {
  const [calculated, setCalculated] = useState<Transaction[]>([]);
  const month = useActiveMonth();

  useEffect(() => {
    const updated = calculateTransactionBalances(month!, transactions);
    setCalculated(updated);
  }, [transactions]);

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {showHeader && (
        <div className="sticky top-0 z-10 bg-white border-b">
          <TransactionHeader />
        </div>
      )}

      <div className="flex flex-col overflow-y-auto">
        {calculated.map((txn) => (
          <TransactionCardMobile
            key={txn.id}
            transaction={txn}
            onUpdate={emitUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
