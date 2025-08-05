import { useState } from "react";
import { format } from "date-fns";
import { CheckSquare, Square } from "lucide-react";
import { Transaction } from "@/types";
import clsx from "clsx";
import { TransactionEditModal } from "./TransactionEditModal";

interface Props {
  transaction: Transaction;
  isNew?: boolean;
  onDone?: (txn: Transaction) => void;
  onUpdate?: (txn: Transaction) => void;
  onDiscard?: (id: string) => void;
  onDelete?: (txn: Transaction) => void;
  autoFocus?: boolean;
}

export default function TransactionCardMobile({ transaction, onDone, isNew, onDiscard, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const balanceColor = (transaction?.balance ?? 0) >= 0 ? "bg-green-100" : "bg-red-100";

  return (
    <>
      <div className="w-full px-0 py-3 rounded shadow cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="flex justify-between items-center gap-2 text-sm font-medium">
          <div className="flex-1 truncate">
            {format(new Date(transaction.date), "dd/MM/yyyy")} {transaction.description}
          </div>

          <div className="text-right shrink-0 min-w-[100px]">
            {transaction.amount.toLocaleString("en-AU", {
              style: "currency",
              currency: "AUD",
            })}
          </div>

          {transaction.paid ? <CheckSquare className="shrink-0 text-black" size={16} /> : <Square className="shrink-0 text-gray-500" size={16} />}

          <span className={clsx("text-sm font-semibold rounded py-0.5 px-2 shrink-0 w-1/5 text-right", balanceColor)}>
            {transaction?.balance?.toLocaleString("en-AU", {
              style: "currency",
              currency: "AUD",
            })}
          </span>
        </div>
      </div>

      {showModal && (
        <TransactionEditModal
          transaction={transaction}
          isNew={isNew}
          onClose={() => setShowModal(false)}
          onDone={(txn) => {
            if (isNew) {
              onDone?.(txn);
            } else {
              onUpdate?.(txn);
            }
            setShowModal(false);
          }}
          onDiscard={onDiscard}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
