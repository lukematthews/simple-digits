import { TabsContent } from "@/components/ui/tabs";
import MonthDetail from "./MonthDetail";
import AccountManager from "./AccountManager";
import TransactionList from "./TransactionListWrapper";
import { Month } from "@/types";

type Props = {
  month: Month;
};

export default function MonthTabContent({ month }: Props) {

  return (
    <TabsContent value={"monthtab-"+month.id}>
      <div className="flex h-screen">
        <div className="flex flex-col flex-grow">
          <div className="p-2">
            <MonthDetail key={`month-detail-${month.id}`} month={month}></MonthDetail>
          </div>
          <div className="flex-grow p-2">
            <TransactionList month={month}></TransactionList>
          </div>
        </div>
        <div className="p-2">
          <AccountManager month={month}></AccountManager>
        </div>
      </div>
    </TabsContent>
  );
}
