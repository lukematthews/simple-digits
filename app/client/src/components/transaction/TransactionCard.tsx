import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Check, Trash2 } from "lucide-react";
import { Transaction, WsEvent } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { socket } from "@/lib/socket";
import { CurrencyCellInput } from "../CurrencyCellInput";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

type Props = {
  transaction: Transaction;
  isNew?: boolean;
  onDone?: (txn: Transaction) => void;
  onDiscard?: (id: string) => void;
};

export default function TransactionCard({ transaction, isNew = false, onDone, onDiscard }: Props) {
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(transaction.date);
  const [paid, setPaid] = useState(transaction.paid);
  const [amount, setAmount] = useState(transaction.amount);

  const [editingDesc, setEditingDesc] = useState(isNew);
  const [, setEditingDate] = useState(isNew);
  const [, setEditingAmount] = useState(isNew);

  const emitUpdate = (updatedFields: Partial<Transaction>) => {
    const updatedTxn: Transaction = {
      ...transaction,
      ...updatedFields,
    };
    const event: WsEvent<Transaction> = {
      source: "frontend",
      entity: "transaction",
      operation: "update",
      id: updatedTxn.id!,
      payload: updatedTxn,
    };

    socket.emit("budgetEvent", event);
  };

  const emitCreate = () => {
    const newTxn: Transaction = {
      ...transaction,
      description,
      date,
      amount,
      paid,
    };
    onDone?.(newTxn);
  };

  return (
    <Card key={transaction.id} className="mx-1 px-0 py-1 mb-0 hover:bg-gray-200 hover:text-black transition-colors duration-200">
      <CardContent className="px-3 py-1">
        <div className="grid grid-cols-[1fr_130px_7rem_60px_7rem_32px] items-center gap-x-2">
          {/* Description */}
          <input
            className="border p-1 w-full"
            placeholder="Description"
            value={description}
            autoFocus={editingDesc}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              setEditingDesc(false);
              if (!isNew && description !== transaction.description) {
                emitUpdate({ description });
              }
            }}
          />

          {/* Date */}
          <input
            type="date"
            className="border p-1 w-full"
            value={format(new Date(date), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => {
              setEditingDate(false);
              if (!isNew && date !== transaction.date) {
                emitUpdate({ date });
              }
            }}
          />

          {/* Amount */}
          <CurrencyCellInput
            value={amount}
            onChange={(val) => {
              setAmount(val);
              setEditingAmount(false);
              if (!isNew && val !== transaction.amount) {
                emitUpdate({ amount: val });
              }
            }}
            placeholder="0.00"
          />
          <div className="flex justify-center">
            <Checkbox
              checked={paid}
              onCheckedChange={(val) => {
                const newPaid = !!val;
                setPaid(newPaid);
                if (!isNew && newPaid !== transaction.paid) {
                  emitUpdate({ paid: newPaid });
                }
              }}
            />
          </div>
          <input
            type="text"
            disabled
            readOnly
            value={formatCurrency(transaction.balance ?? 0)}
            className={`w-full border p-1 text-sm text-right font-semibold rounded cursor-not-allowed text-black ${transaction.balance! >= 0 ? "bg-green-100" : "bg-red-100"}`}
          />
          <div className="flex items-center space-x-1 justify-end">
            {isNew ? (
              <>
                <button className="text-green-600 hover:text-green-800" title="Save" onClick={emitCreate}>
                  <Check size={16} />
                </button>
                <button className="text-red-500 hover:text-red-700" title="Discard" onClick={() => onDiscard?.(transaction.id!)}>
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <Trash2
                className="w-4 h-4 text-red-500 cursor-pointer"
                onClick={() =>
                  socket.emit("budgetEvent", {
                    source: "frontend",
                    entity: "transaction",
                    operation: "delete",
                    id: transaction.id!,
                    payload: transaction,
                  } as WsEvent<Transaction>)
                }
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
