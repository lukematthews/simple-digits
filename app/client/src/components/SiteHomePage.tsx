import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useThemeStore } from "@/store/useThemeStore";

export default function HomePage() {
  // Correctly get the toggleTheme function and darkMode boolean
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const darkMode = useThemeStore((state) => state.theme === "dark");

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-start pt-28 px-4 text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100">
          Simple Digits
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-xl">
          Basic budgeting – only what you need!
        </p>

        {/* Feature Highlights */}
        <div className="space-y-2 text-gray-800 dark:text-gray-300 text-base md:text-lg">
          <p>✅ Track your transactions</p>
          <p>🏦 See all your bank accounts</p>
          <p>📅 Plan days, months, years ahead</p>
        </div>

        {/* CTA Button */}
        <Link
          to="/login"
          className="mt-6 inline-block bg-blue-600 text-white py-3 px-8 rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          Start Budgeting
        </Link>

        {/* Microcopy */}
        <p className="text-sm text-gray-800 dark:text-gray-400 mt-2">
          Free to use. No credit card required.
        </p>
      </div>

      {/* Screenshot Preview Skeleton */}
      <div className="mt-24 flex justify-center px-4">
        <div className="w-full max-w-5xl h-72 bg-gray-200 dark:bg-gray-700 rounded-xl shadow-inner flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg select-none">
          [ Product Screenshot Placeholder ]
        </div>
      </div>

      {/* Social Proof Skeleton */}
      <div className="mt-16 text-center text-gray-600 dark:text-gray-400 text-sm px-4">
        [ Social proof placeholder — e.g. “Trusted by 1,200+ users worldwide” ]
      </div>

      {/* Testimonial Skeleton */}
      <div className="mt-20 px-4 py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-300 italic select-none">
          [ Testimonial placeholder — “Simple Digits helped me take control of my finances...” ]
        </div>
      </div>

      {/* Footer Skeleton */}
      <footer className="mt-16 py-8 text-center text-sm text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 select-none">
        [ Footer Placeholder — Privacy | Terms | Contact ]
      </footer>
    </div>
  );
}
