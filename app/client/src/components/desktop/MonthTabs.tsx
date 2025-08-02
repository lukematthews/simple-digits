import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { socket } from "@/lib/socket";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useActiveMonth } from "@/hooks/useActiveMonth";

export default function MonthTabs() {
  const { currentBudget: budget, setActiveMonthId } = useBudgetStore();
  const [activeTab, setActiveTab] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formMonth, setFormMonth] = useState("");
  const [formStarted, setFormStarted] = useState(false);
  const [formCopyAccounts, setFormCopyAccounts] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const month = useActiveMonth();

  useEffect(() => {
    if (month?.id) {
      setActiveTab(`monthtab-${month.id}`);
    }
  }, [month?.id]);

  useEffect(() => {
    if (!month && budget?.months && budget.months.length > 0) {
      const startedMonths = budget.months.filter((m) => m.started);
      const candidates = startedMonths.length > 0 ? startedMonths : budget.months;
      const latest = candidates.reduce((a, b) => (a.position > b.position ? a : b));
      setActiveMonthId(latest.id);
      setActiveTab(`monthtab-${latest.id}`);
    }
  }, [budget?.id, budget?.months.length]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const m = budget?.months.find((m) => `monthtab-${m.id}` === tabId);
    if (m) {
      setActiveMonthId(m.id);
    }
  };

  function handleAddMonth() {
    const name = formMonth.trim();
    if (!name || !budget) return;

    const id = uuid();
    const previousMonth = budget.months.find((m) => selectedMonth === m.id.toString());

    socket.emit("budgetEvent", {
      source: "frontend",
      entity: "month",
      operation: "create",
      id,
      payload: {
        options: {
          copyAccounts: formCopyAccounts,
        },
        month: {
          name,
          started: formStarted,
          position: previousMonth?.position ? previousMonth.position + 1 : budget.months.length + 1,
          budget: budget.id,
        },
      },
    });

    setShowAddModal(false);
    setFormMonth("");
    setFormStarted(false);
  }

  if (!budget) return null;
  if (!month) {
    return <div className="p-4 text-gray-500">No active month selected.</div>;
  }

  return (
    <div className="bg-white flex h-full items-center px-4 space-x-2 overflow-x-auto">
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
                    <SelectItem key={month.id} value={month.id.toString()}>
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
