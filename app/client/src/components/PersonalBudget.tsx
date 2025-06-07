import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
// import CurrencyInput from "react-currency-input-field";
import { Month } from "@/types";
// import { Transaction } from "@/types";
import MonthTabContent from "./MonthTabContent";
import { socket } from "@/lib/socket";
// import { getLocalDateString } from "@/lib/utils";

export default function BudgetApp() {
  const [months, setMonths] = useState<Month[]>([]);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formMonth, setFormMonth] = useState("");
  const [formStarted, setFormStarted] = useState(false);
  const [formAccountsTotal, setFormAccountsTotal] = useState("");
  // const [showTxnModal, setShowTxnModal] = useState(false);
  // const [txnForm, setTxnForm] = useState<Transaction>({ id: null, description: "", date: getLocalDateString(), amount: 0, paid: false, balance: null });
  // const [editTxnId, setEditTxnId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_HTTP_URL}/month`)
      .then((res) => res.json())
      .then((fetchedMonths) => {
        setMonths(fetchedMonths);
        if (fetchedMonths.length > 0) {
          setActiveMonth(fetchedMonths[0].id); // set the first month as active
        }
      });
    socket.on("transaction", (message) => {
      console.log(`received transaction message ${JSON.stringify(message)}`);
      if (message.client !== "api") {
        return;
      }
      if (message.type === "create") {
        // setAccounts((prev) => [...prev, message.data]);
      } else if (message.type === "delete") {
        // setAccounts((prev) => prev.filter((a) => a.id !== message.data));
      } else if (message.type === "update") {
        // setAccounts((prev) => prev.map((a) => (a.id === message.data.id ? message.data : a)));
        // handleEditTransaction(message.data);
      }
    });
  }, []);

  function handleAddMonth() {
    const name = formMonth.trim();
    if (!name) return;
    const started = formStarted;
    const accountsTotal = parseFloat(formAccountsTotal) || 0;

    fetch(`${import.meta.env.VITE_API_HTTP_URL}/month`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, started, startingBalance: accountsTotal }),
    })
      .then((res) => res.json())
      .then((newMonth) => {
        setMonths([...months, newMonth]);
        setActiveMonth(newMonth.id);
      });

    setShowAddModal(false);
    setFormMonth("");
    setFormStarted(false);
    setFormAccountsTotal("");
  }

  function handleDeleteMonth(id: string) {
    console.log(`emitting: 'month' ${JSON.stringify({ client: 'frontend', type: "delete", data: id })}`)
    socket.emit("month", { client: 'frontend', type: "delete", data: id });
  }

  // function handleEditTransaction(txn: Transaction) {
  //   setTxnForm(txn);
  //   setEditTxnId(txn.id!);
  //   // setShowTxnModal(true);
  // }

  // function handleDeleteTransaction(txnId: number) {
  //   if (!activeMonth) return;
  //   socket.emit("transaction", { client: "frontend", type: "delete", data: txnId });

  //   // fetch(`${API_BASE}/month/${activeMonth}/transaction/${txnId}`, { method: "DELETE" })
  //   //   .then((res) => res.json())
  //   //   .then((updatedMonth) => {
  //   //     setMonths(months.map((m) => (m.id === activeMonth ? updatedMonth : m)));
  //   //   });
  // }

  // function handleAddOrUpdateTransaction() {
  //   if (!activeMonth) return;
  //   const { description, date, amount, paid } = txnForm;
  //   if (!description || !date || isNaN(parseFloat(amount.toString()))) return;

  //   const type = editTxnId ? "update" : "create";
  //   socket.emit("transaction", { client: "frontend", type: type, data: { id: editTxnId, description, date, amount, paid, month: activeMonth } });
  //   // fetch(endpoint, {
  //   //   method,
  //   //   headers: { "Content-Type": "application/json" },
  //   //   body: JSON.stringify({ description, date, amount, paid }),
  //   // })
  //   //   .then((res) => res.json())
  //   //   .then((updatedMonth) => {
  //   //     setMonths(months.map((m) => (m.id === activeMonth ? updatedMonth : m)));
  //   //   });

  //   setTxnForm({ id: null, description: "", date: "", amount: 0, paid: false, balance: null });
  //   setEditTxnId(null);
  //   setShowTxnModal(false);
  // }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Budget Tracker</h1>
      <Tabs value={activeMonth || undefined} onValueChange={setActiveMonth}>
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
          return (
            <MonthTabContent
              key={month.id}
              monthId={month.id}
              monthName={month.name}
              startingBalance={month.startingBalance}
              transactions={month.transactions}
              month={month}
              // onAddTransaction={() => setShowTxnModal(true)}
            />
          );
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
              <Label>Previous month</Label>
              <select>
                {months.map((month, index) => {
                  return (
                    <option key={`month-select-${month.id}`} selected={index + 1 === months.length}>
                      {month.name}
                    </option>
                  );
                })}
              </select>
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

      {/* <Dialog open={showTxnModal} onOpenChange={setShowTxnModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTxnId ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Description" value={txnForm.description} onChange={(e) => setTxnForm({ ...txnForm, description: e.target.value })} />
            <Input placeholder="Date" type="date" value={txnForm.date} onChange={(e) => setTxnForm({ ...txnForm, date: e.target.value })} />
            <CurrencyInput
              value={txnForm.amount}
              decimalsLimit={2}
              allowDecimals
              allowNegativeValue={true}
              onValueChange={(_value, _name, values) => setTxnForm({ ...txnForm, amount: values?.float ?? 0 })}
              prefix="$"
              className="border border-input rounded-md px-3 py-2 w-full"
            />
            <div className="flex items-center gap-2">
              <Checkbox checked={txnForm.paid} onCheckedChange={(checked) => setTxnForm({ ...txnForm, paid: Boolean(checked) })} />
              <Label>Paid</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddOrUpdateTransaction}>{editTxnId ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
