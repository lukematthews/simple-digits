import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export function DarkModeMenuItem() {
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const darkMode = useThemeStore((state) => state.theme === "dark");

  return (
    <>
      <DropdownMenuItem onSelect={toggleTheme} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded">
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
      </DropdownMenuItem>
    </>
  );
}
