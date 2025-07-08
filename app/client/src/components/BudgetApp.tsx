// src/components/BudgetApp.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "@/lib/socket";
import { calculateMonthBalances } from "@/lib/monthUtils";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileBudgetView from "./MobileBudgetView";
import LoadingSpinner from "./LoadingSpinner";
import DesktopBudgetView from "./DesktopBudgetView";

export default function BudgetApp() {
  const navigate = useNavigate();
  const params = useParams<{ shortCode?: string; monthName?: string }>();
  const shortCode = params.shortCode || "";
  const monthShortCode = params.monthName;

  const budgetSummaries = useBudgetStore((s) => s.budgetSummaries);
  const getBudgetIdByShortCode = useBudgetStore((s) => s.getBudgetIdByShortCode);
  const loadBudgetSummaries = useBudgetStore((s) => s.loadBudgetSummaries);
  const loadBudgetById = useBudgetStore((s) => s.loadBudgetById);
  const budget = useBudgetStore((s) => s.currentBudget);
  const isBudgetLoading = useBudgetStore((s) => s.isBudgetLoading);
  const isMobile = useIsMobile();

  const [activeMonthId, setActiveMonthId] = useState<string | null>(null);

  const activeMonth = budget?.months.find((m) => m.id === activeMonthId) ?? null;

  useEffect(() => {
    if (budgetSummaries.length === 0) {
      loadBudgetSummaries();
    }
  }, []);

  useEffect(() => {
    if (!shortCode || budgetSummaries.length === 0) return;
    const id = getBudgetIdByShortCode(shortCode);
    if (id) loadBudgetById(id);
  }, [shortCode, budgetSummaries]);

  useEffect(() => {
    if (!budget) return;
    calculateMonthBalances(budget.months);

    if (monthShortCode) {
      const m = budget.months.find((x) => x.shortCode === monthShortCode);
      if (m) setActiveMonthId(m.id);
    } else if (budget.months.length > 0) {
      const latest = budget.months.reduce((a, b) => (a.position > b.position ? a : b));
      setActiveMonthId(latest.id);
      navigate(`/b/${shortCode}/${latest.shortCode}`, { replace: true });
    }
  }, [budget, monthShortCode]);

  if (isBudgetLoading || !budget) return <LoadingSpinner />;

  const onSelectMonth = (m: { id: string; shortCode: string, name: string }) => {
    setActiveMonthId(m.id);
    navigate(`/b/${shortCode}/${m.shortCode}`);
    document.title = `${budget.name}: ${m.name}`;
  };

  const onCreateTransaction = (tx: { description: string; amount: number; date: string }) => {
    socket.emit("budgetEvent", {
      source: "frontend",
      entity: "transaction",
      operation: "create",
      id: "temp-" + Date.now(),
      payload: {
        ...tx,
        monthId: activeMonth?.id,
      },
    });
  };

  if (isMobile) {
    return <MobileBudgetView budget={budget} month={activeMonth} onSelectMonth={onSelectMonth} onCreateTransaction={onCreateTransaction} />;
  }

  return <DesktopBudgetView budget={budget} month={activeMonth} onSelectMonth={onSelectMonth} onCreateTransaction={onCreateTransaction} />;
}
