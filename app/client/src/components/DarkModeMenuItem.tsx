import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function DarkModeMenuItem() {
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const darkMode = useThemeStore((state) => state.theme === "dark");

  return (
    <>
      <DropdownMenu.Item onSelect={toggleTheme} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100">
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
      </DropdownMenu.Item>
    </>
  );
}
