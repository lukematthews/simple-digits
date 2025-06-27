import { socket } from "@/lib/socket";
import { Account, Month, WsEvent } from "@/types";
import { useState, useEffect, useRef } from "react";
import { CurrencyInput } from "./ui/CurrencyInput";
import debounce from "lodash.debounce";
import { useBudgetStore } from "@/store/useBudgetStore";

type Props = {
  accounts: Account[];
  month: Month;
};

export default function AccountManager({ accounts, month }: Props) {
  const [_accounts, setAccounts] = useState<Account[]>(accounts ?? []);
  const budget = useBudgetStore((s) => s.currentBudget);

  // Debounced socket emitter
  const emitUpdate = useRef(
    debounce((updated: Account) => {
      socket.emit("budgetEvent", { source: "frontend", entity: "account", operation: "update", id: updated.id, payload: updated } as WsEvent<Account>);
    }, 300)
  ).current;

  useEffect(() => {
    const handleAccountMessage = (message: WsEvent<Account>) => {
      if (message.source !== "api" || message.entity !== "account") return;
      console.log(`AccountManager: received account message ${JSON.stringify(message)}`);

      setAccounts((prev) => {
        if (message.operation === "create") {
          return [...prev, message.payload];
        } else if (message.operation === "delete") {
          return prev.filter((a) => a.id !== message.payload.id);
        } else if (message.operation === "update") {
          return prev.map((a) => (a.id === message.payload.id ? message.payload : a));
        }
        return prev;
      });
    };
    socket.on("budgetEvent", handleAccountMessage);

    return () => {
      socket.off("budgetEvent", handleAccountMessage);
    };
  }, []);

  const updateAccount = (id: string, field: keyof Account, value: string | number) => {
    setAccounts((prev) =>
      prev.map((acc: Account) => {
        if (acc.id === id) {
          const updated = { ...acc, [field]: field === "balance" ? parseFloat(value as string) || 0 : value };
          emitUpdate(updated);
          return updated;
        }
        return acc;
      })
    );
  };

  const addAccount = () => {
    if (!budget) return;
    const newAccount: Account = {
      name: "",
      balance: 0,
      monthId: month.id,
    };
    setAccounts((prev) => [...prev, newAccount]);
    socket.emit("budgetEvent", { source: "frontend", entity: "account", operation: "create", payload: newAccount } as WsEvent<Account>);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold">Accounts</h2>
      {_accounts.map((acc) => (
        <div key={acc.id ?? "new-account"} className="flex items-center gap-2">
          <input type="text" value={acc.name} onChange={(e) => updateAccount(acc.id!, "name", e.target.value)} placeholder="Account name" className="border p-1 flex-1" />
          <CurrencyInput value={acc.balance ?? 0} onChange={(value) => updateAccount(acc.id!, "balance", value)}></CurrencyInput>
        </div>
      ))}

      <button onClick={addAccount} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add Account
      </button>
    </div>
  );
}
