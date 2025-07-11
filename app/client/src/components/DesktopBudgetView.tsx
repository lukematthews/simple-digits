import { useState } from "react";
import { Budget, Month } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthTabContent from "./MonthTabContent";
import { ProfileMenu } from "./ProfileMenu";
import { socket } from "@/lib/socket";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type Props = {
  budget: Budget;
  month: Month | null;
  onSelectMonth: (m: { id: string; shortCode: string; name: string }) => void;
  onCreateTransaction: (tx: { description: string; amount: number; date: string }) => void;
};

export default function DesktopBudgetView({ budget, month, onSelectMonth }: Props) {
  const [activeTab, setActiveTab] = useState<string>(month ? `monthtab-${month.id}` : "");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formMonth, setFormMonth] = useState("");
  const [formStarted, setFormStarted] = useState(false);
  const [formCopyAccounts, setFormCopyAccounts] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const m = budget.months.find((m) => `monthtab-${m.id}` === tabId);
    if (m) {
      onSelectMonth({ id: m.id, shortCode: m.shortCode, name: m.name });
    }
  };

  function handleAddMonth() {
    const name = formMonth.trim();
    if (!name) return;
    const id = uuid();
    const previousMonth = budget?.months.find((m) => selectedMonth === "" + m.id);
    socket.emit("budgetEvent", {
      source: "frontend",
      entity: "month",
      operation: "create",
      id: id,
      payload: {
        options: {
          copyAccounts: formCopyAccounts,
        },
        month: {
          name: name,
          started: formStarted,
          position: previousMonth?.position ? previousMonth.position + 1 : (budget?.months?.length ?? 0 + 1),
          budget: budget?.id,
        },
      },
    });

    setShowAddModal(false);
    setFormMonth("");
    setFormStarted(false);
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center py-4">
        {/* Left: Budget Name */}
        <div>{budget?.name && <h1 className="text-3xl font-bold text-gray-700">{budget.name}</h1>}</div>

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
          <Button variant="outline" onClick={() => setShowAddModal(true)}>
            + Add Month
          </Button>
        </TabsList>

        {budget.months.map((m) => (
          <MonthTabContent key={m.id} month={m} />
        ))}
      </Tabs>
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Month</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Month Name" value={formMonth} onChange={(e) => setFormMonth(e.target.value)} />
            <div className="flex items-center gap-2">
              <Checkbox checked={formStarted} onCheckedChange={(checked) => setFormStarted(Boolean(checked))} />
              <Label>Started</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={formCopyAccounts} onCheckedChange={(checked) => setFormCopyAccounts(Boolean(checked))} />
              <Label>Copy accounts from previous month</Label>
            </div>

            <div className="flex items-center gap-2">
              <Label>Previous month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a month" />
                </SelectTrigger>
                <SelectContent>
                  {budget.months.map((month) => (
                    <SelectItem key={`month-select-${month.id}`} value={"" + month.id}>
                      {month.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddMonth}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
