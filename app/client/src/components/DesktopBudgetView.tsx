import { useState } from "react";
import { Budget, Month } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthTabContent from "./MonthTabContent";
import { ProfileMenu } from "./ProfileMenu";

type Props = {
  budget: Budget;
  month: Month | null;
  onSelectMonth: (m: { id: string; shortCode: string; name: string }) => void;
  onCreateTransaction: (tx: { description: string; amount: number; date: string }) => void;
};

export default function DesktopBudgetView({ budget, month, onSelectMonth }: Props) {
  const [activeTab, setActiveTab] = useState<string>(month ? `monthtab-${month.id}` : "");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const m = budget.months.find((m) => `monthtab-${m.id}` === tabId);
    if (m) {
      onSelectMonth({ id: m.id, shortCode: m.shortCode, name: m.name });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left: Budget Name */}
        <div>{budget?.name && <h1 className="text-xl font-bold text-gray-700">{budget.name}</h1>}</div>

        {/* Right: App Name + Profile */}
        <div className="flex items-center gap-x-4">
          <h2 className="text-2xl font-semibold text-gray-800">Simple Digits</h2>
          <ProfileMenu />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {budget.months.map((month) => (
            <TabsTrigger key={month.id} value={`monthtab-${month.id}`} className="text-xl rounded-xl">
              {month.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {budget.months.map((m) => (
          <MonthTabContent key={m.id} month={m} />
        ))}
      </Tabs>
    </div>
  );
}
