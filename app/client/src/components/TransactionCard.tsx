import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Check, Trash2 } from "lucide-react";
import { Transaction, WsEvent } from "@/types";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { socket } from "@/lib/socket";
import { CurrencyCellInput } from "./CurrencyCellInput";

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
    <Card key={transaction.id} className="mb-0 py-1 hover:bg-gray-100 transition-colors duration-200">
      <CardContent className="flex justify-between items-center gap-4">
        {/* Description */}
        <div className="w-1/4">
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
        </div>

        {/* Date */}
        <div>
          <input
            type="date"
            className="border p-1"
            value={format(new Date(date), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => {
              setEditingDate(false);
              if (!isNew && date !== transaction.date) {
                emitUpdate({ date });
              }
            }}
          />
        </div>

        {/* Amount */}
        <div className="text-right w-32">
          <CurrencyCellInput
            value={amount}
            onChange={(val) => {
              setAmount(val);
              setEditingAmount(false);
              if (!isNew && amount !== transaction.amount) {
                emitUpdate({ amount });
              }
            }}
            placeholder="0.00"
          ></CurrencyCellInput>
        </div>

        {/* Paid */}
        <div className="w-20 flex justify-center">
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
        {/* Balance */}
        <div className={`h-full w-32 p-1 rounded flex items-center justify-end ${transaction.balance! >= 0 ? "bg-green-100" : "bg-red-100"}`}>
          <p className="text-lg text-gray-500">{formatCurrency(transaction.balance ?? 0)}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isNew ? (
            <>
              <button className="p-1 text-green-600 hover:text-green-800" title="Save" onClick={emitCreate}>
                <Check size={18} />
              </button>
              <button
                className="p-1 text-red-500 hover:text-red-700"
                title="Discard"
                onClick={() => onDiscard?.(transaction.id!)} // <- call parent to remove from draft list
              >
                <Trash2 size={18} />
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
      </CardContent>
    </Card>
  );
}
