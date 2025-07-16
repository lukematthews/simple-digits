// RenameBudgetDialog.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { socket } from "@/lib/socket";

interface BudgetSettingsForm {
  name: string;
  shortCode: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  budgetId: string;
  initialName: string;
  initialShortCode: string;
}

const camelCase = (str: string) =>
  str
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join("");

export function RenameBudgetDialog({ open, onClose, budgetId, initialName, initialShortCode }: Props) {
  const [autoShortCode, setAutoShortCode] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BudgetSettingsForm>({
    defaultValues: {
      name: initialName,
      shortCode: initialShortCode,
    },
    mode: "onChange",
  });

  const nameWatch = watch("name");

  useEffect(() => {
    if (autoShortCode) {
      setValue("shortCode", camelCase(nameWatch || ""), { shouldValidate: false });
    }
  }, [nameWatch, autoShortCode]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      socket.emit("budgetEvent", {
        source: "frontend",
        entity: "budget",
        operation: "update",
        payload: {
          id: budgetId,
          name: data.name,
          shortCode: data.shortCode,
        },
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update budget");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Budget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input {...register("name", { required: true })} />
            {errors.name && <p className="text-red-500 text-xs">Name is required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 flex justify-between">
              <span>Short Code</span>
              <label className="text-xs text-gray-600 flex items-center gap-1">
                <input type="checkbox" checked={autoShortCode} onChange={() => setAutoShortCode((v) => !v)} />
                Auto
              </label>
            </label>
            <Input
              {...register("shortCode")}
              readOnly={autoShortCode}
              className={autoShortCode ? "bg-gray-100 cursor-not-allowed" : ""}
              onChange={(e) => setValue("shortCode", e.target.value, { shouldValidate: true })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!isValid} onClick={onSubmit}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
