import { StrictMode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import BudgetApp from "./components/PersonalBudget";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/month/:monthName" element={<BudgetApp />} />
        <Route path="*" element={<BudgetApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
