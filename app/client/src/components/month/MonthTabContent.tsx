import { TabsContent } from "@/components/ui/tabs";
import MonthDetail from "./MonthDetail";
import { Month, Transaction, WsEvent } from "@/types";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useBudgetStore } from "@/store/useBudgetStore";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import TransactionCard from "../transaction/TransactionCard";
import TransactionHeader from "../transaction/TransactionHeader";
import AccountManager from "../AccountManager";

type Props = {
  month: Month;
};

export default function MonthTabContent({ month }: Props) {
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
      id: "" + Date.now(),
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
    <TabsContent value={"monthtab-" + month.id}>
      <div className="flex h-screen overflow-hidden">
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="p-2 shrink-0">
            <MonthDetail key={`month-detail-${month.id}`} month={month} onAddTransaction={handleAdd} />
          </div>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="sticky top-0 z-10 bg-white border-b">
              <TransactionHeader />
            </div>
            {month.transactions?.map((txn) => <TransactionCard key={txn.id} transaction={txn} />)}
            {newTransaction && <TransactionCard key={newTransaction.id} transaction={newTransaction} isNew onDiscard={() => setNewTransaction(null)} onDone={handleDone} />}
          </div>
        </div>

        <div className="p-2">
          <AccountManager month={month} />
        </div>
      </div>
    </TabsContent>
  );
}
