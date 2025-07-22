import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { useNavigate } from "react-router-dom";

type DeleteBudgetDialogProps = {
  open: boolean;
  onClose: () => void;
  budgetName: string;
  budgetId: string;
};

export function DeleteBudgetDialog({ open, onClose, budgetName, budgetId }: DeleteBudgetDialogProps) {
  const navigate = useNavigate();
  const [confirmationText, setConfirmationText] = useState("");

  const expected = `delete ${budgetName}`;
  const isConfirmed = confirmationText.trim().toLowerCase() === expected.toLowerCase();

  const onConfirm = async () => {
    try {
      socket.emit("budgetEvent", {
        source: "frontend",
        entity: "budget",
        operation: "delete",
        payload: {
          id: budgetId,
        },
      });
      onClose();
      navigate('/b', { replace: true });
    } catch (err) {
      console.error(err);
      alert("Failed to update budget");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete Budget</DialogTitle>
            <div className="my-2">
              <strong>WARNING!</strong> This will permanently delete the budget <strong>{budgetName}</strong>, including all of its months, transactions, and accounts.
            </div>
            <div className="mb-2">
              This action cannot be undone.
            </div>
            <div>
              To confirm, please type: <code className="font-mono bg-muted px-1 rounded">delete {budgetName}</code>
            </div>
        </DialogHeader>

        <Input autoFocus value={confirmationText} onChange={(e) => setConfirmationText(e.target.value)} />

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!isConfirmed}>
            Delete Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
