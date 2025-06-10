import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Month } from "@/types";
import MonthTabContent from "./MonthTabContent";
import { socket } from "@/lib/socket";
import { useParams, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function BudgetApp() {
  const { monthName } = useParams();
  const navigate = useNavigate();
  const [months, setMonths] = useState<Month[]>([]);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formMonth, setFormMonth] = useState("");
  const [formStarted, setFormStarted] = useState(false);
  const [formCopyAccounts, setFormCopyAccounts] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(months.length ? months[months.length - 1].id : "");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_HTTP_URL}/month`)
      .then((res) => res.json())
      .then((fetchedMonths) => {
        setMonths(fetchedMonths);
        const targetMonth = fetchedMonths.find((m) => m.name === monthName);
        if (targetMonth) {
          document.title = `Salary Budget: ${targetMonth.name}`;
          setActiveMonth(targetMonth.id);
        } else if (fetchedMonths.length > 0) {
          // fallback to first
          setActiveMonth(fetchedMonths[0].id);
          navigate(`/month/${fetchedMonths[0].name}`, { replace: true });
          document.title = `Salary Budget: ${fetchedMonths[0].name}`;
        }
      });
  }, []);

  function handleAddMonth() {
    const name = formMonth.trim();
    if (!name) return;
    const started = formStarted;

    const previousMonth = months.find((m) => selectedMonth === m.id);
    socket.emit("month", {
      client: "frontend",
      type: "create",
      options: {
        copyAccounts: formCopyAccounts,
      },
      data: {
        name: name,
        started: started,
        position: previousMonth?.position ? previousMonth.position + 1 : months.length + 1,
      },
    });

    setShowAddModal(false);
    setFormMonth("");
    setFormStarted(false);
  }

  function handleDeleteMonth(id: string) {
    console.log(`emitting: 'month' ${JSON.stringify({ client: "frontend", type: "delete", data: id })}`);
    socket.emit("month", { client: "frontend", type: "delete", data: id });
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Budget Tracker</h1>
      <Tabs
        value={activeMonth || undefined}
        onValueChange={(id) => {
          setActiveMonth(id);
          const selected = months.find((m) => m.id === id);
          if (selected) {
            navigate(`/month/${selected.name}`);
            document.title = `Salary Budget: ${selected.name}`;
          }
        }}
      >
        <TabsList>
          {months.map((month) => (
            <TabsTrigger key={month.id} value={month.id} className="relative group">
              {month.name}
              <Trash2
                className="absolute top-0 right-0 w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMonth(month.id);
                }}
              />
            </TabsTrigger>
          ))}
          <Button variant="outline" onClick={() => setShowAddModal(true)}>
            + Add Month
          </Button>
        </TabsList>
        {months.map((month) => {
          return <MonthTabContent key={month.id} monthId={month.id} monthName={month.name} startingBalance={month.startingBalance} transactions={month.transactions} month={month} />;
        })}
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
              <Select></Select>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={`month-select-${month.id}`} value={month.id}>
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
