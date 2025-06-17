import { TabsContent } from "@/components/ui/tabs";
import MonthDetail from "./MonthDetail";
import AccountManager from "./AccountManager";
import TransactionList from "./TransactionListWrapper";
import { useEffect, useState } from "react";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import { Month } from "@/types";

type Props = {
  startingBalance: number;
  month: Month;
};

export default function MonthTabContent({ month }: Props) {
  const [calculated, setCalculated] = useState(month.transactions);

  useEffect(() => {
    const calculate = async () => {
      setCalculated(await calculateTransactionBalances(month, month.transactions));
    };
    calculate();
  }, [month]);

  return (
    <TabsContent value={"monthtab-"+month.id}>
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
