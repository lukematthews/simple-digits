import { Route, Routes } from "react-router-dom";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import HomePage from "./HomePage";
import SiteHomePage from "./SiteHomePage";
import AuthFlow from "./AuthFlow";
import SimpleDigits from "./desktop/SimpleDigits";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileBudgetView from "./mobile/MobileBudgetView";

export function App() {
  useSocketEvents();
  const isMobile = useIsMobile();
  const SimpleDigitsPage = () => {
    return isMobile ? <MobileBudgetView></MobileBudgetView> : <SimpleDigits/>;
  };

  return (
    <>
      <Routes>
        <Route>
          <Route path="/b/:shortCode/:monthName" element={SimpleDigitsPage()} />
          <Route path="/b/:shortCode" element={SimpleDigitsPage()} />
          <Route path="/b" element={<HomePage />} />
        </Route>
        <Route path="/" element={<SiteHomePage />} />
        <Route path="/login" element={<AuthFlow />} />
      </Routes>
    </>
  );
}
