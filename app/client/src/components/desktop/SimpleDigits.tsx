import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useEffect, useRef, useState } from "react";
import { calculateMonthBalances } from "@/lib/monthUtils";
import LoadingSpinner from "../LoadingSpinner";
import MonthTabs from "./MonthTabs";
import MonthDetail from "../month/MonthDetail";
import { useActiveMonth } from "@/hooks/useActiveMonth";
import TransactionTableView from "../transaction/TransactionTableView";
import { Transaction } from "@/types";

export default function SimpleDigits() {
  const navigate = useNavigate();
  const params = useParams<{ shortCode?: string; monthName?: string }>();
  const location = useLocation();
  const shortCode = params.shortCode || "";
  const monthShortCode = params.monthName;

  const budgetSummaries = useBudgetStore((s) => s.budgetSummaries);
  const getBudgetIdByShortCode = useBudgetStore((s) => s.getBudgetIdByShortCode);
  const loadBudgetSummaries = useBudgetStore((s) => s.loadBudgetSummaries);
  const loadBudgetById = useBudgetStore((s) => s.loadBudgetById);
  const budget = useBudgetStore((s) => s.currentBudget);
  const isBudgetLoading = useBudgetStore((s) => s.isBudgetLoading);

  const setActiveMonthId = useBudgetStore((s) => s.setActiveMonthId);
  const activeMonth = useActiveMonth();

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

  const hasSetInitialMonth = useRef(false);

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
    hasSetInitialMonth.current = false;
  }, [location.pathname]);

  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);

  const handleAddTransaction = () => {
    if (!activeMonth) return;
    setNewTransaction({
      id: "" + Date.now(),
      description: "",
      date: new Date().toISOString().slice(0, 10),
      paid: false,
      amount: 0,
      balance: 0,
      monthId: activeMonth.id,
    });
  };

  if (isBudgetLoading || !budget || !activeMonth) return <LoadingSpinner />;

  return (
    <div className="bg-background flex h-screen w-screen flex-col overflow-hidden max-w-screen-xl mx-auto">
      <div className="h-16 shrink-0 overflow-hidden">
        <Header />
      </div>
      <div className="shrink-0 border-b" style={{ height: "5rem" }}>
        <MonthTabs />
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className="flex flex-1 min-h-0 overflow-hidden p-4">
          <div className="flex h-full w-full flex-col rounded border p-4">
            <MonthDetail onAddTransaction={handleAddTransaction} />
            <TransactionTableView transactions={activeMonth.transactions} newTransaction={newTransaction} clearNewTransaction={() => setNewTransaction(null)} />
          </div>
        </main>
      </div>
    </div>
  );
}
