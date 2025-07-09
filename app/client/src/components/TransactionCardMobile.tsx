// src/components/TransactionCardMobile.tsx
import { useState } from "react";
import { format } from "date-fns";
import { Check, Trash2 } from "lucide-react";
import { Transaction, WsEvent } from "@/types";
import { socket } from "@/lib/socket";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyCellInput } from "@/components/CurrencyCellInput";

interface Props {
  transaction: Transaction;
  isNew?: boolean;
  onDone?: (txn: Transaction) => void;
  onDiscard?: (id: string) => void;
  autoFocus: boolean | undefined;
}

export default function TransactionCardMobile({ transaction, isNew = false, onDone, onDiscard, autoFocus }: Props) {
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(transaction.date);
  const [paid, setPaid] = useState(transaction.paid);
  const [amount, setAmount] = useState(transaction.amount);

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
    <div className="border rounded-md shadow-sm p-3 mb-2 bg-white space-y-2">
      <div className="flex flex-col space-y-1">
        <input
          className="border p-2 rounded text-sm"
          placeholder="Description"
          autoFocus={autoFocus}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (!isNew && description !== transaction.description) emitUpdate({ description });
          }}
        />

        <div className="flex gap-2">
          <input
            type="date"
            className="border p-2 rounded text-sm w-1/2"
            value={format(new Date(date), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => {
              if (!isNew && date !== transaction.date) emitUpdate({ date });
            }}
          />
          <div className="w-1/2">
            <CurrencyCellInput
              value={amount}
              onChange={(val) => {
                setAmount(val);
                if (!isNew && val !== transaction.amount) emitUpdate({ amount: val });
              }}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={paid}
            onCheckedChange={(val) => {
              const newPaid = !!val;
              setPaid(newPaid);
              if (!isNew && newPaid !== transaction.paid) emitUpdate({ paid: newPaid });
            }}
          />
          <span className="text-sm">Paid</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className={`w-full text-sm font-semibold px-2 py-1 rounded ${(transaction?.balance ?? 0) >= 0 ? "bg-green-100" : "bg-red-100"} text-black text-center`}>
          {transaction?.balance?.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
        </div>
        <div className="flex gap-2">
          {isNew ? (
            <>
              <button className="text-green-600" onClick={emitCreate}>
                <Check size={18} />
              </button>
              <button className="text-red-500" onClick={() => onDiscard?.(transaction.id!)}>
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <button
              className="text-red-500"
              onClick={() =>
                socket.emit("budgetEvent", {
                  source: "frontend",
                  entity: "transaction",
                  operation: "delete",
                  id: transaction.id!,
                  payload: transaction,
                } as WsEvent<Transaction>)
              }
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
