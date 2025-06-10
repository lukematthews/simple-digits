import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Transaction } from "@/types";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { socket } from "@/lib/socket";
import { NumericFormat } from "react-number-format";

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
};

export default function TransactionCard({ transaction, isNew = false, onDone }: Props) {
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(transaction.date);
  const [paid, setPaid] = useState(transaction.paid);
  const [amount, setAmount] = useState(transaction.amount);

  const [editingDesc, setEditingDesc] = useState(isNew);
  const [editingDate, setEditingDate] = useState(isNew);
  const [editingAmount, setEditingAmount] = useState(isNew);

  const emitUpdate = (updatedFields: Partial<Transaction>) => {
    const updatedTxn: Transaction = {
      ...transaction,
      ...updatedFields,
    };
    socket.emit("transaction", { client: "frontend", type: "update", data: updatedTxn });
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
    <Card key={transaction.id} className="mb-2 py-1 hover:bg-gray-100 transition-colors duration-200">
      <CardContent className="flex justify-between items-center gap-4">
        {/* Description */}
        <div className="w-1/4">
          <input
            className="border p-1 w-full"
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
          <NumericFormat
            value={amount}
            thousandSeparator
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            onValueChange={(values) => setAmount(values.floatValue || 0)}
            onBlur={() => {
              setEditingAmount(false);
              if (!isNew && amount !== transaction.amount) {
                emitUpdate({ amount });
              }
            }}
            className="border p-1 w-full text-right"
          />
        </div>

        {/* Paid */}
        <div>
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
            <button className="text-blue-500 font-semibold" onClick={emitCreate}>
              Done
            </button>
          ) : (
            <Trash2
              className="w-4 h-4 text-red-500 cursor-pointer"
              onClick={() =>
                socket.emit("transaction", {
                  client: "frontend",
                  type: "delete",
                  data: transaction.id,
                })
              }
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
