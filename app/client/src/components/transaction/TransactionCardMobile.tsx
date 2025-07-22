import { useState } from "react";
import { format } from "date-fns";
import { Check, CheckSquare, Square, Trash2 } from "lucide-react";
import { Transaction, WsEvent } from "@/types";
import { socket } from "@/lib/socket";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyCellInput } from "@/components/CurrencyCellInput";
import clsx from "clsx";

interface Props {
  transaction: Transaction;
  isNew?: boolean;
  onDone?: (txn: Transaction) => void;
  onDiscard?: (id: string) => void;
  autoFocus?: boolean;
}

export default function TransactionCardMobile({ transaction, isNew = false, onDone, onDiscard, autoFocus }: Props) {
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(transaction.date);
  const [paid, setPaid] = useState(transaction.paid);
  const [amount, setAmount] = useState(transaction.amount);
  const [editing, setEditing] = useState(isNew);

  const emitUpdate = (updatedFields: Partial<Transaction>) => {
    const updatedTxn: Transaction = { ...transaction, ...updatedFields };
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

  const balanceColor = (transaction?.balance ?? 0) >= 0 ? "bg-green-100" : "bg-red-100";

  if (!editing) {
    return (
      <div className="w-full px-0 py-3 rounded shadow cursor-pointer" onClick={() => setEditing(true)}>
        <div className="flex justify-between items-center gap-2 text-sm font-medium">
          <div className="flex-1 truncate">
            {format(new Date(date), "dd/MM/yyyy")} {description}
          </div>

          <div className="text-right shrink-0 min-w-[100px]">
            {amount.toLocaleString("en-AU", {
              style: "currency",
              currency: "AUD",
            })}
          </div>

          {paid ? <CheckSquare className="shrink-0 text-black" size={16} /> : <Square className="shrink-0 text-gray-500" size={16} />}
          <span className={clsx("text-sm font-semibold rounded py-0.5 px-2 shrink-0 w-1/5 text-right", (transaction?.balance ?? 0) >= 0 ? "bg-green-100" : "bg-red-100")}>
            {transaction?.balance?.toLocaleString("en-AU", {
              style: "currency",
              currency: "AUD",
            })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center gap-2">
      <Checkbox
        checked={paid}
        onCheckedChange={(val) => {
          const newPaid = !!val;
          setPaid(newPaid);
          if (!isNew && newPaid !== transaction.paid) emitUpdate({ paid: newPaid });
        }}
      />
      <div className={clsx("text-sm font-semibold text-right text-gray-800 px-2 rounded w-1/5", balanceColor)}>
        {transaction?.balance?.toLocaleString("en-AU", {
          style: "currency",
          currency: "AUD",
        })}
      </div>
      <div className="flex gap-2 flex-grow justify-end">
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
          <>
            <button className="text-gray-500" onClick={() => setEditing(false)}>
              Cancel
            </button>
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
          </>
        )}
      </div>
    </div>
  );
}
