import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme: Theme =
    saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";

  return {
    theme: initialTheme,
    setTheme: (theme) => set({ theme }),
    toggleTheme: () => {
      const newTheme = get().theme === "dark" ? "light" : "dark";
      set({ theme: newTheme });
    },
  };
});
