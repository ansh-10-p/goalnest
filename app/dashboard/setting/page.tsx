"use client";
 
import { useState } from "react";
import { User, Bell, Shield, Palette, CreditCard, ChevronRight, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
 
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white text-[15px]">{title}</h2>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800/80">{children}</div>
    </div>
  );
}
 
function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );
}
 
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-10 h-5 rounded-full transition-colors",
        checked ? "bg-[#6366F1]" : "bg-gray-200 dark:bg-gray-700"
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
 
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifs, setNotifs] = useState({ daily: true, streaks: true, goals: false, weekly: true });
  const [privacy, setPrivacy] = useState({ shareProfile: false, showActivity: true });
 
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>
 
      {/* Profile */}
      <Section title="Profile">
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
            AK
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">Arjun Kumar</p>
            <p className="text-sm text-gray-400">arjun@example.com</p>
            <span className="inline-block mt-1.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium px-2 py-0.5 rounded-full">Pro Plan</span>
          </div>
          <button className="flex items-center gap-1 text-sm text-[#6366F1] font-medium hover:underline">
            Edit <ChevronRight size={14} />
          </button>
        </div>
        <SettingRow label="Full name">
          <input
            defaultValue="Arjun Kumar"
            className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30"
          />
        </SettingRow>
        <SettingRow label="Email">
          <input
            defaultValue="arjun@example.com"
            className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30"
          />
        </SettingRow>
        <SettingRow label="Timezone">
          <select className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none">
            <option>Asia/Kolkata (IST)</option>
            <option>UTC</option>
            <option>America/New_York</option>
          </select>
        </SettingRow>
      </Section>
 
      {/* Appearance */}
      <Section title="Appearance">
        <div className="px-6 py-4">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Theme</p>
          <div className="flex gap-3">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border text-sm font-medium transition",
                  theme === value
                    ? "border-[#6366F1] bg-indigo-50 dark:bg-indigo-900/20 text-[#6366F1]"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>
 
      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow label="Daily reminders" description="Get reminded to complete your habits">
          <Toggle checked={notifs.daily} onChange={(v) => setNotifs({ ...notifs, daily: v })} />
        </SettingRow>
        <SettingRow label="Streak alerts" description="Know when you're about to break a streak">
          <Toggle checked={notifs.streaks} onChange={(v) => setNotifs({ ...notifs, streaks: v })} />
        </SettingRow>
        <SettingRow label="Goal milestones" description="Celebrate when you hit goal checkpoints">
          <Toggle checked={notifs.goals} onChange={(v) => setNotifs({ ...notifs, goals: v })} />
        </SettingRow>
        <SettingRow label="Weekly summary" description="Review your week every Sunday">
          <Toggle checked={notifs.weekly} onChange={(v) => setNotifs({ ...notifs, weekly: v })} />
        </SettingRow>
      </Section>
 
      {/* Privacy */}
      <Section title="Privacy">
        <SettingRow label="Public profile" description="Allow others to view your profile">
          <Toggle checked={privacy.shareProfile} onChange={(v) => setPrivacy({ ...privacy, shareProfile: v })} />
        </SettingRow>
        <SettingRow label="Show activity" description="Display your activity on public feed">
          <Toggle checked={privacy.showActivity} onChange={(v) => setPrivacy({ ...privacy, showActivity: v })} />
        </SettingRow>
      </Section>
 
      {/* Billing */}
      <Section title="Billing">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Pro Plan</p>
            <p className="text-xs text-gray-400 mt-0.5">₹499/month · Renews April 13, 2026</p>
          </div>
          <button className="text-sm text-[#6366F1] font-medium border border-[#6366F1]/30 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
            Manage
          </button>
        </div>
      </Section>
 
      {/* Save button */}
      <div className="flex justify-end">
        <button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40">
          Save changes
        </button>
      </div>
    </div>
  );
}