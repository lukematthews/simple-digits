import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyCellInput } from "@/components/CurrencyCellInput";
import { Transaction } from "@/types";

interface Props {
  transaction: Transaction;
  isNew?: boolean;
  onDone: (txn: Transaction) => void;
  onClose: () => void;
  onDiscard?: (id: string) => void;
  onDelete?: (txn: Transaction) => void;
}

export function TransactionEditModal({
  transaction,
  isNew,
  onDone,
  onClose,
  onDiscard,
  onDelete,
}: Props) {
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="h-screen sm:h-auto w-full sm:max-w-md sm:top-[10vh] overflow-y-auto rounded-none sm:rounded-lg flex flex-col items-start justify-start"
      >
        <DialogHeader className="w-full">
          <DialogTitle>
            {isNew ? "New Transaction" : "Edit Transaction"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 w-full">
          <input
            className="w-full border p-2 rounded text-sm"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-2">
            <input
              type="date"
              className="border p-2 rounded text-sm w-1/2"
              value={format(new Date(date), "yyyy-MM-dd")}
              onChange={(e) => setDate(e.target.value)}
            />

            <div className="w-1/2">
              <CurrencyCellInput
                value={amount}
                onChange={setAmount}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={paid}
              onCheckedChange={(val) => setPaid(!!val)}
            />
            <span className="text-sm">Paid</span>
          </div>
        </div>

        <DialogFooter className="w-full flex justify-between mt-4">
          <div className="flex gap-2">
            {isNew ? (
              <Button
                variant="ghost"
                className="text-red-500"
                onClick={() => onDiscard?.(transaction.id!)}
              >
                Discard
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="text-red-500"
                onClick={() => onDelete?.(transaction)}
              >
                Delete
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
          <Button onClick={handleDone}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
