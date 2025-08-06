// src/components/BudgetApp.tsx
import { useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { socket } from "@/lib/socket";
import { calculateMonthBalances } from "@/lib/monthUtils";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileBudgetView from "./mobile/MobileBudgetView";
import LoadingSpinner from "./LoadingSpinner";

export default function BudgetApp() {
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
  const isMobile = useIsMobile();

  // const activeMonthId = useBudgetStore((s) => s.activeMonthId);
  const setActiveMonthId = useBudgetStore((s) => s.setActiveMonthId);

  // const activeMonth = budget?.months.find((m) => m.id === activeMonthId) ?? null;

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

  if (isBudgetLoading || !budget) return <LoadingSpinner />;

  // const onSelectMonth = (m: { id: string; shortCode: string; name: string }) => {
  //   setActiveMonthId(m.id);
  //   navigate(`/b/${shortCode}/${m.shortCode}`);
  //   document.title = `${budget.name}: ${m.name}`;
  // };

  // const onCreateTransaction = (tx: { description: string; amount: number; date: string }) => {
  //   socket.emit("budgetEvent", {
  //     source: "frontend",
  //     entity: "transaction",
  //     operation: "create",
  //     id: "temp-" + Date.now(),
  //     payload: {
  //       ...tx,
  //       monthId: activeMonth?.id,
  //     },
  //   });
  // };

  if (isMobile) {
    return <MobileBudgetView/>;
  }
  return <></>;
}
