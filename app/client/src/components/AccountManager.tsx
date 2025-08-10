import { useState, useMemo } from "react";
import { socket } from "@/lib/socket";
import { Account, WsEvent } from "@/types";
import { useBudgetStore } from "@/store/useBudgetStore";
import { Plus, Check, Trash2, ChevronDown } from "lucide-react";
import { CurrencyCellInput } from "./CurrencyCellInput";
import { useAccountsForMonth } from "@/hooks/useAccountsForMonth";
import { useActiveMonth } from "@/hooks/useActiveMonth";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type DraftAccount = {
  id: string;
  name: string;
  balance: number;
  monthId: string;
};

const emitSocket = (op: "create" | "update" | "delete", payload: Account) =>
  socket.emit("budgetEvent", {
    source: "frontend",
    entity: "account",
    operation: op,
    id: payload.id,
    payload,
  } as WsEvent<Account>);

export default function AccountManager() {
  const [drafts, setDrafts] = useState<DraftAccount[]>([]);
  const [open, setOpen] = useState(false);

  const deleteAccountInStore = useBudgetStore((s) => s.deleteAccount);
  const updateMonth = useBudgetStore((s) => s.updateMonth);

  const month = useActiveMonth();
  const accounts = useAccountsForMonth(month?.id);

  const total = useMemo(() => accounts.reduce((sum, acc) => sum + (parseFloat(String(acc.balance)) || 0), 0), [accounts]);

  if (!month) {
    return <div className="p-4 text-gray-500">No active month selected.</div>;
  }

  // -------- Handlers --------

  const handleAccountChange = (id: string, field: "name" | "balance", value: string | number) => {
    if (!month) return;
    const updatedAccounts = month.accounts.map((a) => (a.id === id ? { ...a, [field]: field === "balance" ? parseFloat(value as string) || 0 : value } : a));
    const updatedMonth = { ...month, accounts: updatedAccounts };
    updateMonth(updatedMonth);
  };

  const handleAccountChangeEmitEvent = (id: string, field: "name" | "balance", value: string | number) => {
    if (!month) return;
    const updatedAccounts = month.accounts.map((a) => (a.id === id ? { ...a, [field]: field === "balance" ? parseFloat(value as string) || 0 : value } : a));
    const account = updatedAccounts.find((a) => a.id === id);
    if (account) {
      const event: WsEvent<Account> = {
        source: "frontend",
        entity: "account",
        operation: "update",
        id: account.id!,
        payload: account,
      };
      socket.emit("budgetEvent", event);
    }
  };

  const deleteExisting = (acc: Account) => {
    deleteAccountInStore(acc.id!, acc.monthId!);
    emitSocket("delete", acc);
  };

  const addDraftRow = () =>
    setDrafts((d): DraftAccount[] => [
      ...d,
      {
        id: crypto.randomUUID(),
        name: "",
        balance: 0,
        monthId: month.id,
      },
    ]);

  const updateDraft = (id: string, field: keyof Account, value: string | number) =>
    setDrafts((all) =>
      all.map((d) =>
        d.id === id
          ? {
              ...d,
              [field]: field === "balance" ? (value as string) : value,
            }
          : d
      )
    );

  const saveDraft = (draft: DraftAccount) => {
    const numericBalance = parseFloat(String(draft.balance));

    setDrafts((d) => d.filter((row) => row.id !== draft.id));
    emitSocket("create", {
      ...draft,
      id: undefined,
      balance: isNaN(numericBalance) ? 0 : numericBalance,
    });
  };

  const discardDraft = (id: string) => setDrafts((d) => d.filter((row) => row.id !== id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 text-base font-semibold px-3 py-2 border border-gray-300 rounded hover:bg-gray-100">
          Accounts ${total.toFixed(2)}
          <ChevronDown size={16} className="text-gray-600" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[480px] p-4 space-y-4" align="end">
        <h2 className="text-lg font-semibold">Manage Accounts</h2>

        {/* Existing Accounts */}
        {accounts.map((acc) => (
          <div key={acc.id} className="flex items-center gap-2">
            <input
              className="min-w-[10ch] w-full px-2 py-1 border rounded"
              value={acc.name}
              placeholder="Account name"
              onChange={(e) => {
                handleAccountChange(acc.id!, "name", e.target.value);
              }}
              onBlur={(e) => handleAccountChange(acc.id!, "name", e.target.value)}
            />
            <CurrencyCellInput
              placeholder="0.00"
              value={acc.balance ?? ""}
              onChange={(v) => handleAccountChange(acc.id!, "balance", v)}
              onBlur={(v) => handleAccountChangeEmitEvent(acc.id!, "balance", v)}
            />
            <button className="p-1 text-red-500 hover:text-red-700" title="Delete" onClick={() => deleteExisting(acc)}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {/* Draft Accounts */}
        {drafts.map((draft) => (
          <div key={draft.id} className="flex items-center gap-2">
            <input className="min-w-[10ch] w-full px-2 py-1 border rounded" value={draft.name} placeholder="Account name" onChange={(e) => updateDraft(draft.id, "name", e.target.value)} />
            <CurrencyCellInput className="min-w-[10ch] w-full px-2 py-1 border rounded" value={draft.balance} placeholder="0.00" onChange={(v) => updateDraft(draft.id, "balance", v)} />
            <button className="p-1 text-green-600 hover:text-green-800" title="Save" onClick={() => saveDraft(draft)}>
              <Check size={18} />
            </button>
            <button className="p-1 text-red-500 hover:text-red-700" title="Discard" onClick={() => discardDraft(draft.id)}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <button onClick={addDraftRow} className="mt-2 flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
          <Plus size={16} /> Add Account
        </button>
      </PopoverContent>
    </Popover>
  );
}
