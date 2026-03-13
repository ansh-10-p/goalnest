"use client";
 
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BarChart3,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
 
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}
 
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/habit", label: "Habits", icon: CheckSquare },
  { href: "/dashboard/goal", label: "Goals", icon: Target },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/setting", label: "Settings", icon: Settings },

];
 
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
 
  return (
    <aside
      className={cn(
        "relative flex flex-col bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-5 py-6 border-b border-gray-100 dark:border-gray-800", collapsed && "justify-center px-3")}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-[15px] tracking-tight text-gray-900 dark:text-white">
            Streakly
          </span>
        )}
      </div>
 
      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-[#6366F1] text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className={cn("flex-shrink-0", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
 
      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} className="text-gray-500" /> : <ChevronLeft size={12} className="text-gray-500" />}
      </button>
 
      {/* Bottom user stub */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              AK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Arjun K.</p>
              <p className="text-xs text-gray-400 truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
 