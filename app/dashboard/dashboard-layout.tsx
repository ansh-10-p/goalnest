"use client";
 
import { useState } from "react";
import Sidebar from "./sidebar";
import DashboardNavbar from "./navbar";
 
interface DashboardLayoutProps {
  children: React.ReactNode;
}
 
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 
  return (
    <div className="flex h-screen bg-[#F4F5F7] dark:bg-[#0F172A] overflow-hidden font-['Geist',sans-serif]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}