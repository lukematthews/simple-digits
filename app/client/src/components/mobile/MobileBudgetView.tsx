import { useEffect, useState } from "react";
import { CircleChevronDown, Plus } from "lucide-react";
import { Transaction, Account, WsEvent, Month } from "@/types";
import { useBudgetStore } from "@/store/useBudgetStore";
import { CurrencyCellInput } from "../CurrencyCellInput";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { v4 as uuid } from "uuid";
import { socket } from "@/lib/socket";
import { useRef } from "react";
import { useActiveMonth } from "@/hooks/useActiveMonth";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { calculateMonthBalances } from "@/lib/monthUtils";
import Header from "../desktop/Header";
import { calculateTransactionBalances } from "@/lib/transactionUtils";
import MobileTransactionTableView from "./MobileTransactionTableView";
import { TransactionEditModal } from "./TransactionEditModal";
import { SelectIcon } from "@radix-ui/react-select";

function sumAccountBalances(accounts: { balance: number | string }[]): string {
  const total =
    accounts?.reduce((sum, a) => {
      const value = typeof a.balance === "string" ? parseFloat(a.balance) : a.balance;
      return sum + (isNaN(value) ? 0 : value);
    }, 0) ?? 0;

  return total.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

export default function MobileBudgetView() {
  const navigate = useNavigate();
  const { currentBudget: budget, setActiveMonthId } = useBudgetStore();
  const month = useActiveMonth();
  const params = useParams<{ shortCode?: string; monthName?: string }>();
  const location = useLocation();
  const shortCode = params.shortCode || "";
  const monthShortCode = params.monthName;
  const hasSetInitialMonth = useRef(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formMonth, setFormMonth] = useState("");
  const [formStarted, setFormStarted] = useState(false);
  const [formCopyAccounts, setFormCopyAccounts] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [accountsExpanded, setAccountsExpanded] = useState(false);

  const updateMonth = useBudgetStore((s) => s.updateMonth);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const budgetSummaries = useBudgetStore((s) => s.budgetSummaries);
  const getBudgetIdByShortCode = useBudgetStore((s) => s.getBudgetIdByShortCode);
  const loadBudgetSummaries = useBudgetStore((s) => s.loadBudgetSummaries);
  const loadBudgetById = useBudgetStore((s) => s.loadBudgetById);

  useEffect(() => {
    const run = async () => {
      if (budgetSummaries.length === 0) {
        await loadBudgetSummaries();
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!shortCode || budgetSummaries.length === 0) return;
    const id = getBudgetIdByShortCode(shortCode);
    if (id) loadBudgetById(id);
  }, [shortCode, budgetSummaries]);

  useEffect(() => {
    if (!budget || hasSetInitialMonth.current || budget.months.length === 0) return;

    calculateMonthBalances(budget.months);

    if (monthShortCode) {
      const m = budget.months.find((x) => x.shortCode === monthShortCode);
      if (m) {
        setActiveMonthId(m.id);
        hasSetInitialMonth.current = true;
      }
    } else {
      const startedMonths = budget.months.filter((m) => m.started);
      const candidateMonths = startedMonths.length > 0 ? startedMonths : budget.months;

      if (candidateMonths.length > 0) {
        const latest = candidateMonths.reduce((a, b) => (a.position > b.position ? a : b));

        setActiveMonthId(latest.id);
        navigate(`/b/${shortCode}/${latest.shortCode}`, { replace: true });
        hasSetInitialMonth.current = true;
      }
    }
  }, [budget, location.pathname]);

  useEffect(() => {
    if (month) {
      const updated = {
        ...month,
        transactions: calculateTransactionBalances(month, month.transactions),
      };
      updateMonth(updated);
    }
  }, [month?.transactions.length, month?.startingBalance]);

  const onSelectMonth = (m: Month) => {
    if (!budget) {
      return;
    }
    setActiveMonthId(m.id);
    navigate(`/b/${budget.shortCode}/${m.shortCode}`);
    document.title = `${budget.name}: ${m.name}`;
  };

  const handleAccountChange = (id: string, field: "name" | "balance", value: string | number) => {
    if (!month) return;
    const updatedAccounts = month.accounts.map((a) => (a.id === id ? { ...a, [field]: field === "balance" ? parseFloat(value as string) || 0 : value } : a));
    const updatedMonth = { ...month, accounts: updatedAccounts };
    updateMonth(updatedMonth);
  };

  const handleAccountChangeEmitEvent = (id: string, field: "name" | "balance", value: string | number) => {
    if (!month) return;
    const updatedAccounts = month.accounts.map((a) => (a.id === id ? { ...a, [field]: field === "balance" ? parseFloat(value as string) || 0 : value } : a));
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

  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnDraft, setTxnDraft] = useState<Transaction | null>(null);

  const handleAddTransaction = () => {
    setTxnDraft({
      id: "-1",
      description: "",
      amount: 0,
      date: new Date().toISOString().substring(0, 10),
      paid: false,
      balance: 0,
      monthId: month!.id,
    });
    setShowTxnModal(true);
  };

  const handleTransactionDone = () => {
    setShowTxnModal(false);
    setTxnDraft(null);
  };

  const emitCreateTransaction = (transaction: Transaction) => {
    const event: WsEvent<Transaction> = {
      source: "frontend",
      entity: "transaction",
      operation: "create",
      payload: transaction,
    };
    socket.emit("budgetEvent", event);
  };

  if (!budget) return <div>No budget selected</div>;
  if (!month) return <div>No month selected</div>;

  return (
    <div className="flex flex-col w-full" style={{ height: "calc(var(--vh, 1vh) * 100)" }}>
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
      <header className="sticky top-0 z-10 bg-opacity-80 shadow-sm px-0 py-0 space-y-3">
        <Header></Header>
        <Select
          value={month.id.toString()}
          onValueChange={(value) => {
            if (value === "add") {
              setShowAddModal(true);
            } else {
              const m = budget.months.find((x) => x.id.toString() === value);
              if (m) onSelectMonth(m);
            }
          }}
        >
          <SelectTrigger className="w-full [&>svg]:hidden">
            <SelectValue placeholder="Select month" />
            <SelectIcon>
              <CircleChevronDown></CircleChevronDown>
            </SelectIcon>
          </SelectTrigger>
          <SelectContent>
            {budget.months.map((m) => (
              <SelectItem key={m.id} value={m.id.toString()}>
                {m.name}
              </SelectItem>
            ))}
            <SelectItem value="add">➕ Add Month</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex justify-between text-center">
          <div className="w-1/2">
            <p className={`text-md text-black font-semibold py-1 rounded ${month.startingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              {month.startingBalance?.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            </p>
          </div>
          <div className="w-1/2">
            <p className={`text-md text-black font-semibold py-1 rounded ${month.closingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              {month.closingBalance?.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            </p>
          </div>
        </div>
      </header>
      <main ref={scrollContainerRef} className="overflow-y-auto px-1 pb-24" style={{ height: "calc((var(--vh, 1vh) * 100) - 96px)" }}>
        <details open={accountsExpanded} onToggle={(e) => setAccountsExpanded(e.currentTarget.open)} className="mb-4 px-2 relative w-full">
          <summary className="cursor-pointer py-2 font-medium text-lg border-b flex justify-between items-center">
            <span>Accounts</span>
            {!month.accounts || month.accounts.length === 0 ? (
              <button
                onClick={() => {
                  const newAccount: Account = {
                    id: uuid(),
                    name: "",
                    balance: 0,
                    monthId: month.id,
                  };
                  const event: WsEvent<Account> = {
                    source: "frontend",
                    entity: "account",
                    operation: "create",
                    payload: newAccount,
                  };
                  socket.emit("budgetEvent", event);
                  setAccountsExpanded(true);
                }}
                className="ml-2 rounded-full p-1 text-blue-600 hover:bg-blue-100"
                aria-label="Add Account"
              >
                <Plus size={20} />
              </button>
            ) : (
              <span>{sumAccountBalances(month.accounts)}</span>
            )}
          </summary>
          <div className="w-full space-y-2 mt-2">
            {month.accounts?.map((a) => (
              <div key={a.id} className="border rounded-md p-2 bg-gray-50 flex justify-between gap-2">
                <input
                  className="flex-1 border rounded px-2 py-1"
                  value={a.name}
                  onChange={(e) => {
                    handleAccountChange(a.id!, "name", e.target.value);
                  }}
                  onBlur={(e) => handleAccountChange(a.id!, "name", e.target.value)}
                />
                <CurrencyCellInput
                  placeholder="0.00"
                  value={a.balance ?? ""}
                  onChange={(v) => handleAccountChange(a.id!, "balance", v)}
                  onBlur={(v) => handleAccountChangeEmitEvent(a.id!, "balance", v)}
                />
              </div>
            ))}
          </div>

          {month.accounts.length > 0 && (
            <div className="absolute right-2 -bottom-6">
              <button
                onClick={() => {
                  const newAccount: Account = {
                    name: "",
                    balance: 0,
                    monthId: month.id,
                  };
                  const event: WsEvent<Account> = {
                    source: "frontend",
                    entity: "account",
                    operation: "create",
                    payload: newAccount,
                  };
                  socket.emit("budgetEvent", event);
                  setAccountsExpanded(true);
                }}
                className="rounded-full p-2 bg-blue-600 text-white shadow hover:bg-blue-700"
                aria-label="Add Account"
              >
                <Plus size={20} />
              </button>
            </div>
          )}
        </details>
        <MobileTransactionTableView transactions={month.transactions} showHeader={false} onCreate={handleTransactionDone} />
      </main>
      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center" aria-label="Add Transaction" onClick={handleAddTransaction}>
        <Plus size={28} />
      </button>
      {showTxnModal && txnDraft && (
        <TransactionEditModal
          transaction={txnDraft}
          isNew
          onClose={() => {
            setShowTxnModal(false);
            setTxnDraft(null);
          }}
          onDone={(trxn) => {
            handleTransactionDone();
            emitCreateTransaction(trxn);
          }}
          onDiscard={() => {
            setShowTxnModal(false);
            setTxnDraft(null);
          }}
        />
      )}
    </div>
  );
}
