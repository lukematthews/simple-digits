import { Route, Routes } from "react-router-dom";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import HomePage from "./HomePage";
import BudgetApp from "./BudgetApp";
import SiteHomePage from "./SiteHomePage";
import AuthFlow from "./AuthFlow";
import Layout from "./Layout";

export function App() {
  useSocketEvents();

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/b/:shortCode/:monthName" element={<BudgetApp />} />
          <Route path="/b/:shortCode" element={<BudgetApp />} />
          <Route path="/b" element={<HomePage />} />
          <Route path="/login" element={<AuthFlow />} />{" "}
        </Route>
        <Route path="/" element={<SiteHomePage />} />
      </Routes>
    </>
  );
}
