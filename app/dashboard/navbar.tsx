"use client";
 
import { useState } from "react";
import { Bell, Search, Sun, Moon, Menu, ChevronDown, LogOut, User, CreditCard, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
 
interface DashboardNavbarProps {
  onMenuToggle: () => void;
}
 
export default function DashboardNavbar({ onMenuToggle }: DashboardNavbarProps) {
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
 
  const notifications = [
    { id: 1, text: "Morning run streak: 7 days! 🔥", time: "2m ago", unread: true },
    { id: 2, text: "Goal 'Read 12 books' is 75% complete", time: "1h ago", unread: true },
    { id: 3, text: "Weekly summary is ready", time: "3h ago", unread: false },
  ];
 
  return (
    <header className="h-16 bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Menu toggle (mobile) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>
 
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search habits, goals…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] transition"
            aria-label="Search"
          />
        </div>
      </div>
 
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
 
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6366F1] rounded-full" />
          </button>
 
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</p>
                <button className="text-xs text-[#6366F1] font-medium hover:underline">Mark all read</button>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className={cn("px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition", n.unread && "bg-indigo-50/50 dark:bg-indigo-900/10")}>
                  <div className={cn("w-2 h-2 mt-1.5 rounded-full flex-shrink-0", n.unread ? "bg-[#6366F1]" : "bg-gray-200 dark:bg-gray-600")} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
 
        {/* User avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              AK
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">Arjun K.</span>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>
 
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Arjun Kumar</p>
                <p className="text-xs text-gray-400">arjun@example.com</p>
              </div>
              {[
                { icon: User, label: "Profile" },
                { icon: CreditCard, label: "Billing" },
                { icon: Settings, label: "Settings" },
              ].map(({ icon: Icon, label }) => (
                <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
                  <Icon size={15} className="text-gray-400" />
                  {label}
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-700">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition">
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
 
      {/* Backdrop to close dropdowns */}
      {(dropdownOpen || notifOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setDropdownOpen(false); setNotifOpen(false); }} />
      )}
    </header>
  );
}
 