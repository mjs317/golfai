"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, History, Target } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "New Round", icon: Upload },
  { href: "/history", label: "History", icon: History },
  { href: "/coach", label: "Coach", icon: Target },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <>
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⛳</span>
              <span className="font-bold text-gray-900 text-lg">AI Golf Coach</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-1">Michael</span>
            </div>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      active ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}>
                    <Icon size={16} />{item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center">
          <span className="text-xl mr-2">⛳</span>
          <span className="font-bold text-gray-900">AI Golf Coach</span>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={clsx("flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors",
                  active ? "text-green-600" : "text-gray-500"
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
