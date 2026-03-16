"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, History, Target, Dumbbell, Sun, Moon, Monitor } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "New Round", icon: Upload },
  { href: "/history", label: "History", icon: History },
  { href: "/coach", label: "Coach", icon: Target },
  { href: "/range", label: "Range", icon: Dumbbell },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next: Record<string, { label: string; icon: React.ReactNode }> = {
    light: { label: "Dark", icon: <Moon size={15} /> },
    dark: { label: "System", icon: <Monitor size={15} /> },
    system: { label: "Light", icon: <Sun size={15} /> },
  };
  const current = next[theme];
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={`Switch to ${current.label} mode`}
    >
      {current.icon}
    </button>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  return (
    <>
      <header className="hidden md:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="logo" className="w-7 h-7" />
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">AI Golf Coach</span>
              <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium ml-1">Michael</span>
            </div>
            <div className="flex items-center gap-1">
              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}
                      className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                      )}>
                      <Icon size={16} />{item.label}
                    </Link>
                  );
                })}
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="logo" className="w-6 h-6" />
            <span className="font-bold text-gray-900 dark:text-gray-100">AI Golf Coach</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={clsx("flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors",
                  active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                )}>
                <Icon size={20} className="mb-0.5" />{item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
