import { Month, WsEvent } from "@/types";
import { Checkbox } from "./ui/checkbox";
import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import CurrencyInput from "react-currency-input-field";
import { socket } from "@/lib/socket";
import { useBudgetStore } from "@/store/useBudgetStore";
import { format } from "date-fns";

type Props = {
  month: Month;
};

export default function MonthDetail({ month }: Props) {
  const [monthStarted, setMonthStarted] = useState<boolean>(month.started);
  const [fromDate, setFromDate] = useState<string>(month.fromDate ? format(new Date(month.fromDate), "yyyy-MM-dd") : "");
  const [toDate, setToDate] = useState<string>(month.toDate ? format(new Date(month.toDate), "yyyy-MM-dd") : "");
  const updateMonth = useBudgetStore((s) => s.updateMonth);

  const emitMonthUpdate = (updates: Partial<Month>) => {
    const updated = {
      ...month,
      ...updates,
      startingBalance: Number(month.startingBalance.toFixed(2)),
      closingBalance: Number(month.closingBalance.toFixed(2)),
    };
    socket.emit("budgetEvent", {
      source: "frontend",
      entity: "month",
      operation: "update",
      id: month.id,
      payload: updated,
    } as WsEvent<Month>);
    updateMonth(updated);
  };

  const updateStarted = (started: boolean) => {
    setMonthStarted(started);
    emitMonthUpdate({ started });
  };

  const handleDateChange = (type: "fromDate" | "toDate", value: string) => {
    const dateObj = value ? new Date(value) : undefined;
    if (type === "fromDate") {
      setFromDate(value);
      emitMonthUpdate({ fromDate: dateObj });
    } else {
      setToDate(value);
      emitMonthUpdate({ toDate: dateObj });
    }
  };

  useEffect(() => {
    const handleMessage = (message: WsEvent<Month>) => {
      if (message.source !== "api") return;
      if (message.entity === "month" && message.operation === "update" && message.payload.id === month.id) {
        setMonthStarted(message.payload.started ?? month.started);
        setFromDate(message.payload.fromDate ? format(new Date(message.payload.fromDate), "yyyy-MM-dd") : "");
        setToDate(message.payload.toDate ? format(new Date(message.payload.toDate), "yyyy-MM-dd") : "");
      }
    }

    socket.on("budgetEvent",  handleMessage);

    return () => {
      socket.off("budgetEvent", handleMessage);
    };
  }, [month]);

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Checkbox checked={monthStarted} onCheckedChange={(checked) => updateStarted(Boolean(checked))} />
          <Label>Started</Label>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Label>Dates</Label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={fromDate}
            onChange={(e) => handleDateChange("fromDate", e.target.value)}
          />
          <span>-</span>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={toDate}
            onChange={(e) => handleDateChange("toDate", e.target.value)}
          />
        </div>

        {/* Starting Balance */}
        <div className="flex items-center gap-2">
          <CurrencyInput className={`border rounded px-2 py-1 ${month.startingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`} disabled fixedDecimalLength={2} decimalScale={2} intlConfig={{ locale: "en-AU", currency: "AUD" }} value={month.startingBalance} />
          <Label>Starting Balance</Label>
        </div>

        {/* Closing Balance */}
        <div className="flex items-center gap-2">
          <CurrencyInput className={`border rounded px-2 py-1 ${month.closingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`} disabled fixedDecimalLength={2} decimalScale={2} intlConfig={{ locale: "en-AU", currency: "AUD" }} value={month.closingBalance} />
          <Label>Closing Balance</Label>
        </div>
      </div>
    </div>
  );
}
