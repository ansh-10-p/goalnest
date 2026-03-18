"use client";
 
import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import {
  Plus, Search, Flame, X, ChevronRight, Check, Sparkles,
  CheckCircle2, Circle, BookOpen, Dumbbell, Brain, Heart,
  Droplets, Pencil,
} from "lucide-react";
 
// ─── Security helpers ────────────────────────────────────────────────────────
 
/** Strip control characters, limit length, trim. Returns empty string on bad input. */
function sanitizeText(input: unknown, maxLen = 80): string {
  if (typeof input !== "string") return "";
  // Remove null bytes and other control chars (except newlines for future textarea use)
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLen);
}
 
/** Validate time string HH:MM (24h). */
function isValidTime(t: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);
}
 
/** Clamp a number between min and max. */
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, isFinite(n) ? n : min));
}
 
/** Generate a collision-safe ID using the Web Crypto API. */
function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // Fallback for environments without crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
 
// ─── Constants / allowlists ──────────────────────────────────────────────────
 
const ALLOWED_EMOJIS = [
  "🏃","📚","🧘","💧","✍️","🚿","🍎","💻","🤸","🎯",
  "🎨","🎵","🌿","🏋️","🧠","💤","☀️","🥗","📝","🚴",
] as const;
type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];
 
const ALLOWED_CATEGORIES = ["Fitness", "Learning", "Wellness", "Health", "Mindfulness", "Nutrition"] as const;
type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];
 
const ALLOWED_FREQUENCIES = ["daily", "weekdays", "weekends", "custom"] as const;
type AllowedFrequency = (typeof ALLOWED_FREQUENCIES)[number];
 
const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof ALL_DAYS)[number];
 
const COLOR_OPTIONS = [
  { label: "Orange", value: "bg-orange-50 dark:bg-orange-900/20", dot: "bg-orange-400" },
  { label: "Blue",   value: "bg-blue-50 dark:bg-blue-900/20",    dot: "bg-blue-400"   },
  { label: "Violet", value: "bg-violet-50 dark:bg-violet-900/20",dot: "bg-violet-400" },
  { label: "Cyan",   value: "bg-cyan-50 dark:bg-cyan-900/20",    dot: "bg-cyan-400"   },
  { label: "Pink",   value: "bg-pink-50 dark:bg-pink-900/20",    dot: "bg-pink-400"   },
  { label: "Teal",   value: "bg-teal-50 dark:bg-teal-900/20",    dot: "bg-teal-400"   },
  { label: "Red",    value: "bg-red-50 dark:bg-red-900/20",      dot: "bg-red-400"    },
  { label: "Indigo", value: "bg-indigo-50 dark:bg-indigo-900/20",dot: "bg-indigo-400" },
  { label: "Yellow", value: "bg-yellow-50 dark:bg-yellow-900/20",dot: "bg-yellow-400" },
  { label: "Green",  value: "bg-green-50 dark:bg-green-900/20",  dot: "bg-green-400"  },
] as const;
type ColorOption = (typeof COLOR_OPTIONS)[number];
const ALLOWED_COLOR_VALUES = COLOR_OPTIONS.map((c) => c.value) as string[];
 
function isAllowedColor(v: string): v is ColorOption["value"] {
  return ALLOWED_COLOR_VALUES.includes(v);
}
 
// ─── Types ───────────────────────────────────────────────────────────────────
 
interface Habit {
  id: string;
  name: string;           // sanitized plain text
  emoji: AllowedEmoji;
  streak: number;         // 0–9999
  progress: number;       // 0–100
  completed: boolean;
  color: ColorOption["value"];
  category: AllowedCategory;
}
 
// ─── Seed data ───────────────────────────────────────────────────────────────
 
const SEED_HABITS: Habit[] = [
  { id: genId(), name: "Morning Run",    emoji: "🏃", streak: 12, progress: 100, completed: true,  color: "bg-orange-50 dark:bg-orange-900/20", category: "Fitness"     },
  { id: genId(), name: "Read 30 mins",   emoji: "📚", streak:  7, progress:  65, completed: false, color: "bg-blue-50 dark:bg-blue-900/20",    category: "Learning"    },
  { id: genId(), name: "Meditate",       emoji: "🧘", streak: 21, progress: 100, completed: true,  color: "bg-violet-50 dark:bg-violet-900/20",category: "Wellness"    },
  { id: genId(), name: "Drink 8 glasses",emoji: "💧", streak:  5, progress:  50, completed: false, color: "bg-cyan-50 dark:bg-cyan-900/20",    category: "Health"      },
  { id: genId(), name: "Journaling",     emoji: "✍️", streak:  3, progress:  80, completed: false, color: "bg-pink-50 dark:bg-pink-900/20",    category: "Wellness"    },
  { id: genId(), name: "Cold Shower",    emoji: "🚿", streak:  9, progress:   0, completed: false, color: "bg-teal-50 dark:bg-teal-900/20",    category: "Health"      },
  { id: genId(), name: "No Sugar",       emoji: "🍎", streak:  2, progress: 100, completed: true,  color: "bg-red-50 dark:bg-red-900/20",      category: "Health"      },
  { id: genId(), name: "Code 1 hour",    emoji: "💻", streak: 15, progress: 100, completed: true,  color: "bg-indigo-50 dark:bg-indigo-900/20",category: "Learning"    },
  { id: genId(), name: "Stretch",        emoji: "🤸", streak:  4, progress:  40, completed: false, color: "bg-yellow-50 dark:bg-yellow-900/20",category: "Fitness"     },
];
 
// ─── HabitCard ────────────────────────────────────────────────────────────────
 
interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
}
 
function HabitCard({ habit, onToggle }: HabitCardProps) {
  const { name, emoji, streak, progress, completed, color, category } = habit;
 
  return (
    <div
      className={`${color} rounded-2xl p-4 border border-white/60 dark:border-white/5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
      role="article"
      aria-label={`Habit: ${name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl select-none" aria-hidden="true">{emoji}</span>
          <div className="min-w-0">
            {/* name is plain text — safe to render directly */}
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{category} · {streak}d streak</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          aria-label={completed ? `Mark ${name} incomplete` : `Mark ${name} complete`}
          aria-pressed={completed}
          className="shrink-0 mt-0.5 transition-transform active:scale-90"
        >
          {completed
            ? <CheckCircle2 size={22} className="text-[#6366F1]" />
            : <Circle size={22} className="text-gray-300 dark:text-gray-600 hover:text-[#6366F1] transition-colors" />
          }
        </button>
      </div>
 
      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-gray-200/70 dark:bg-gray-700/60 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full bg-[#6366F1] rounded-full transition-all duration-500"
          style={{ width: `${clamp(progress, 0, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1.5 text-right">{clamp(progress, 0, 100)}%</p>
    </div>
  );
}
 
// ─── NewHabitModal ─────────────────────────────────────────────────────────────
 
interface NewHabitPayload {
  name: string;
  emoji: AllowedEmoji;
  category: AllowedCategory;
  color: ColorOption["value"];
}
 
interface NewHabitModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: NewHabitPayload) => void;
}
 
type ModalStep = "basics" | "schedule" | "style";
const MODAL_STEPS: ModalStep[] = ["basics", "schedule", "style"];
 
function NewHabitModal({ open, onClose, onCreate }: NewHabitModalProps) {
  // Form state
  const [step, setStep]                     = useState<ModalStep>("basics");
  const [rawName, setRawName]               = useState("");
  const [emoji, setEmoji]                   = useState<AllowedEmoji>("🎯");
  const [category, setCategory]             = useState<AllowedCategory>("Health");
  const [color, setColor]                   = useState<ColorOption>(COLOR_OPTIONS[0]);
  const [frequency, setFrequency]           = useState<AllowedFrequency>("daily");
  const [selectedDays, setSelectedDays]     = useState<Day[]>(["Mon","Tue","Wed","Thu","Fri"]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime]     = useState("08:00");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [nameError, setNameError]           = useState("");
 
  const inputRef    = useRef<HTMLInputElement>(null);
  const modalRef    = useRef<HTMLDivElement>(null);
  const stepIndex   = MODAL_STEPS.indexOf(step);
 
  // Reset on open
  useEffect(() => {
    if (!open) return;
    setStep("basics");
    setRawName("");
    setEmoji("🎯");
    setCategory("Health");
    setColor(COLOR_OPTIONS[0]);
    setFrequency("daily");
    setSelectedDays(["Mon","Tue","Wed","Thu","Fri"]);
    setReminderEnabled(false);
    setReminderTime("08:00");
    setShowEmojiPicker(false);
    setSubmitted(false);
    setNameError("");
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);
 
  // Trap focus inside modal & close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);
 
  // ── Validation ──────────────────────────────────────────────────────────────
 
  const validateName = useCallback((raw: string): string => {
    const clean = sanitizeText(raw, 40);
    if (clean.length === 0) return "Habit name is required.";
    if (clean.length < 2)   return "Name must be at least 2 characters.";
    return "";
  }, []);
 
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow typing but cap at 40 raw chars — sanitize on save
    setRawName(val.slice(0, 40));
    if (nameError) setNameError(validateName(val));
  };
 
  const handleNext = () => {
    if (step === "basics") {
      const err = validateName(rawName);
      if (err) { setNameError(err); inputRef.current?.focus(); return; }
      setStep("schedule");
    } else if (step === "schedule") {
      setStep("style");
    } else {
      handleCreate();
    }
  };
 
  // ── Submit ──────────────────────────────────────────────────────────────────
 
  const handleCreate = () => {
    // Final server-safe sanitization / validation before emitting
    const safeName = sanitizeText(rawName, 40);
    if (!safeName || safeName.length < 2) { setStep("basics"); return; }
 
    // Validate emoji against allowlist
    const safeEmoji: AllowedEmoji = ALLOWED_EMOJIS.includes(emoji as AllowedEmoji)
      ? (emoji as AllowedEmoji) : "🎯";
 
    // Validate category against allowlist
    const safeCategory: AllowedCategory = ALLOWED_CATEGORIES.includes(category as AllowedCategory)
      ? (category as AllowedCategory) : "Health";
 
    // Validate color against allowlist
    const safeColorValue = isAllowedColor(color.value) ? color.value : COLOR_OPTIONS[0].value;
 
    setSubmitted(true);
    setTimeout(() => {
      onCreate({ name: safeName, emoji: safeEmoji, category: safeCategory, color: safeColorValue });
      onClose();
    }, 900);
  };
 
  // ── Day toggle ───────────────────────────────────────────────────────────────
 
  const toggleDay = (day: Day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };
 
  // ── Keyboard nav for emoji picker ────────────────────────────────────────────
 
  const handleEmojiKey = (e: KeyboardEvent<HTMLButtonElement>, em: AllowedEmoji) => {
    if (e.key === "Enter" || e.key === " ") { setEmoji(em); setShowEmojiPicker(false); }
  };
 
  if (!open) return null;
 
  const previewColor = isAllowedColor(color.value) ? color.value : COLOR_OPTIONS[0].value;
  const displayName  = sanitizeText(rawName, 40) || "Your new habit";
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Create new habit"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="relative w-full sm:max-w-md bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success overlay */}
        {submitted && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-[#111827]" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 animate-bounce">
              <Check size={28} className="text-green-500" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white text-lg">Habit Created!</p>
            <p className="text-sm text-gray-400 mt-1">Let's build that streak 🔥</p>
          </div>
        )}
 
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
 
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#6366F1]" aria-hidden="true" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">New Habit</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={16} />
          </button>
        </div>
 
        {/* Step indicators */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 shrink-0" aria-label="Steps">
          {MODAL_STEPS.map((s, i) => {
            const done   = i < stepIndex;
            const active = s === step;
            return (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => done && setStep(s)}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${s}`}
                  disabled={!done}
                  className={`flex items-center gap-1.5 text-xs font-medium transition ${
                    active ? "text-[#6366F1]" : done ? "text-gray-400 hover:text-[#6366F1] cursor-pointer" : "text-gray-300 dark:text-gray-600 cursor-default"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    done  ? "bg-[#6366F1] text-white" :
                    active? "bg-[#6366F1]/10 text-[#6366F1] ring-1 ring-[#6366F1]/40" :
                            "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  }`}>
                    {done ? <Check size={10} /> : i + 1}
                  </span>
                  <span className="capitalize hidden sm:inline">{s}</span>
                </button>
                {i < MODAL_STEPS.length - 1 && (
                  <div className={`w-8 h-px transition ${done ? "bg-[#6366F1]" : "bg-gray-200 dark:bg-gray-700"}`} aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
 
        {/* Body */}
        <div className="px-5 pt-3 pb-5 overflow-y-auto flex-1">
 
          {/* ── STEP 1: Basics ── */}
          {step === "basics" && (
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                {/* Emoji picker button */}
                <div className="relative">
                  <button
                    aria-label={`Selected emoji: ${emoji}. Click to change.`}
                    aria-expanded={showEmojiPicker}
                    onClick={() => setShowEmojiPicker((v) => !v)}
                    className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center border-2 transition select-none ${
                      showEmojiPicker
                        ? "border-[#6366F1] bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-[#6366F1]"
                    }`}
                  >
                    {emoji}
                  </button>
 
                  {showEmojiPicker && (
                    <div
                      role="listbox"
                      aria-label="Choose emoji"
                      className="absolute top-14 left-0 z-20 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-xl grid grid-cols-5 gap-1 w-52"
                    >
                      {ALLOWED_EMOJIS.map((e) => (
                        <button
                          key={e}
                          role="option"
                          aria-selected={emoji === e}
                          aria-label={`Emoji ${e}`}
                          onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                          onKeyDown={(ev) => handleEmojiKey(ev, e)}
                          className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition select-none ${
                            emoji === e ? "bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-[#6366F1]/40" : ""
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
 
                {/* Name input */}
                <div className="flex-1">
                  <label htmlFor="habit-name" className="sr-only">Habit name</label>
                  <input
                    id="habit-name"
                    ref={inputRef}
                    type="text"
                    placeholder="Habit name…"
                    value={rawName}
                    onChange={handleNameChange}
                    maxLength={40}
                    autoComplete="off"
                    spellCheck={false}
                    aria-describedby={nameError ? "habit-name-error" : undefined}
                    aria-invalid={!!nameError}
                    className={`w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                      nameError
                        ? "border-red-400 focus:ring-red-300 focus:border-red-400"
                        : "border-gray-200 dark:border-gray-700 focus:ring-[#6366F1]/30 focus:border-[#6366F1]"
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    {nameError
                      ? <p id="habit-name-error" role="alert" className="text-xs text-red-500">{nameError}</p>
                      : <span />
                    }
                    <p className="text-xs text-gray-400">{rawName.length}/40</p>
                  </div>
                </div>
              </div>
 
              {/* Category */}
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Category</legend>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={category === cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        category === cat
                          ? "bg-[#6366F1] text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
 
          {/* ── STEP 2: Schedule ── */}
          {step === "schedule" && (
            <div className="space-y-5">
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Frequency</legend>
                <div className="grid grid-cols-2 gap-2">
                  {ALLOWED_FREQUENCIES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={frequency === f}
                      onClick={() => setFrequency(f)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition capitalize ${
                        frequency === f
                          ? "border-[#6366F1] bg-indigo-50 dark:bg-indigo-900/20 text-[#6366F1]"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#6366F1]/50"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </fieldset>
 
              {/* Custom day picker */}
              {frequency === "custom" && (
                <fieldset>
                  <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Select days</legend>
                  <div className="flex gap-2" role="group" aria-label="Days of the week">
                    {ALL_DAYS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={selectedDays.includes(d)}
                        aria-label={d}
                        onClick={() => toggleDay(d)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                          selectedDays.includes(d)
                            ? "bg-[#6366F1] text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {d[0]}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
 
              {/* Reminder toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Daily reminder</p>
                  <p className="text-xs text-gray-400 mt-0.5">Get notified to complete this habit</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={reminderEnabled}
                  aria-label="Toggle daily reminder"
                  onClick={() => setReminderEnabled((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${reminderEnabled ? "bg-[#6366F1]" : "bg-gray-200 dark:bg-gray-700"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${reminderEnabled ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
              </div>
 
              {reminderEnabled && (
                <div>
                  <label htmlFor="reminder-time" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                    Reminder time
                  </label>
                  <input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isValidTime(val)) setReminderTime(val);
                    }}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] transition"
                  />
                </div>
              )}
            </div>
          )}
 
          {/* ── STEP 3: Style ── */}
          {step === "style" && (
            <div className="space-y-5">
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Card color</legend>
                <div className="flex flex-wrap gap-2.5" role="group" aria-label="Color options">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      aria-pressed={color.value === c.value}
                      aria-label={`${c.label} color`}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition ring-offset-2 dark:ring-offset-[#111827] ${c.dot} ${
                        color.value === c.value ? "ring-2 ring-[#6366F1] scale-110" : "hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
              </fieldset>
 
              {/* Live preview */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Preview</p>
                <div className={`${previewColor} rounded-2xl p-4 border border-white/60 dark:border-white/5`} aria-label="Habit card preview">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none" aria-hidden="true">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{category} · 0 day streak</p>
                    </div>
                    <Circle size={22} className="text-gray-300 dark:text-gray-600 shrink-0" aria-hidden="true" />
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" aria-hidden="true">
                    <div className="h-full w-0 bg-[#6366F1] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
 
        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
          {step !== "basics" && (
            <button
              type="button"
              onClick={() => setStep(step === "style" ? "schedule" : "basics")}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={step === "basics" && rawName.trim().length === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition shadow-sm ${
              step === "basics" && rawName.trim().length === 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-indigo-200 dark:shadow-indigo-900/40"
            }`}
          >
            {step === "style" ? (
              <><Check size={15} aria-hidden="true" /> Create Habit</>
            ) : (
              <>Next <ChevronRight size={15} aria-hidden="true" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ─── HabitsPage (main export) ─────────────────────────────────────────────────
 
const ALL_FILTER_CATEGORIES = ["All", ...ALLOWED_CATEGORIES] as const;
type FilterCategory = (typeof ALL_FILTER_CATEGORIES)[number];
 
export default function HabitsPage() {
  const [habits, setHabits]                 = useState<Habit[]>(SEED_HABITS);
  const [completedMap, setCompletedMap]     = useState<Record<string, boolean>>(
    Object.fromEntries(SEED_HABITS.map((h) => [h.id, h.completed]))
  );
  const [search, setSearch]                 = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [modalOpen, setModalOpen]           = useState(false);
 
  const toggleHabit = useCallback((id: string) => {
    setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);
 
  /** Validate + add a new habit from the modal payload */
  const handleCreate = useCallback((payload: NewHabitPayload) => {
    const safeName = sanitizeText(payload.name, 40);
    if (!safeName || safeName.length < 2) return;
 
    const safeEmoji: AllowedEmoji = ALLOWED_EMOJIS.includes(payload.emoji) ? payload.emoji : "🎯";
    const safeCategory: AllowedCategory = ALLOWED_CATEGORIES.includes(payload.category) ? payload.category : "Health";
    const safeColor = isAllowedColor(payload.color) ? payload.color : COLOR_OPTIONS[0].value;
 
    const newHabit: Habit = {
      id:        genId(),
      name:      safeName,
      emoji:     safeEmoji,
      category:  safeCategory,
      color:     safeColor,
      streak:    0,
      progress:  0,
      completed: false,
    };
 
    setHabits((prev) => [newHabit, ...prev]);
    setCompletedMap((prev) => ({ ...prev, [newHabit.id]: false }));
  }, []);
 
  // Sanitize search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(sanitizeText(e.target.value, 60));
  };
 
  const filtered = habits.filter((h) => {
    const q = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) &&
      (activeCategory === "All" || h.category === activeCategory)
    );
  });
 
  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const totalStreak    = habits.reduce((acc, h) => acc + clamp(h.streak, 0, 9999), 0);
 
  // The longest streaked habit for the banner
  const topStreakHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];
 
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Habits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {completedCount}/{habits.length} completed today · {totalStreak} total streak days
          </p>
        </div>
        <button
          type="button"
          aria-label="Create new habit"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
        >
          <Plus size={16} aria-hidden="true" />
          New Habit
        </button>
      </div>
 
      {/* Streak banner */}
      {topStreakHabit && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-800/30 rounded-2xl p-4 flex items-center gap-4" role="status">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500" aria-hidden="true">
            <Flame size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {clamp(topStreakHabit.streak, 0, 9999)}-day streak on {topStreakHabit.name} 🔥
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Keep it up! You're building a lifelong habit.</p>
          </div>
        </div>
      )}
 
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
          <label htmlFor="habit-search" className="sr-only">Search habits</label>
          <input
            id="habit-search"
            type="search"
            placeholder="Search habits…"
            value={search}
            onChange={handleSearchChange}
            maxLength={60}
            autoComplete="off"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] transition"
          />
        </div>
 
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by category">
          {ALL_FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-[#6366F1] text-white"
                  : "bg-white dark:bg-[#111827] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-[#6366F1] hover:text-[#6366F1]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
 
      {/* Habit grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400" role="status">
          <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
          <p className="text-sm font-medium">No habits found</p>
          <p className="text-xs mt-1">Try a different search or category</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
          {filtered.map((habit) => (
            <li key={habit.id}>
              <HabitCard
                habit={{ ...habit, completed: completedMap[habit.id] ?? habit.completed }}
                onToggle={() => toggleHabit(habit.id)}
              />
            </li>
          ))}
        </ul>
      )}
 
      {/* New habit modal */}
      <NewHabitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}