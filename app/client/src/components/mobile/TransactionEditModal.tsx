import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types";
import { Check, Trash2, X } from "lucide-react";
import BottomFixedCurrencyNumpad from "./BottomFixedCurrencyKeypad";

interface Props {
  transaction: Transaction;
  isNew?: boolean;
  onDone: (txn: Transaction) => void;
  onClose: () => void;
  onDiscard?: (id: string) => void;
  onDelete?: (txn: Transaction) => void;
}

export function TransactionEditModal({ transaction, isNew, onDone, onClose, onDiscard, onDelete }: Props) {
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(transaction.date);
  const [paid, setPaid] = useState(transaction.paid);
  const [amount, setAmount] = useState(transaction.amount);

  const handleDone = () => {
    onDone({
      ...transaction,
      description,
      date,
      paid,
      amount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <span className="text-lg font-semibold">{isNew ? "New Transaction" : "Edit Transaction"}</span>
        <button onClick={onClose} className="text-muted-foreground">
          <X className="h-8 w-8" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <input className="w-full border p-2 rounded text-sm" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="flex gap-2">
          <input type="date" className="border p-2 rounded text-sm w-1/2" value={format(new Date(date), "yyyy-MM-dd")} onChange={(e) => setDate(e.target.value)} />
          <div className="w-1/2">
            <BottomFixedCurrencyNumpad value={amount} onChange={setAmount} onClose={() => console.log("Numpad closed")} />
          </div>
        </div>

        <Button variant={paid ? "default" : "outline"} className="w-full h-14 text-lg flex items-center justify-center gap-2" onClick={() => setPaid((prev) => !prev)}>
          {paid && <Check className="h-6 w-6" />}
          Paid
        </Button>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-between border-t">
        <div className="flex gap-2">
          {isNew ? (
            <Button variant="ghost" className="text-red-500" onClick={() => onDiscard?.(transaction.id!)}>
              Discard
            </Button>
          ) : (
            <Button variant="ghost" className="text-red-500 flex items-center gap-1" onClick={() => onDelete?.(transaction)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
        <Button onClick={handleDone}>Done</Button>
      </div>
    </div>
  );
}
