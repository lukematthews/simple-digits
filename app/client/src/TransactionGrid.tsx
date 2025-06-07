// src/components/TransactionGrid.tsx

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Transaction } from "@/types";
import { TransactionGridProps, Month } from "@/types";
import { formatCurrency } from "./lib/utils";

const API_BASE = "http://localhost:3000";

export default function TransactionGrid({ month, setMonths, months }: TransactionGridProps) {
  const [editTxnId, setEditTxnId] = useState<number | null>(null);
  const [formTxn, setFormTxn] = useState<Transaction>({
    id: -1,
    description: "",
    date: "",
    amount: 0,
    paid: false,
    balance: 0,
  });

  function updateMonthTransactions(updatedTransactions: Transaction[]) {
    const updatedMonth = {
      ...month,
      transactions: updatedTransactions,
    };
    updatedMonth.closingBalance = updatedTransactions.reduce((acc, txn) => acc + (txn.paid ? txn.amount : 0), month.startingBalance);
    const updatedMonths = months.map((m: Month) => (m.id === month.id ? updatedMonth : m));
    setMonths(updatedMonths);
  }

  function handleDeleteTransaction(id: number) {
    fetch(`${API_BASE}/transactions/${id}`, {
      method: "DELETE",
    }).then(() => {
      const filtered = month.transactions.filter((txn: Transaction) => txn.id !== id);
      updateMonthTransactions(filtered);
    });
  }

  function handleEditTransaction(txn: Transaction) {
    setEditTxnId(txn.id);
    setFormTxn({ ...txn });
  }

  function handleSaveEdit() {
    const updatedTxn = {
      ...formTxn,
      amount: formTxn.amount,
    };
    fetch(`${API_BASE}/transactions/${formTxn.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTxn),
    })
      .then((res) => res.json())
      .then((savedTxn) => {
        const updated = month.transactions.map((txn) => (txn.id === savedTxn.id ? savedTxn : txn));
        updateMonthTransactions(updated);
        setEditTxnId(null);
      });
  }

  return (
    <div className="space-y-2">
      {month.transactions.map((txn: Transaction) => (
        <div key={txn.id} className="grid grid-cols-6 gap-2 items-center">
          {editTxnId === txn.id ? (
            <>
              <Input value={formTxn.description} onChange={(e) => setFormTxn({ ...formTxn, description: e.target.value })} />
              <Input type="date" value={formTxn.date} onChange={(e) => setFormTxn({ ...formTxn, date: e.target.value })} />
              <Input type="number" value={formTxn.amount} onChange={(e) => setFormTxn({ ...formTxn, amount: parseFloat(e.target.value) })} />
              <Checkbox checked={formTxn.paid} onCheckedChange={(checked) => setFormTxn({ ...formTxn, paid: !!checked })} />
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditTxnId(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <span>{txn.description}</span>
              <span>{format(parseISO(txn.date), "dd/MM/yyyy")}</span>
              <span>{formatCurrency(txn.amount)}</span>
              <Checkbox checked={txn.paid} disabled />
              <span>{txn.balance !== null ? formatCurrency(txn.balance) : ""}</span>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => handleEditTransaction(txn)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (txn.id) {
                      handleDeleteTransaction(txn.id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
