import { TabsContent } from "@/components/ui/tabs";
import { Transaction, Month } from "@/types";
import MonthDetail from "./MonthDetail";
import AccountManager from "./AccountManager";
import TransactionList from "./TransactionListWrapper";
import { useEffect, useState } from "react";
import { calculateTransactionBalances } from "@/lib/transactionUtils";


type Props = {
  monthId: string;
  monthName: string;
  startingBalance: number;
  transactions: Transaction[];
  month: Month;
};

export default function MonthTabContent({ month, monthId, transactions }: Props) {
  const [calculated, setCalculated] = useState(transactions);

  useEffect(() => {
    const calculate = async () => {
      setCalculated(await calculateTransactionBalances(month, transactions));
    };
    calculate();
  }, [month, transactions]);

  return (
    <TabsContent value={monthId}>
      <div className="flex h-screen">
        <div className="flex flex-col flex-grow">
          <div className="p-2">
            <MonthDetail key={`month-detail-${month.id}`} month={month}></MonthDetail>
          </div>
          <div className="flex-grow p-2">
            <TransactionList transactions={calculated} month={month}></TransactionList>
          </div>
        </div>
        <div className="p-2">
          <AccountManager accounts={month.accounts}></AccountManager>
        </div>
      </div>
    </TabsContent>
  );
}
