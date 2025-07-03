import { Route, Routes } from "react-router-dom";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import HomePage from "./HomePage";
import BudgetApp from "./BudgetApp";
import SiteHomePage from "./SiteHomePage";

export function App() {
  useSocketEvents();

  return (
    <>
      <Routes>
        <Route path="/b/:shortCode/:monthName" element={<BudgetApp />} />
        <Route path="/b/:shortCode" element={<BudgetApp />} />
        <Route path="/b" element={<HomePage />} />
        <Route path="/" element={<SiteHomePage />} />
      </Routes>
    </>
  );
}
