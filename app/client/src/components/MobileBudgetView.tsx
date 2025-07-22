// src/components/MobileBudgetView.tsx
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Budget, Month, Transaction, Account, WsEvent } from "@/types";
import { useBudgetStore } from "@/store/useBudgetStore";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import TransactionCardMobile from "./transaction/TransactionCardMobile";
import { CurrencyCellInput } from "./CurrencyCellInput";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { v4 as uuid } from "uuid";
import { socket } from "@/lib/socket";
import { motion } from "framer-motion";
import { useRef } from "react";

function sumAccountBalances(accounts: { balance: number | string }[]): string {
  const total = accounts?.reduce((sum, a) => {
    const value = typeof a.balance === "string" ? parseFloat(a.balance) : a.balance;
    return sum + (isNaN(value) ? 0 : value);
  }, 0) ?? 0;

  return total.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

interface Props {
  month: Month | null;
  budget: Budget;
  onSelectMonth: (month: Month) => void;
  onCreateTransaction: (tx: { description: string; amount: number; date: string }) => void;
}

export default function MobileBudgetView({ month, budget, onSelectMonth }: Props) {
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formMonth, setFormMonth] = useState("");
  const [formStarted, setFormStarted] = useState(false);
  const [formCopyAccounts, setFormCopyAccounts] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const updateMonth = useBudgetStore((s) => s.updateMonth);
  const monthFromStore = useBudgetStore((s) => s.currentBudget?.months.find((m) => String(m.id) === String(month?.id)));
  const transactions = monthFromStore?.transactions ?? [];

  const newTransactionRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (newTransaction) {
      setTimeout(() => {
        newTransactionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50); // slight delay to allow rendering
    }
  }, [newTransaction]);

  useEffect(() => {
    if (monthFromStore) {
      const updated = {
        ...monthFromStore,
        transactions: calculateTransactionBalances(monthFromStore, transactions),
      };
      updateMonth(updated);
    }
  }, [transactions.length, monthFromStore?.startingBalance]);

  useEffect(() => {
    const handleMessage = (message: WsEvent<Transaction>) => {
      if (message.source !== "api") return;
      if (message.entity !== "transaction") return;
      if (message.operation === "create") {
        setNewTransaction(null);
      }
    };

    socket.on("budgetEvent", handleMessage);
    return () => {
      socket.off("budgetEvent", handleMessage);
    };
  }, []);

  const handleDone = (txn: Transaction) => {
    const event: WsEvent<Transaction> = {
      source: "frontend",
      entity: "transaction",
      operation: "create",
      payload: {
        date: txn.date,
        description: txn.description,
        amount: txn.amount,
        paid: txn.paid,
        monthId: txn.monthId,
      },
    };
    socket.emit("budgetEvent", event);
    setNewTransaction(null);
  };

  const handleAccountChange = (id: string, field: "name" | "balance", value: string | number) => {
    if (!month) return;
    const updatedAccounts = month.accounts.map((a) => (a.id === id ? { ...a, [field]: field === "balance" ? parseFloat(value as string) || 0 : value } : a));
    const updatedMonth = { ...month, accounts: updatedAccounts };
    updateMonth(updatedMonth);

    const account = updatedAccounts.find((a) => a.id === id);
    if (account) {
      const event: WsEvent<Account> = {
        source: "frontend",
        entity: "account",
        operation: "update",
        id: account.id!,
        payload: account,
      };
      socket.emit("budgetEvent", event);
    }
  };

  const handleAddMonth = () => {
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
  };

  if (!month) return <div>No month selected</div>;

  return (
    <div className="h-screen flex flex-col bg-white">
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
      <header className="sticky top-0 z-10 bg-blue-100 bg-opacity-80 shadow-sm px-0 py-0 space-y-3">
        <select
          className="w-full border rounded-md px-3 py-2 text-base"
          name="month-select"
          value={month.id}
          onChange={(e) => {
            if (e.target.value === "add") return setShowAddModal(true);
            const m = budget.months.find((x) => x.id.toString() === e.target.value);
            if (m) onSelectMonth(m);
          }}
        >
          {budget.months.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
          <option value="add">➕ Add Month</option>
        </select>

        <div className="flex justify-between text-center">
          <div className="w-1/2">
            <p className={`text-md font-semibold py-1 rounded ${month.startingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              {month.startingBalance?.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            </p>
          </div>
          <div className="w-1/2">
            <p className={`text-md font-semibold py-1 rounded ${month.closingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              {month.closingBalance?.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            </p>
          </div>
        </div>
      </header>
      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto px-1 pb-24">
        <details className="mb-4 px-2">
          <summary className="cursor-pointer py-2 font-medium text-lg border-b flex justify-between">
            <span>Accounts</span>
            <span>{sumAccountBalances(month.accounts)}</span>
          </summary>
          <div className="space-y-2 mt-2">
            {month.accounts?.map((a) => (
              <div key={a.id} className="border rounded-md p-2 bg-gray-50 flex justify-between gap-2">
                <input className="flex-1 border rounded px-2 py-1" value={a.name} onChange={(e) => handleAccountChange(a.id!, "name", e.target.value)} />
                <CurrencyCellInput placeholder="0.00" value={a.balance ?? ""} onChange={(v) => handleAccountChange(a.id!, "balance", v)} />
              </div>
            ))}
          </div>
        </details>
        {transactions.map((txn) => (
          <TransactionCardMobile
            key={txn.id}
            transaction={txn}
            isNew={newTransaction?.id === txn.id}
            autoFocus={newTransaction?.id === txn.id}
            onDiscard={() => setNewTransaction(null)}
            onDone={handleDone}
          />
        ))}
        {newTransaction && (
          <motion.div ref={newTransactionRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TransactionCardMobile key={newTransaction.id} transaction={newTransaction} isNew autoFocus onDiscard={() => setNewTransaction(null)} onDone={handleDone} />
          </motion.div>
        )}
      </main>
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
        aria-label="Add Transaction"
        onClick={() =>
          setNewTransaction({
            id: "temp-" + Date.now(),
            description: "",
            amount: 0,
            date: new Date().toISOString().substring(0, 10),
            paid: false,
            balance: 0,
            monthId: month.id,
          })
        }
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
