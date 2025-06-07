import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import CurrencyInput from "react-currency-input-field";
import { Trash2 } from "lucide-react";

interface Account {
  id: number;
  name: string;
  balance: number;
}

interface Props {
  account: Account;
  onUpdate: (id: number, data: Partial<Account>) => void;
  onDelete: (id: number) => void;
}

export function EditableAccountRow({ account, onUpdate, onDelete }: Props) {
  const [name, setName] = useState(account.name);
  const [balanceStr, setBalanceStr] = useState("" + account.balance);

  // 🔁 Sync local state with incoming account prop changes
  useEffect(() => {
    setName(account.name);
    setBalanceStr(account.balance ? ''+ account.balance : "");
  }, [account]);

  // Debounced update function for balance
  const debouncedBalanceUpdate = useCallback(
    debounce((value: string) => {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        onUpdate(account.id, { balance: parsed });
      }
    }, 400),
    [account.id]
  );

  return (
    <>
      <input
        className="border p-1"
        value={name}
        onChange={(e) => {
          const newName = e.target.value;
          setName(newName);
          onUpdate(account.id, { name: newName });
        }}
      />
      <CurrencyInput
        className="border p-1"
        value={balanceStr}
        allowDecimals
        allowNegativeValue
        decimalsLimit={2}
        onValueChange={(value) => {
          setBalanceStr(value ? "" + value : "");
        }}
        onBlur={() => debouncedBalanceUpdate("" + balanceStr)}
        intlConfig={{ locale: "en-AU", currency: "AUD" }}
      />
      <Trash2 className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-800" onClick={() => onDelete(account.id)} />
    </>
  );
}
