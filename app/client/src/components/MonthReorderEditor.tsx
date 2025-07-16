import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePopover } from "./DateRangePopover";
import { DateRange } from "react-day-picker";
import { motion } from "framer-motion";

export interface MonthItem {
  id: string;
  name: string;
  position: number;
  from?: Date;
  to?: Date;
}

interface Props {
  months: MonthItem[];
  onAdd: () => void;
  onUpdateName: (id: string, name: string) => void;
  onUpdateDates: (id: string, range: DateRange | undefined) => void;
  onDelete: (id: string) => void;
  onReorder?: (updated: MonthItem[]) => void;
}

export function MonthReorderEditor({ months, onAdd, onUpdateName, onUpdateDates, onDelete, onReorder }: Props) {
  const move = (id: string, direction: -1 | 1) => {
    const index = months.findIndex((m) => m.id === id);
    const newIndex = index + direction;

    if (index < 0 || newIndex < 0 || newIndex >= months.length) return;

    const reordered = [...months];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const withUpdatedPositions = reordered.map((m, i) => ({ ...m, position: i }));
    onReorder?.(withUpdatedPositions);
  };

  return (
    <div className="space-y-4">
      {months.map((month, idx) => (
        <motion.div key={month.id} layout className="flex flex-col gap-2 border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <Input value={month.name} onChange={(e) => onUpdateName(month.id, e.target.value)} className="flex-1" placeholder="Month name" />
            <Button variant="outline" size="icon" onClick={() => move(month.id, -1)} disabled={idx === 0} title="Move up">
              ↑
            </Button>
            <Button variant="outline" size="icon" onClick={() => move(month.id, 1)} disabled={idx === months.length - 1} title="Move down">
              ↓
            </Button>
            <Button variant="destructive" size="icon" onClick={() => onDelete(month.id)} title="Delete">
              ✕
            </Button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <DateRangePopover value={month.from ? { from: month.from, to: month.to } : undefined} onChange={(range) => onUpdateDates(month.id, range)} />
          </div>
        </motion.div>
      ))}
      <Button onClick={onAdd}>+ Add Month</Button>
    </div>
  );
}
