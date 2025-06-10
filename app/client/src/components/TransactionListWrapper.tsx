import { useEffect, useState } from "react";
import TransactionCard from "./TransactionCard";
import { socket } from "@/lib/socket";
import { Month, Transaction } from "@/types";
import { calculateTransactionBalances } from "@/lib/transactionUtils";

interface Props {
  transactions: Transaction[];
  month: Month;
}

export default function TransactionList({ transactions, month }: Props) {
  const [_transactions, setTransactions] = useState<Transaction[]>(transactions);
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    socket.on("transaction", (message) => {
      const handleMessage = async (message: { client: string; type: "create" | "update" | "delete"; data: any }) => {
        if (message.client !== "api") return;
        if (message.type === "create") {
          setTransactions(await calculateTransactionBalances(month, [...transactions, message.data]));
          setNewTransaction(null); // clear temp card
        } else if (message.type === "update") {
          setTransactions(
            await calculateTransactionBalances(
              month,
              transactions.map((t) => (t.id === message.data.id ? message.data : t))
            )
          );
        } else if (message.type === "delete") {
          setTransactions(
            await calculateTransactionBalances(
              month,
              transactions.filter((t) => t.id !== message.data)
            )
          );
        }
      };
      handleMessage(message);
    });

    const calculate = async () => {
        setTransactions(await calculateTransactionBalances(month, transactions));
    }
    calculate();
    
    return () => {
      socket.off("transaction");
    };
  }, [month, transactions]);

  const handleAdd = () => {
    setNewTransaction({
      id: Date.now(), // temporary ID for React keying
      description: "",
      date: new Date().toISOString().slice(0, 10),
      paid: false,
      amount: 0,
      balance: 0,
      month: month,
    });
  };

  const handleDone = (txn: Transaction) => {
    socket.emit("transaction", {
      client: "frontend",
      type: "create",
      data: { description: txn.description, amount: txn.amount, paid: txn.paid, date: txn.date, month: month.id },
    });
  };

  return (
    <div>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>
        Add Transaction
      </button>

      {_transactions.map((txn) => (
        <TransactionCard key={txn.id} transaction={txn} />
      ))}

      {newTransaction && <TransactionCard key={newTransaction.id} transaction={newTransaction} isNew onDone={handleDone} />}
    </div>
  );
}
