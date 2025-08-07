import { EditableMonthFields, Month, WsEvent } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { useEffect } from "react";
import { Label } from "../ui/label";
import CurrencyInput from "react-currency-input-field";
import { socket } from "@/lib/socket";
import { useBudgetStore } from "@/store/useBudgetStore";
import { format } from "date-fns";
import { useActiveMonth } from "@/hooks/useActiveMonth";
import AccountManager from "../AccountManager";

type Props = {
  onAddTransaction: () => void;
};

export default function MonthDetail({ onAddTransaction }: Props) {
  const month = useActiveMonth();
  const updateMonth = useBudgetStore((s) => s.updateMonth);

  useEffect(() => {
    if (!month) return;

    const handleMessage = (message: WsEvent<Month>) => {
      if (message.source !== "api" || message.entity !== "month" || message.operation !== "update" || message.payload.id !== month.id) {
        return;
      }
      updateMonth(message.payload);
    };

    socket.on("budgetEvent", handleMessage);
    return () => {
      socket.off("budgetEvent", handleMessage);
    };
  }, [month?.id, updateMonth]);

  if (!month) return null;

  const emitMonthUpdate = (updates: Partial<EditableMonthFields>) => {
    console.log("emitting update", {
      startingBalance: month.startingBalance,
      type: typeof month.startingBalance,
    });
    socket.emit("budgetEvent", {
      source: "frontend",
      entity: "month",
      operation: "update",
      id: month.id,
      payload: { id: month.id, ...updates },
      updates,
    } as WsEvent<Month>);
    const updated: Month = {
      ...month!,
      ...updates,
      startingBalance: month.startingBalance,
      closingBalance: month.closingBalance,
    };
    updateMonth(updated);
  };

  const updateStarted = (started: boolean) => {
    emitMonthUpdate({ started });
  };

  const handleDateChange = (type: "fromDate" | "toDate", value: string) => {
    const dateObj = value ? new Date(value) : undefined;
    emitMonthUpdate({ [type]: dateObj } as Partial<Month>);
  };

  const fromDate = month.fromDate ? format(new Date(month.fromDate), "yyyy-MM-dd") : "";
  const toDate = month.toDate ? format(new Date(month.toDate), "yyyy-MM-dd") : "";
  return (
    <div className="flex flex-col gap-3">
      {/* Row: Started + Dates */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox checked={month.started} onCheckedChange={(checked) => updateStarted(Boolean(checked))} />
            <Label>Started</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label>Dates</Label>
            <input type="date" className="border rounded px-2 py-1" value={fromDate} onChange={(e) => handleDateChange("fromDate", e.target.value)} />
            <span>-</span>
            <input type="date" className="border rounded px-2 py-1" value={toDate} onChange={(e) => handleDateChange("toDate", e.target.value)} />
          </div>
        </div>
        <div>
          <AccountManager />
        </div>
      </div>
      {/* Row: Balances and Add Transaction */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Label>Starting Balance</Label>
          <CurrencyInput
            className={`text-black border rounded px-2 py-1 ${month.startingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`}
            disabled
            fixedDecimalLength={2}
            decimalScale={2}
            intlConfig={{ locale: "en-AU", currency: "AUD" }}
            value={month.startingBalance?.toFixed(2)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Closing Balance</Label>
          <CurrencyInput
            className={`text-black border rounded px-2 py-1 ${month.closingBalance >= 0 ? "bg-green-100" : "bg-red-100"}`}
            disabled
            fixedDecimalLength={2}
            decimalScale={2}
            intlConfig={{ locale: "en-AU", currency: "AUD" }}
            value={month.closingBalance?.toFixed(2)}
          />
        </div>
        <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded" onClick={onAddTransaction}>
          Add Transaction
        </button>
      </div>
    </div>
  );
}
