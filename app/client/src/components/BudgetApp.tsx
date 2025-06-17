import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MonthTabContent from "./MonthTabContent";
import { socket } from "@/lib/socket";
import { useParams, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

import LoadingSpinner from "./LoadingSpinner";
import { useBudgetStore } from "@/store/useBudgetStore";

export default function BudgetApp() {
  const navigate = useNavigate();
  const params = useParams<{ shortCode?: string; monthName?: string }>();
  const shortCode = params.shortCode;
  const monthShortCode = params.monthName;

  const budgetSummaries = useBudgetStore((s) => s.budgetSummaries);
  const getId = useBudgetStore((s) => s.getBudgetIdByShortCode);
  const budget = useBudgetStore((s) => s.currentBudget);
  const loadBudgetById = useBudgetStore((s) => s.loadBudgetById);
  const loadBudgetSummaries = useBudgetStore((s) => s.loadBudgetSummaries);
  const isBudgetLoading = useBudgetStore((s) => s.isBudgetLoading);
  const [activeMonth, setActiveMonth] = useState<string | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formMonth, setFormMonth] = useState("");
  const [formStarted, setFormStarted] = useState(false);
  const [formCopyAccounts, setFormCopyAccounts] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    if (budgetSummaries.length === 0) {
      loadBudgetSummaries();
    }
  }, []);

  useEffect(() => {
    if (!budget || !monthShortCode) return;

    const matchingMonth = budget.months.find((m) => m.shortCode === monthShortCode);
    if (matchingMonth) {
      setActiveMonth(`monthtab-${matchingMonth.id}`);
    } else {
      // Optionally fallback to latest month
      const latest = budget.months.reduce((a, b) => (a.position > b.position ? a : b));
      if (latest) {
        navigate(`/${shortCode}/${latest.shortCode}`, { replace: true });
      }
    }
  }, [budget, monthShortCode]);

  useEffect(() => {
    if (!shortCode || budgetSummaries.length === 0) return;

    const id = getId(shortCode);
    if (id) {
      loadBudgetById(id);
    }
  }, [shortCode, budgetSummaries, getId, loadBudgetById]);

  // console.log("shortCode:", shortCode);
  // console.log("budgetSummaries:", budgetSummaries);
  // console.log("budgetId:", shortCode ? getId(shortCode) : undefined);
  // console.log("currentBudget:", budget);
  // console.log("isBudgetLoading:", isBudgetLoading);

  if (!shortCode || isBudgetLoading) {
    console.log(`shortCode: ${shortCode} isBudetLoading: ${isBudgetLoading}`);
    return <div>Loading budget...</div>;
  }

  if (!budget) {
    console.log(`budget: ${budget}`);
    return <div>Loading budget... Still no budget</div>;
  }

  // console.log(`We're good. shortCode: ${shortCode} isBudetLoading: ${isBudgetLoading} budget: ${budget}`);

  function handleAddMonth() {
    const name = formMonth.trim();
    if (!name) return;

    const previousMonth = budget?.months.find((m) => selectedMonth === m.id);
    socket.emit("month", {
      client: "frontend",
      type: "create",
      options: {
        copyAccounts: formCopyAccounts,
      },
      data: {
        name,
        started: formStarted,
        position: previousMonth?.position ? previousMonth.position + 1 : (budget?.months?.length ?? 0 + 1),
      },
    });

    setShowAddModal(false);
    setFormMonth("");
    setFormStarted(false);
  }

  if (!budget) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{budget?.name}</h1>
      <Tabs
        value={activeMonth}
        onValueChange={(id) => {
          setActiveMonth(id);
          const month = budget?.months.find((m) => `monthtab-${m.id}` === id);
          if (month) {
            navigate(`/${shortCode}/${month.shortCode}`);
            document.title = `Salary Budget: ${month.name}`;
          }
        }}
      >
        <TabsList>
          {budget.months.map((month) => (
            <TabsTrigger key={"monthtab-" + month.id} value={"monthtab-" + month.id} className="relative group text-xl rounded-xl">
              {month.name}
            </TabsTrigger>
          ))}
          <Button variant="outline" onClick={() => setShowAddModal(true)}>
            + Add Month
          </Button>
        </TabsList>
        {budget.months.map((month) => (
          <MonthTabContent key={"" + month.id} month={month} startingBalance={month.startingBalance} />
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
