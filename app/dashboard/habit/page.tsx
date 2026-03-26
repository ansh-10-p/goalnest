"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import {
  Plus, Search, Flame, X, ChevronRight, Check, Sparkles,
  CheckCircle2, Circle, Loader2,
} from "lucide-react";

function sanitizeText(input: unknown, maxLen = 80): string {
  if (typeof input !== "string") return "";
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLen);
}
function isValidTime(t: string) { return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t); }
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, isFinite(n) ? n : min)); }

const ALLOWED_EMOJIS = ["🏃","📚","🧘","💧","✍️","🚿","🍎","💻","🤸","🎯","🎨","🎵","🌿","🏋️","🧠","💤","☀️","🥗","📝","🚴"] as const;
type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];

const ALLOWED_CATEGORIES = ["Fitness","Learning","Wellness","Health","Mindfulness","Nutrition"] as const;
type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

const ALLOWED_FREQUENCIES = ["daily","weekdays","weekends","custom"] as const;
type AllowedFrequency = (typeof ALLOWED_FREQUENCIES)[number];

const ALL_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const;
type Day = (typeof ALL_DAYS)[number];

const COLOR_OPTIONS = [
  { label:"Orange", value:"bg-orange-50 dark:bg-orange-900/20", dot:"bg-orange-400" },
  { label:"Blue",   value:"bg-blue-50 dark:bg-blue-900/20",     dot:"bg-blue-400"   },
  { label:"Violet", value:"bg-violet-50 dark:bg-violet-900/20", dot:"bg-violet-400" },
  { label:"Cyan",   value:"bg-cyan-50 dark:bg-cyan-900/20",     dot:"bg-cyan-400"   },
  { label:"Pink",   value:"bg-pink-50 dark:bg-pink-900/20",     dot:"bg-pink-400"   },
  { label:"Teal",   value:"bg-teal-50 dark:bg-teal-900/20",     dot:"bg-teal-400"   },
  { label:"Red",    value:"bg-red-50 dark:bg-red-900/20",       dot:"bg-red-400"    },
  { label:"Indigo", value:"bg-indigo-50 dark:bg-indigo-900/20", dot:"bg-indigo-400" },
  { label:"Yellow", value:"bg-yellow-50 dark:bg-yellow-900/20", dot:"bg-yellow-400" },
  { label:"Green",  value:"bg-green-50 dark:bg-green-900/20",   dot:"bg-green-400"  },
] as const;
type ColorOption = (typeof COLOR_OPTIONS)[number];
const ALLOWED_COLOR_VALUES = COLOR_OPTIONS.map((c) => c.value) as string[];
function isAllowedColor(v: string): v is ColorOption["value"] { return ALLOWED_COLOR_VALUES.includes(v); }

interface Habit {
  id: string; name: string; emoji: AllowedEmoji;
  streak: number; progress: number; completed: boolean;
  color: ColorOption["value"]; category: AllowedCategory;
}
interface NewHabitPayload {
  name: string; emoji: AllowedEmoji; category: AllowedCategory; color: ColorOption["value"];
}

// ─── HabitCard ────────────────────────────────────────────────────────────────
function HabitCard({ habit, onToggle }: { habit: Habit; onToggle: () => void }) {
  const { name, emoji, streak, progress, completed, color, category } = habit;
  return (
    <div className={`${color} rounded-2xl p-4 border border-white/60 dark:border-white/5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`} role="article">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl select-none">{emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{category} · {streak}d streak</p>
          </div>
        </div>
        <button onClick={onToggle} aria-pressed={completed} className="shrink-0 mt-0.5 transition-transform active:scale-90">
          {completed
            ? <CheckCircle2 size={22} className="text-[#6366F1]" />
            : <Circle size={22} className="text-gray-300 dark:text-gray-600 hover:text-[#6366F1] transition-colors" />}
        </button>
      </div>
      <div className="mt-3 h-1.5 bg-gray-200/70 dark:bg-gray-700/60 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-[#6366F1] rounded-full transition-all duration-500" style={{ width: `${clamp(progress,0,100)}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1.5 text-right">{clamp(progress,0,100)}%</p>
    </div>
  );
}

// ─── NewHabitModal ────────────────────────────────────────────────────────────
type ModalStep = "basics" | "schedule" | "style";
const MODAL_STEPS: ModalStep[] = ["basics","schedule","style"];

function NewHabitModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (p: NewHabitPayload) => Promise<void> }) {
  const [step, setStep]               = useState<ModalStep>("basics");
  const [rawName, setRawName]         = useState("");
  const [emoji, setEmoji]             = useState<AllowedEmoji>("🎯");
  const [category, setCategory]       = useState<AllowedCategory>("Health");
  const [color, setColor]             = useState<ColorOption>(COLOR_OPTIONS[0]);
  const [frequency, setFrequency]     = useState<AllowedFrequency>("daily");
  const [selectedDays, setSelectedDays] = useState<Day[]>(["Mon","Tue","Wed","Thu","Fri"]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime]       = useState("08:00");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [nameError, setNameError]     = useState("");
  const [apiError, setApiError]       = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const stepIndex = MODAL_STEPS.indexOf(step);

  useEffect(() => {
    if (!open) return;
    setStep("basics"); setRawName(""); setEmoji("🎯"); setCategory("Health");
    setColor(COLOR_OPTIONS[0]); setFrequency("daily"); setSelectedDays(["Mon","Tue","Wed","Thu","Fri"]);
    setReminderEnabled(false); setReminderTime("08:00"); setShowEmojiPicker(false);
    setSubmitting(false); setSubmitted(false); setNameError(""); setApiError("");
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const validateName = useCallback((raw: string) => {
    const c = sanitizeText(raw, 40);
    if (!c) return "Habit name is required.";
    if (c.length < 2) return "Name must be at least 2 characters.";
    return "";
  }, []);

  const handleNext = async () => {
    if (step === "basics") {
      const err = validateName(rawName);
      if (err) { setNameError(err); inputRef.current?.focus(); return; }
      setStep("schedule");
    } else if (step === "schedule") {
      setStep("style");
    } else {
      const safeName = sanitizeText(rawName, 40);
      if (!safeName || safeName.length < 2) { setStep("basics"); return; }
      const safeEmoji: AllowedEmoji = ALLOWED_EMOJIS.includes(emoji as AllowedEmoji) ? emoji : "🎯";
      const safeCategory: AllowedCategory = ALLOWED_CATEGORIES.includes(category) ? category : "Health";
      const safeColor = isAllowedColor(color.value) ? color.value : COLOR_OPTIONS[0].value;
      setSubmitting(true); setApiError("");
      try {
        await onCreate({ name: safeName, emoji: safeEmoji, category: safeCategory, color: safeColor });
        setSubmitted(true);
        setTimeout(() => onClose(), 900);
      } catch (err: any) {
        setApiError(err.message ?? "Failed to create habit.");
        setSubmitting(false);
      }
    }
  };

  if (!open) return null;
  const previewColor = isAllowedColor(color.value) ? color.value : COLOR_OPTIONS[0].value;
  const displayName  = sanitizeText(rawName, 40) || "Your new habit";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)" }}
      role="dialog" aria-modal="true" onClick={(e) => { if (e.target===e.currentTarget) onClose(); }}>
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight:"92vh" }} onClick={(e) => e.stopPropagation()}>
        {submitted && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-[#111827]">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 animate-bounce">
              <Check size={28} className="text-green-500" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white text-lg">Habit Created!</p>
            <p className="text-sm text-gray-400 mt-1">Let's build that streak 🔥</p>
          </div>
        )}
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" /></div>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2"><Sparkles size={16} className="text-[#6366F1]" /><h2 className="font-semibold text-gray-900 dark:text-white text-base">New Habit</h2></div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><X size={16} /></button>
        </div>
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 shrink-0">
          {MODAL_STEPS.map((s, i) => {
            const done = i < stepIndex, active = s === step;
            return (
              <div key={s} className="flex items-center gap-2">
                <button onClick={() => done && setStep(s)} disabled={!done}
                  className={`flex items-center gap-1.5 text-xs font-medium transition ${active?"text-[#6366F1]":done?"text-gray-400 hover:text-[#6366F1] cursor-pointer":"text-gray-300 dark:text-gray-600 cursor-default"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done?"bg-[#6366F1] text-white":active?"bg-[#6366F1]/10 text-[#6366F1] ring-1 ring-[#6366F1]/40":"bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                    {done ? <Check size={10} /> : i+1}
                  </span>
                  <span className="capitalize hidden sm:inline">{s}</span>
                </button>
                {i < MODAL_STEPS.length-1 && <div className={`w-8 h-px ${done?"bg-[#6366F1]":"bg-gray-200 dark:bg-gray-700"}`} />}
              </div>
            );
          })}
        </div>
        <div className="px-5 pt-3 pb-5 overflow-y-auto flex-1">
          {apiError && <div className="mb-3 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-xs text-red-500">{apiError}</div>}

          {step === "basics" && (
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="relative">
                  <button aria-expanded={showEmojiPicker} onClick={() => setShowEmojiPicker((v) => !v)}
                    className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center border-2 transition select-none ${showEmojiPicker?"border-[#6366F1] bg-indigo-50 dark:bg-indigo-900/20":"border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-[#6366F1]"}`}
                  >{emoji}</button>
                  {showEmojiPicker && (
                    <div role="listbox" className="absolute top-14 left-0 z-20 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-xl grid grid-cols-5 gap-1 w-52">
                      {ALLOWED_EMOJIS.map((e) => (
                        <button key={e} role="option" aria-selected={emoji===e} onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                          className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition ${emoji===e?"bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-[#6366F1]/40":""}`}
                        >{e}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input ref={inputRef} type="text" placeholder="Habit name…" value={rawName}
                    onChange={(e) => { const v=e.target.value.slice(0,40); setRawName(v); if(nameError) setNameError(validateName(v)); }}
                    maxLength={40} autoComplete="off" aria-invalid={!!nameError}
                    className={`w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${nameError?"border-red-400 focus:ring-red-300":"border-gray-200 dark:border-gray-700 focus:ring-[#6366F1]/30 focus:border-[#6366F1]"}`}
                  />
                  <div className="flex justify-between mt-1">
                    {nameError ? <p role="alert" className="text-xs text-red-500">{nameError}</p> : <span />}
                    <p className="text-xs text-gray-400">{rawName.length}/40</p>
                  </div>
                </div>
              </div>
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Category</legend>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_CATEGORIES.map((cat) => (
                    <button key={cat} type="button" aria-pressed={category===cat} onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${category===cat?"bg-[#6366F1] text-white":"bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                    >{cat}</button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === "schedule" && (
            <div className="space-y-5">
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Frequency</legend>
                <div className="grid grid-cols-2 gap-2">
                  {ALLOWED_FREQUENCIES.map((f) => (
                    <button key={f} type="button" aria-pressed={frequency===f} onClick={() => setFrequency(f)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition capitalize ${frequency===f?"border-[#6366F1] bg-indigo-50 dark:bg-indigo-900/20 text-[#6366F1]":"border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#6366F1]/50"}`}
                    >{f}</button>
                  ))}
                </div>
              </fieldset>
              {frequency === "custom" && (
                <fieldset>
                  <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Select days</legend>
                  <div className="flex gap-2">
                    {ALL_DAYS.map((d) => (
                      <button key={d} type="button" aria-pressed={selectedDays.includes(d)} onClick={() => setSelectedDays((p) => p.includes(d)?p.filter((x)=>x!==d):[...p,d])}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${selectedDays.includes(d)?"bg-[#6366F1] text-white":"bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                      >{d[0]}</button>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Daily reminder</p>
                  <p className="text-xs text-gray-400 mt-0.5">Get notified to complete this habit</p>
                </div>
                <button type="button" role="switch" aria-checked={reminderEnabled} onClick={() => setReminderEnabled((v)=>!v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${reminderEnabled?"bg-[#6366F1]":"bg-gray-200 dark:bg-gray-700"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${reminderEnabled?"left-[22px]":"left-0.5"}`} />
                </button>
              </div>
              {reminderEnabled && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Reminder time</label>
                  <input type="time" value={reminderTime} onChange={(e) => { if(isValidTime(e.target.value)) setReminderTime(e.target.value); }}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] transition"
                  />
                </div>
              )}
            </div>
          )}

          {step === "style" && (
            <div className="space-y-5">
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Card color</legend>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button key={c.value} type="button" aria-pressed={color.value===c.value} aria-label={`${c.label} color`} onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition ring-offset-2 dark:ring-offset-[#111827] ${c.dot} ${color.value===c.value?"ring-2 ring-[#6366F1] scale-110":"hover:scale-105"}`}
                    />
                  ))}
                </div>
              </fieldset>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Preview</p>
                <div className={`${previewColor} rounded-2xl p-4 border border-white/60 dark:border-white/5`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{category} · 0 day streak</p>
                    </div>
                    <Circle size={22} className="text-gray-300 dark:text-gray-600 shrink-0" />
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-[#6366F1] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
          {step !== "basics" && (
            <button type="button" onClick={() => setStep(step==="style"?"schedule":"basics")}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >Back</button>
          )}
          <button type="button" onClick={handleNext} disabled={(step==="basics"&&rawName.trim().length===0)||submitting}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${(step==="basics"&&rawName.trim().length===0)||submitting?"bg-gray-100 dark:bg-gray-800 text-gray-300 cursor-not-allowed":"bg-[#6366F1] hover:bg-[#4F46E5] text-white"}`}
          >
            {submitting ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
             : step==="style" ? <><Check size={15} /> Create Habit</>
             : <>Next <ChevronRight size={15} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HabitsPage ───────────────────────────────────────────────────────────────
const ALL_FILTER_CATEGORIES = ["All", ...ALLOWED_CATEGORIES] as const;
type FilterCategory = (typeof ALL_FILTER_CATEGORIES)[number];

export default function HabitsPage() {
  const [habits, setHabits]             = useState<Habit[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [search, setSearch]             = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [modalOpen, setModalOpen]       = useState(false);

  const fetchHabits = useCallback(async (cat: FilterCategory, q: string) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (cat !== "All") params.set("category", cat);
      if (q) params.set("search", q);
      const res = await fetch(`/api/habits?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load habits.");
      const data = await res.json();
      setHabits(data.habits);
      setCompletedMap(Object.fromEntries(data.habits.map((h: Habit) => [h.id, h.completed])));
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchHabits(activeCategory, search), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [activeCategory, search, fetchHabits]);

  const toggleHabit = useCallback(async (id: string) => {
    setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    try {
      const res = await fetch(`/api/habits/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    } catch {
      setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  }, []);

  const handleCreate = useCallback(async (payload: NewHabitPayload) => {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to create habit.");
    setHabits((prev) => [{ ...data.habit, progress: 0, streak: 0, completed: false }, ...prev]);
    setCompletedMap((prev) => ({ ...prev, [data.habit.id]: false }));
  }, []);

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const topStreakHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Habits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {completedCount}/{habits.length} completed today
          </p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm">
          <Plus size={16} /> New Habit
        </button>
      </div>

      {topStreakHabit && topStreakHabit.streak > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-800/30 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
            <Flame size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{topStreakHabit.streak}-day streak on {topStreakHabit.name} 🔥</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Keep it up! You're building a lifelong habit.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="search" placeholder="Search habits…" value={search}
            onChange={(e) => setSearch(sanitizeText(e.target.value, 60))} maxLength={60} autoComplete="off"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] transition"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_FILTER_CATEGORIES.map((cat) => (
            <button key={cat} type="button" aria-pressed={activeCategory===cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${activeCategory===cat?"bg-[#6366F1] text-white":"bg-white dark:bg-[#111827] text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-[#6366F1] hover:text-[#6366F1]"}`}
            >{cat}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-400">
          <p className="text-sm">{error}</p>
          <button onClick={() => fetchHabits(activeCategory, search)} className="mt-2 text-xs text-indigo-400 underline">Retry</button>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm font-medium">{search || activeCategory!=="All" ? "No habits found" : "No habits yet"}</p>
          <p className="text-xs mt-1">{search || activeCategory!=="All" ? "Try a different search or category" : 'Click "New Habit" to get started'}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
          {habits.map((habit) => (
            <li key={habit.id}>
              <HabitCard habit={{ ...habit, completed: completedMap[habit.id] ?? habit.completed }} onToggle={() => toggleHabit(habit.id)} />
            </li>
          ))}
        </ul>
      )}

      <NewHabitModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
    </div>
  );
}