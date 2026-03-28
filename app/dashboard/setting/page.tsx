"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Moon, Sun, Monitor, Loader2, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// ─── Components ───────────────────────────────────────────────────────────────
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
    <button onClick={()=>onChange(!checked)} role="switch" aria-checked={checked}
      className={cn("relative w-10 h-5 rounded-full transition-colors", checked?"bg-[#6366F1]":"bg-gray-200 dark:bg-gray-700")}>
      <span className={cn("absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform", checked?"translate-x-5":"translate-x-0")}/>
    </button>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Settings {
  name: string;
  email: string;
  timezone: string;
  theme: "light" | "dark" | "system";
  notifications: { daily: boolean; streaks: boolean; goals: boolean; weekly: boolean };
  privacy: { shareProfile: boolean; showActivity: boolean };
}

const TIMEZONES = [
  "Asia/Kolkata","UTC","America/New_York","America/Los_Angeles",
  "Europe/London","Europe/Paris","Asia/Tokyo","Australia/Sydney",
];

// ─── SettingsPage ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<Settings>({
    name: "", email: "", timezone: "Asia/Kolkata", theme: "system",
    notifications: { daily:true, streaks:true, goals:false, weekly:true },
    privacy: { shareProfile:false, showActivity:true },
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string|null>(null);

  // Load settings
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings.");
        const data: Settings = await res.json();
        setSettings(data);
        if (data.theme) setTheme(data.theme);
      } catch (err: any) {
        setError(err.message ?? "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const updateNotif = (key: keyof Settings["notifications"], val: boolean) =>
    setSettings(s => ({ ...s, notifications: { ...s.notifications, [key]: val } }));

  const updatePrivacy = (key: keyof Settings["privacy"], val: boolean) =>
    setSettings(s => ({ ...s, privacy: { ...s.privacy, [key]: val } }));

  const handleThemeChange = (t: string) => {
    setTheme(t);
    setSettings(s => ({ ...s, theme: t as Settings["theme"] }));
  };

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save.");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
      </div>
    );
  }

  const initials = settings.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Profile */}
      <Section title="Profile">
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
            {initials}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{settings.name || "—"}</p>
            <p className="text-sm text-gray-400">{settings.email}</p>
          </div>
        </div>
        <SettingRow label="Full name">
          <input
            value={settings.name}
            onChange={(e) => setSettings(s => ({ ...s, name: e.target.value.slice(0, 80) }))}
            maxLength={80}
            className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 w-44"
          />
        </SettingRow>
        <SettingRow label="Email">
          <input
            value={settings.email}
            readOnly
            className="text-sm bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-400 cursor-not-allowed w-44"
          />
        </SettingRow>
        <SettingRow label="Timezone">
          <select
            value={settings.timezone}
            onChange={(e) => setSettings(s => ({ ...s, timezone: e.target.value }))}
            className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </SettingRow>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="px-6 py-4">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Theme</p>
          <div className="flex gap-3">
            {[{value:"light",icon:Sun,label:"Light"},{value:"dark",icon:Moon,label:"Dark"},{value:"system",icon:Monitor,label:"System"}].map(({value,icon:Icon,label})=>(
              <button key={value} onClick={()=>handleThemeChange(value)}
                className={cn("flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border text-sm font-medium transition",
                  (settings.theme??theme)===value
                    ?"border-[#6366F1] bg-indigo-50 dark:bg-indigo-900/20 text-[#6366F1]"
                    :"border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                )}>
                <Icon size={18}/>{label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow label="Daily reminders" description="Get reminded to complete your habits">
          <Toggle checked={settings.notifications.daily}   onChange={v=>updateNotif("daily",v)}/>
        </SettingRow>
        <SettingRow label="Streak alerts" description="Know when you're about to break a streak">
          <Toggle checked={settings.notifications.streaks} onChange={v=>updateNotif("streaks",v)}/>
        </SettingRow>
        <SettingRow label="Goal milestones" description="Celebrate when you hit goal checkpoints">
          <Toggle checked={settings.notifications.goals}   onChange={v=>updateNotif("goals",v)}/>
        </SettingRow>
        <SettingRow label="Weekly summary" description="Review your week every Sunday">
          <Toggle checked={settings.notifications.weekly}  onChange={v=>updateNotif("weekly",v)}/>
        </SettingRow>
      </Section>

      {/* Privacy */}
      <Section title="Privacy">
        <SettingRow label="Public profile" description="Allow others to view your profile">
          <Toggle checked={settings.privacy.shareProfile} onChange={v=>updatePrivacy("shareProfile",v)}/>
        </SettingRow>
        <SettingRow label="Show activity" description="Display your activity on public feed">
          <Toggle checked={settings.privacy.showActivity} onChange={v=>updatePrivacy("showActivity",v)}/>
        </SettingRow>
      </Section>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-500 font-medium">
            <Check size={15}/> Saved!
          </span>
        )}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm">
          {saving ? <><Loader2 size={15} className="animate-spin"/> Saving…</> : "Save changes"}
        </button>
      </div>
    </div>
  );
}