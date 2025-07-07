import { useBudgetStore } from "@/store/useBudgetStore";
import { Role } from "@/types";

function isEditableRole(role: Role): role is 'OWNER' | 'EDITOR' {
  return role === 'OWNER' || role === 'EDITOR';
}

export function useCanEditBudget(): boolean {
  const { currentBudget, accessMap } = useBudgetStore();

  if (!currentBudget) return false;

  const role = accessMap[currentBudget.id];
  return isEditableRole(role);
}
