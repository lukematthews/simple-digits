import { WS_URL } from "@/config";
import { resetAllStores, useBudgetStore } from "@/store/useBudgetStore";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function ProfileMenu() {
  const [profile, setProfile] = useState<{ name: string; email: string; picture?: string } | null>(null);
  const budgets = useBudgetStore((s) => s.budgetSummaries);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${WS_URL}/auth/profile`, { credentials: "include" })
      .then((res) => res.json())
      .then(setProfile);
  }, []);

  const logout = async () => {
    resetAllStores();
    await fetch(`${WS_URL}/auth/logout`, { method: "POST", credentials: "include" });
    navigate("/");
  };

  if (!profile) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
          {profile.picture ? (
            <img src={profile.picture} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
              {profile.name[0]}
            </div>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          className="shadow-lg rounded-lg p-2 w-64 z-50 border bg-white"
        >
          <div className="px-3 py-2 border-b">
            <p className="font-semibold">{profile.name}</p>
            <p className="text-sm text-gray-600">{profile.email}</p>
          </div>

          <div className="px-3 py-2 border-b">
            <p className="text-xs text-gray-500 uppercase mb-1">Budgets</p>
            {budgets.map((budget) => (
              <DropdownMenu.Item
                key={budget.id}
                onSelect={() => navigate(`/b/${budget.shortCode}`)}
                className="cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
              >
                {budget.name}
              </DropdownMenu.Item>
            ))}
          </div>

          <DropdownMenu.Item
            onSelect={logout}
            className="text-red-600 cursor-pointer px-3 py-2 hover:bg-red-100"
          >
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
