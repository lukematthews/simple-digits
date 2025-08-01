import { Route, Routes } from "react-router-dom";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import HomePage from "./HomePage";
import SiteHomePage from "./SiteHomePage";
import AuthFlow from "./AuthFlow";
import SimpleDigits from "./new-layout/SimpleDigits";

export function App() {
  useSocketEvents();

  return (
    <>
      <Routes>
        <Route>
          <Route path="/b/:shortCode/:monthName" element={<SimpleDigits />} />
          <Route path="/b/:shortCode" element={<SimpleDigits />} />
          <Route path="/b" element={<HomePage />} />
        </Route>
        <Route path="/" element={<SiteHomePage />} />
        <Route path="/login" element={<AuthFlow />} />
      </Routes>
    </>
  );
}
