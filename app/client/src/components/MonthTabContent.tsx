import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Transaction, Month } from "@/types";
import MonthDetail from "./MonthDetail";
import AccountManager from "./AccountManager";
import TransactionCard from "./TransactionCard";

function calculateRunningBalance(transactions: Transaction[], startingBalance: number): Transaction[] {
  let balance = startingBalance;
  return transactions.map((txn) => {
    const amount = txn.amount || 0;
    const newBalance = txn.paid ? balance : (balance += amount);
    return {
      ...txn,
      balance: newBalance,
    };
  });
}

function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return dateDiff !== 0 ? dateDiff : b.amount - a.amount;
  });
}

type Props = {
  monthId: string;
  monthName: string;
  startingBalance: number;
  transactions: Transaction[];
  month: Month;
  // onAddTransaction: () => void;
};

export default function MonthTabContent({ month, monthId, transactions, }: Props) {
  if (month.started) {
    month.startingBalance = month.accounts.reduce((sum, acc) => sum + (acc.balance ?? 0), 0);
  }
  const sorted = sortTransactions(transactions);
  const calculated = calculateRunningBalance(sorted, month.startingBalance);

  return (
    <TabsContent value={monthId}>
      <div className="flex h-screen">
        <div className="flex flex-col flex-grow">
          <div className="bg-blue-100 p-2">
            <MonthDetail key={`month-detail-${month.id}`} month={month}></MonthDetail>
          </div>
          <div className="flex-grow p-2">
            <div className="mb-4">
              <Button>Add Transaction</Button>
            </div>
            {calculated.map((txn) => (
              <TransactionCard transaction={txn}></TransactionCard>
            ))}
          </div>
        </div>
        <div className="bg-gray-300 p-2">
          <AccountManager accounts={month.accounts}></AccountManager>
        </div>
      </div>
    </TabsContent>
  );
}
