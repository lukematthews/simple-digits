import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

export function DarkModeToggle() {
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const darkMode = useThemeStore((state) => state.theme === "dark");

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
