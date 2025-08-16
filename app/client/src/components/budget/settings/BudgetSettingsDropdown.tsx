// BudgetSettingsDropdown.tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { RenameBudgetDialog } from "./RenameBudgetDialog";
import { useBudgetStore } from "@/store/useBudgetStore";
import { DeleteBudgetDialog } from "./DeleteBudgetDialog";
import { useNavigate } from "react-router-dom";

export function BudgetSettingsDropdown({ budgetName }: { budgetName: string }) {
  const [renameIsOpen, setRenameIsOpen] = useState(false);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);
  const budget = useBudgetStore((s) => s.currentBudget);
  const navigate = useNavigate();
  const budgets = useBudgetStore((s) => s.budgetSummaries);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-3xl font-bold hover:opacity-80 focus:outline-none">{budgetName}</button>
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={5} className="shadow-lg rounded-lg p-2 w-64 z-50 border bg-background">
          <div className="px-3 py-2 border-b">
            <p className="text-xs uppercase mb-1">Your Budgets</p>
            {budgets.map((budget) => (
              <DropdownMenuItem key={budget.id} onSelect={() => navigate(`/b/${budget.shortCode}`)} className="cursor-pointer px-2 py-1 rounded">
                {budget.name}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuItem className="px-2 py-1 rounded" onClick={() => setRenameIsOpen(true)}>Rename Budget</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteIsOpen(true)} className="px-2 py-1 text-red-600">
            Delete Budget
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {budget && (
        <>
          <RenameBudgetDialog open={renameIsOpen} onClose={() => setRenameIsOpen(false)} budgetId={budget.id} initialName={budget.name} initialShortCode={budget.shortCode} />
          <DeleteBudgetDialog open={deleteIsOpen} onClose={() => setDeleteIsOpen(false)} budgetId={budget.id} budgetName={budget.name} />
        </>
      )}
    </>
  );
}
