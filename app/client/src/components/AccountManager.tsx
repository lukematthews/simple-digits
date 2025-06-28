import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { Account, Month, WsEvent } from "@/types";
import { useBudgetStore } from "@/store/useBudgetStore";
import { CurrencyInput } from "./CurrencyInput";
import { Plus, Check, Trash2 } from "lucide-react";
import { CurrencyCellInput } from "./CurrencyCellInput";

type Props = { month: Month };

/** Simple helper: emit once, no debounce (spec says "on blur") */
const emitSocket = (op: "create" | "update" | "delete", payload: Account) =>
  socket.emit("budgetEvent", {
    source: "frontend",
    entity: "account",
    operation: op,
    id: payload.id,
    payload,
  } as WsEvent<Account>);

export default function AccountManager({ month }: Props) {
  /* ---------- GLOBAL STATE (existing accounts) -------------------- */
  const accounts = useBudgetStore((s) => s.currentBudget?.months.find((m) => m.id === month.id)?.accounts ?? []);
  const addAccountToStore = useBudgetStore((s) => s.addAccount);
  const updateAccountInStore = useBudgetStore((s) => s.updateAccount);
  const deleteAccountInStore = useBudgetStore((s) => s.deleteAccount);

  /* ---------- LOCAL STATE (draft rows not yet saved) -------------- */
  const [drafts, setDrafts] = useState<Account[]>([]);

  /* ---------- SOCKET LISTENERS ----------------------------------- */
  useEffect(() => {
    const handler = (msg: WsEvent<Account>) => {
      if (msg.entity !== "account" || msg.source !== "api") return;

      switch (msg.operation) {
        case "create":
          addAccountToStore(msg.payload);
          break;
        case "update":
          updateAccountInStore(msg.payload);
          break;
        case "delete":
          deleteAccountInStore(msg.payload.id!, msg.payload.monthId!);
          break;
      }
    };
    socket.on("budgetEvent", handler);
    return () => socket.off("budgetEvent", handler);
  }, [addAccountToStore, updateAccountInStore, deleteAccountInStore]);

  /* ---------- Handlers: EXISTING ACCOUNTS ------------------------- */
  const handleExistingChange = (id: string, field: keyof Account, value: string | number) => {
    const original = accounts.find((a) => a.id === id);
    if (!original) return;

    const updated: Account = {
      ...original,
      [field]: field === "balance" ? parseFloat(value as string) || 0 : value,
    };
    updateAccountInStore(updated); // live UI update
  };

  const handleExistingBlur = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (acc) emitSocket("update", acc);
  };

  const deleteExisting = (acc: Account) => {
    deleteAccountInStore(acc.id!, acc.monthId!); // optimistic
    emitSocket("delete", acc);
  };

  /* ---------- Handlers: DRAFT ACCOUNTS ---------------------------- */
  const addDraftRow = () =>
    setDrafts((d) => [
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
              [field]: field === "balance" ? parseFloat(value as string) || 0 : value,
            }
          : d
      )
    );

  const saveDraft = (draft: Account) => {
    // Emit create
    emitSocket("create", draft);
    // Remove local draft row (server echo will add real account)
    setDrafts((d) => d.filter((row) => row.id !== draft.id));
  };

  const discardDraft = (id: string) => setDrafts((d) => d.filter((row) => row.id !== id));

  /* ---------- UI -------------------------------------------------- */
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Accounts</h2>

      {/* Existing accounts */}
      {accounts.map((acc) => (
        <div key={acc.id} className="flex items-center gap-2">
          <input
            className="border p-1 flex-1"
            value={acc.name}
            placeholder="Account name"
            onChange={(e) => handleExistingChange(acc.id!, "name", e.target.value)}
            onBlur={() => handleExistingBlur(acc.id!)}
          />
          <CurrencyCellInput value={acc.balance ?? 0} onChange={(v) => handleExistingChange(acc.id!, "balance", v)}></CurrencyCellInput>
          <button className="p-1 text-red-500 hover:text-red-700" title="Delete" onClick={() => deleteExisting(acc)}>
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      {/* Draft rows */}
      {drafts.map((draft) => (
        <div key={draft.id} className="flex items-center gap-2">
          <input className="border p-1 flex-1" value={draft.name} placeholder="Account name" onChange={(e) => updateDraft(draft.id!, "name", e.target.value)} />
          <CurrencyInput value={String(draft.balance)} onChange={(v) => updateDraft(draft.id!, "balance", v)} />
          <button className="p-1 text-green-600 hover:text-green-800" title="Save" onClick={() => saveDraft(draft)}>
            <Check size={18} />
          </button>
          <button className="p-1 text-red-500 hover:text-red-700" title="Discard" onClick={() => discardDraft(draft.id!)}>
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
