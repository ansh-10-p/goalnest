"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function TopNavbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Search goals, habits..."
          aria-label="Search"
          className={cn(
            "w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)]",
            "bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent",
            "transition-all duration-200"
          )}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 ml-4">
        {/* Theme Toggle */}
        {mounted && (
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] border border-[var(--border)] transition-all"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] border border-[var(--border)] transition-all relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--primary)] rounded-full ring-2 ring-[var(--sidebar-bg)]" />
        </button>

        {/* User Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              aria-label="User menu"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--border)] transition-all"
            >
              <Avatar.Root className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                <Avatar.Image src="" alt="User" />
                <Avatar.Fallback className="w-full h-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  JD
                </Avatar.Fallback>
              </Avatar.Root>
              <span className="hidden sm:block text-sm font-medium text-[var(--foreground)]">
                Jane Doe
              </span>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[var(--muted)]" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className={cn(
                "min-w-[180px] rounded-xl border border-[var(--border)] p-1.5 shadow-xl",
                "bg-[var(--card-bg)] text-[var(--foreground)]",
                "animate-in fade-in-0 zoom-in-95 duration-150"
              )}
            >
              <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-[var(--primary)] hover:text-white outline-none transition-colors">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-[var(--primary)] hover:text-white outline-none transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1.5 h-px bg-[var(--border)]" />
              <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-red-500 hover:text-white outline-none transition-colors text-[var(--muted)]">
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
