import { Route, Routes } from "react-router-dom";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import HomePage from "./HomePage";
import BudgetApp from "./BudgetApp";

export function App() {
  useSocketEvents();

  return (
    <>
      <Routes>
        <Route path="/:shortCode/:monthName" element={<BudgetApp />} />
        <Route path="/:shortCode" element={<BudgetApp />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
}
