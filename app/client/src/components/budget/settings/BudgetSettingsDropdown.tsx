import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { RenameBudgetDialog } from "./RenameBudgetDialog";
import { useBudgetStore } from "@/store/useBudgetStore";
import { DeleteBudgetDialog } from "./DeleteBudgetDialog";

export function BudgetSettingsDropdown({ onManageSharing }: { onRename?: () => void; onDelete?: () => void; onManageSharing?: () => void }) {
  const [renameIsOpen, setRenameIsOpen] = useState(false);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);
  const budget = useBudgetStore((s) => s.currentBudget);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open settings">
            <Menu className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-48" align="end">
          <DropdownMenuItem onClick={() => setRenameIsOpen(true)}>Rename Budget</DropdownMenuItem>
          <DropdownMenuItem onClick={onManageSharing}>Manage Sharing</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteIsOpen(true)} className="text-red-600">
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
