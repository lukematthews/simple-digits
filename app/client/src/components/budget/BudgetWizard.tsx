import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import "react-day-picker/dist/style.css";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { MonthReorderEditor } from "../month/MonthReorderEditor";

/** Helpers */
const camelCase = (str: string) =>
  str
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join("");

/** Types */
interface BudgetSettingsForm {
  name: string;
  shortCode: string;
}

interface MonthItem {
  id: string;
  name: string;
  position: number;
  from?: Date;
  to?: Date;
}

type Props = {
  onCancel: () => void;
};

/** Main Component */
export default function BudgetWizard({ onCancel }: Props) {
  const navigate = useNavigate();

  const [autoShortCode, setAutoShortCode] = useState(true);

  // ─── Settings Form ────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BudgetSettingsForm>({ mode: "onChange" });

  const nameWatch = watch("name");
  useEffect(() => {
    const auto = camelCase(nameWatch || "");
    if (autoShortCode) {
      setValue("shortCode", auto, { shouldValidate: false });
    }
  }, [nameWatch, autoShortCode]);

  // ─── Months State ─────────────────────────────────
  const [showMonths, setShowMonths] = useState(false);
  const [months, setMonths] = useState<MonthItem[]>([]);

  const addMonthRow = () => {
    setShowMonths(true);
    setMonths((m) => [...m, { id: uuid(), name: `Month ${m.length + 1}`, position: m.length }]);
  };

  const updateMonthName = (id: string, name: string) => setMonths((m) => m.map((x) => (x.id === id ? { ...x, name } : x)));

  const updateMonthDates = (id: string, range: DateRange | undefined) => setMonths((months) => months.map((m) => (m.id === id ? { ...m, from: range?.from, to: range?.to } : m)));

  const deleteMonth = (id: string) => setMonths((m) => m.filter((x) => x.id !== id).map((m, i) => ({ ...m, position: i })));

  // ─── Submit Wizard ────────────────────────────────
  const onFinish = handleSubmit(async (settings) => {
    const payload = {
      name: settings.name,
      shortCode: settings.shortCode || camelCase(settings.name),
      months: months.map(({ name, position, from, to }) => ({
        name,
        position,
        started: false,
        fromDate: from?.toISOString(),
        toDate: to?.toISOString(),
      })),
    };

    try {
      socket.emit("budgetEvent", {
        source: "frontend",
        entity: "budget",
        operation: "create",
        payload: payload,
      });
      navigate(`/b/${payload.shortCode}`);
    } catch (err) {
      console.error(err);
      alert("Error creating budget");
    }
  });

  return (
    <Card className="max-w-2xl mx-auto mt-10 p-8 space-y-6">
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create a budget</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input {...register("name", { required: true })} placeholder="e.g. 2025 Family Budget" />
            {errors.name && <p className="text-red-500 text-xs mt-1">Name is required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 flex justify-between items-center">
              <span>Short Code</span>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={autoShortCode} onChange={() => setAutoShortCode((prev) => !prev)} />
                Auto-generate
              </label>
            </label>
            <Input
              {...register("shortCode")}
              placeholder="Auto‑generated"
              readOnly={autoShortCode}
              className={autoShortCode ? "cursor-not-allowed" : ""}
              onChange={(e) => setValue("shortCode", e.target.value, { shouldValidate: true })}
            />
          </div>
          {!showMonths && (
            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button disabled={!isValid} onClick={addMonthRow}>
                  Add Months
                </Button>
                <Button disabled={!isValid} onClick={onFinish}>
                  Finish
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2 – Months */}
        {showMonths && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Months</h2>
            <MonthReorderEditor
              months={months}
              onAdd={addMonthRow}
              onUpdateName={updateMonthName}
              onUpdateDates={updateMonthDates}
              onDelete={deleteMonth}
              onReorder={(reordered) => setMonths(reordered)}
            />
            <div className="pt-6 flex justify-end">
              <Button onClick={onCancel}>Cancel</Button>
              <Button className="ml-2" onClick={onFinish}>Finish</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
