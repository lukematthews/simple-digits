import { TabsContent } from "@/components/ui/tabs";
import MonthDetail from "./MonthDetail";
import AccountManager from "./AccountManager";
import TransactionList from "./TransactionListWrapper";
import { Month, Transaction } from "@/types";
import { useState } from "react";

type Props = {
  month: Month;
};

export default function MonthTabContent({ month }: Props) {
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);

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

  return (
    <TabsContent value={"monthtab-" + month.id}>
      <div className="flex h-screen">
        <div className="flex flex-col flex-grow">
          <div className="p-2">
            <MonthDetail key={`month-detail-${month.id}`} month={month} onAddTransaction={handleAdd}></MonthDetail>
          </div>
          <div className="flex-grow p-0 h-full">
            <TransactionList month={month} newTransaction={newTransaction} setNewTransaction={setNewTransaction} />
          </div>
        </div>
        <div className="p-2">
          <AccountManager month={month}></AccountManager>
        </div>
      </div>
    </TabsContent>
  );
}
