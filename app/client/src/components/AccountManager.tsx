import { socket } from "@/lib/socket";
import { Account } from "@/types";
import { useState, useEffect, useRef } from "react";
import { CurrencyInput } from "./ui/CurrencyInput";
import debounce from "lodash.debounce";

const generateId = () => Math.random();

type Props = {
  accounts: Account[];
};

export default function AccountManager({ accounts }: Props) {
  const [_accounts, setAccounts] = useState<Account[]>(accounts ?? []);

  // Debounced socket emitter
  const emitUpdate = useRef(
    debounce((updated: Account) => {
      socket.emit("account", { client: "frontend", type: "update", data: updated });
    }, 300)
  ).current;

  useEffect(() => {
    socket.on("account", (message) => {
      console.log(`AccountManager: received account message ${JSON.stringify(message)}`);
      if (message.client !== "api") return;

      setAccounts((prev) => {
        if (message.type === "create") {
          return [...prev, message.data];
        } else if (message.type === "delete") {
          return prev.filter((a) => a.id !== message.data);
        } else if (message.type === "update") {
          return prev.map((a) => (a.id === message.data.id ? message.data : a));
        }
        return prev;
      });
    });

    return () => {
      socket.off("account");
    };
  }, []);

  const updateAccount = (id: number, field: keyof Account, value: string | number) => {
    setAccounts((prev) =>
      prev.map((acc) => {
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
    const newAccount: Account = {
      id: generateId(),
      name: "",
      balance: 0,
    };
    setAccounts((prev) => [...prev, newAccount]);
    socket.emit("account", { client: "frontend", type: "create", data: newAccount });
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold">Accounts</h2>
      {_accounts.map((acc) => (
        <div key={acc.id} className="flex items-center gap-2">
          <input type="text" value={acc.name} onChange={(e) => updateAccount(acc.id, "name", e.target.value)} placeholder="Account name" className="border p-1 flex-1" />
          <CurrencyInput
            value={acc.balance ?? 0}
            onChange={(value) => updateAccount(acc.id, "balance", value)} 
          ></CurrencyInput>
        </div>
      ))}

      <button onClick={addAccount} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add Account
      </button>
    </div>
  );
}
