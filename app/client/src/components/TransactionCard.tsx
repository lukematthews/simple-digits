import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Transaction } from "@/types";
import { Checkbox } from "./ui/checkbox";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

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
    console.log(`sending transaction update: ${JSON.stringify({ client: "frontend", type: "update", data: { ...transaction, ...updatedFields } })}`);
    socket.emit("transaction", {
      client: "frontend",
      type: "update",
      data: { ...transaction, ...updatedFields },
    });
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

  const onDeleteTransaction = (id: number) => {
    socket.emit("transaction", { client: "frontend", type: "delete", data: id });
  };

  useEffect(() => {
    socket.on("transaction", (message) => {
      console.log(`received transaction message ${JSON.stringify(message)}`);
      if (message.client !== "api") {
        return;
      }
      if (message.data.id !== transaction.id) {
        return;
      }
      if (message.type === "update") {
        const messageTransaction: Transaction = message.data;
        if (messageTransaction.description !== transaction.description) {
          setDescription(messageTransaction.description);
        }
        if (messageTransaction.amount !== transaction.amount) {
          setAmount(messageTransaction.amount);
        }
        if (messageTransaction.paid !== transaction.paid) {
          setPaid(messageTransaction.paid);
        }
        if (messageTransaction.date !== transaction.date) {
          setDate(messageTransaction.date);
        }
      }
    });
  }, [transaction]);

  return (
    <Card key={transaction.id} className="mb-2">
      <CardContent className="flex justify-between items-center gap-4">
        {/* Description */}
        <div className="w-1/4">
          {editingDesc ? (
            <input
              className="border p-1 w-full"
              value={description}
              autoFocus
              onBlur={() => {
                setEditingDesc(false);
                if (description !== transaction.description) {
                  emitUpdate({ description });
                }
              }}
              onChange={(e) => setDescription(e.target.value)}
            />
          ) : (
            <p className="font-semibold cursor-pointer" onClick={() => setEditingDesc(true)}>
              {description}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          {editingDate ? (
            <input
              type="date"
              className="border p-1"
              value={format(new Date(date), "yyyy-MM-dd")}
              autoFocus
              onBlur={() => {
                setEditingDate(false);
                if (date !== transaction.date) {
                  emitUpdate({ date });
                }
              }}
              onChange={(e) => setDate(e.target.value)}
            />
          ) : (
            <p className="text-sm text-gray-500 cursor-pointer" onClick={() => setEditingDate(true)}>
              {format(new Date(date), "dd/MM/yyyy")}
            </p>
          )}
        </div>

        {/* Paid */}
        <div>
          <Checkbox
            checked={paid}
            onCheckedChange={(val) => {
              const newPaid = !!val;
              setPaid(newPaid);
              emitUpdate({ paid: newPaid });
            }}
          />
        </div>

        {/* Amount */}
        <div className="text-right w-24">
          {editingAmount ? (
            <input
              type="number"
              step="0.01"
              className="border p-1 w-full text-right"
              value={amount}
              autoFocus
              onBlur={() => {
                setEditingAmount(false);
                if (amount !== transaction.amount) {
                  emitUpdate({ amount });
                }
              }}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            />
          ) : (
            <p className={`font-semibold cursor-pointer ${amount >= 0 ? "text-green-600" : "text-red-600"}`} onClick={() => setEditingAmount(true)}>
              {formatCurrency(amount)}
            </p>
          )}
        </div>

        {/* Balance */}
        <div>
          <p className="text-sm text-gray-500">Balance: {formatCurrency(transaction.balance ?? 0)}</p>
        </div>

        {/* Delete */}
        <div className="flex gap-2">
          <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => onDeleteTransaction(transaction.id!)} />
        </div>
      </CardContent>
    </Card>
  );
}

// import { Card, CardContent } from "@/components/ui/card";
// import { format } from "date-fns";
// import { Pencil, Trash2 } from "lucide-react";
// import { Transaction } from "@/types";
// import { Checkbox } from "./ui/checkbox";

// function formatCurrency(value: number): string {
//   return new Intl.NumberFormat("en-AU", {
//     style: "currency",
//     currency: "AUD",
//   }).format(value);
// }
// type Props = {
//   transaction: Transaction;
//   onEditTransaction: (txn: Transaction) => void;
//   onDeleteTransaction: (txnId: number) => void;
// };

// export default function TransactionCard({ transaction, onEditTransaction, onDeleteTransaction }: Props) {
//   return (
//     <Card key={transaction.id} className="mb-2">
//       <CardContent className="flex justify-between items-center">
//         <div>
//           <p className="font-semibold">{transaction.description}</p>
//         </div>
//         <div>
//           <p className="text-sm text-gray-500">{format(new Date(transaction.date), "dd/MM/yyyy")}</p>
//         </div>
//         <div>
//           <p className="text-sm text-gray-500">
//             <Checkbox checked={transaction.paid}></Checkbox>
//           </p>
//         </div>
//         <div className="text-right">
//           <p className={`font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(transaction.amount)}</p>
//         </div>
//         <div>
//           <p className="text-sm text-gray-500">Balance: {formatCurrency(transaction.balance ?? 0)}</p>
//         </div>
//         <div className="flex gap-2">
//           <Pencil className="w-4 h-4 text-blue-500 cursor-pointer" onClick={() => onEditTransaction(transaction)} />
//           <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => onDeleteTransaction(transaction.id!)} />
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
