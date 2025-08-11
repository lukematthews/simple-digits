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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDone = () => {
    onDone({
      ...transaction,
      description,
      date,
      paid,
      amount,
    });
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(transaction);
    }
    setShowDeleteConfirm(false);
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

        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            {isNew ? (
              <Button variant="ghost" className="text-red-500" onClick={() => onDiscard?.(transaction.id!)}>
                Discard
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="text-red-500 flex items-center gap-1"
                onClick={() => setShowDeleteConfirm(true)} // Open confirmation modal
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <Button onClick={handleDone}>Done</Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-background rounded-lg p-6 w-80 max-w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this transaction?</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
