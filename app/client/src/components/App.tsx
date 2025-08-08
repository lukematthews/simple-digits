import { Route, Routes } from "react-router-dom";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import HomePage from "./HomePage";
import SiteHomePage from "./SiteHomePage";
import AuthFlow from "./AuthFlow";
import SimpleDigits from "./desktop/SimpleDigits";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileBudgetView from "./mobile/MobileBudgetView";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect } from "react";
import { DarkModeToggle } from "./DarkModeToggle";

const SimpleDigitsPage = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileBudgetView /> : <SimpleDigits />;
};

export function App() {
  useSocketEvents();

  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      <Routes>
        <Route path="/b/:shortCode/:monthName" element={<SimpleDigitsPage />} />
        <Route path="/b/:shortCode" element={<SimpleDigitsPage />} />
        <Route path="/b" element={<HomePage />} />
        <Route path="/" element={<SiteHomePage />} />
        <Route path="/login" element={<AuthFlow />} />
      </Routes>
    </div>
  );
}
