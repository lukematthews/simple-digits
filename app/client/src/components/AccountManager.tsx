import { useState } from "react";
import { socket } from "@/lib/socket";
import { Account, WsEvent } from "@/types";
import { useBudgetStore } from "@/store/useBudgetStore";
import { Plus, Check, Trash2 } from "lucide-react";
import { CurrencyCellInput } from "./CurrencyCellInput";
import { useAccountsForMonth } from "@/hooks/useAccountsForMonth";
import { useActiveMonth } from "@/hooks/useActiveMonth";

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
  const updateAccountInStore = useBudgetStore((s) => s.updateAccount);
  const deleteAccountInStore = useBudgetStore((s) => s.deleteAccount);
  const month = useActiveMonth();
  const accounts = useAccountsForMonth(month?.id);
  if (!month) {
    return <div className="p-4 text-gray-500">No active month selected.</div>;
  }

  // -------- EXISTING HANDLERS --------
  const handleExistingChange = (id: string, field: keyof Account, value: string | number) => {
    const original = accounts.find((a) => a.id === id);
    if (!original) return;

    const updated: Account = {
      ...original,
      [field]: field === "balance" ? parseFloat(value as string) || 0 : value,
    };
    updateAccountInStore(updated);
    if (updated) emitSocket("update", updated);
  };

  const handleExistingBlur = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (acc) emitSocket("update", acc);
  };

  const deleteExisting = (acc: Account) => {
    deleteAccountInStore(acc.id!, acc.monthId!);
    emitSocket("delete", acc);
  };

  // -------- DRAFT HANDLERS --------
  const addDraftRow = () =>
    setDrafts((d): DraftAccount[] => [
      ...d,
      {
        id: crypto.randomUUID(),
        name: "",
        balance: 0, // stays a string
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
      id: undefined, // backend assigns ID
      balance: isNaN(numericBalance) ? 0 : numericBalance,
    });
  };

  const discardDraft = (id: string) => setDrafts((d) => d.filter((row) => row.id !== id));

  // -------- UI --------
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Accounts</h2>

      {/* Existing accounts */}
      {accounts.map((acc) => (
        <div key={acc.id} className="flex items-center gap-2">
          <input
            className="min-w-[10ch] w-full px-2 py-1 border rounded"
            value={acc.name}
            placeholder="Account name"
            onChange={(e) => handleExistingChange(acc.id!, "name", e.target.value)}
            onBlur={() => handleExistingBlur(acc.id!)}
          />
          <CurrencyCellInput className="min-w-[10ch] w-full px-2 py-1 border rounded" placeholder="0.00" value={acc.balance ?? 0} onChange={(v) => handleExistingChange(acc.id!, "balance", v)} />
          <button className="p-1 text-red-500 hover:text-red-700" title="Delete" onClick={() => deleteExisting(acc)}>
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      {/* Draft accounts */}
      {drafts.map((draft) => (
        <div key={draft.id} className="flex items-center gap-2">
          <input className="min-w-[10ch] w-full px-2 py-1 border rounded" value={draft.name} placeholder="Account name" onChange={(e) => updateDraft(draft.id, "name", e.target.value)} />
          <CurrencyCellInput value={draft.balance} placeholder="0.00" onChange={(v) => updateDraft(draft.id, "balance", v)} />
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
    </div>
  );
}
