"use client";

import {
  useState, useRef, useEffect, useCallback,
  type KeyboardEvent, type ChangeEvent,
} from "react";
import {
  Plus, Target, CheckCircle2, Circle, Clock, AlertTriangle,
  Trophy, ChevronRight, X, Check, Flag, Milestone, CalendarDays,
  Layers, TrendingUp, Flame, Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Security helpers ────────────────────────────────────────────────────────

function sanitizeText(input: unknown, maxLen = 120): string {
  if (typeof input !== "string") return "";
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLen);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, isFinite(n) ? n : min));
}

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = Date.parse(s);
  return !isNaN(d);
}

// ─── Constants / allowlists ──────────────────────────────────────────────────

const ALLOWED_PRIORITIES = ["critical", "high", "medium", "low"] as const;
type Priority = (typeof ALLOWED_PRIORITIES)[number];

const ALLOWED_STATUSES = ["active", "completed", "overdue"] as const;
type GoalStatus = (typeof ALLOWED_STATUSES)[number];

const ALLOWED_CATEGORIES = ["Career", "Health", "Finance", "Learning", "Personal", "Creative"] as const;
type GoalCategory = (typeof ALLOWED_CATEGORIES)[number];

const ALL_FILTER_TABS = ["All", "Active", "Completed", "Overdue"] as const;
type FilterTab = (typeof ALL_FILTER_TABS)[number];

const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label: "Critical", color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-900/20",    dot: "bg-red-500"    },
  high:     { label: "High",     color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", dot: "bg-orange-500" },
  medium:   { label: "Medium",   color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/20",  dot: "bg-amber-400"  },
  low:      { label: "Low",      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", dot: "bg-emerald-500" },
};

const CATEGORY_COLORS: Record<GoalCategory, string> = {
  Career:   "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  Health:   "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  Finance:  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  Learning: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  Personal: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  Creative: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  text: string;       // sanitized
  done: boolean;
}

interface Goal {
  id: string;
  title: string;          // sanitized, max 80
  description: string;    // sanitized, max 200
  category: GoalCategory;
  priority: Priority;
  deadline: string;       // YYYY-MM-DD validated
  milestones: Milestone[];
  createdAt: string;      // ISO date string
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function daysUntil(deadlineStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(deadlineStr); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function deriveStatus(goal: Goal): GoalStatus {
  const progress = goalProgress(goal);
  if (progress === 100) return "completed";
  if (daysUntil(goal.deadline) < 0) return "overdue";
  return "active";
}

function goalProgress(goal: Goal): number {
  if (goal.milestones.length === 0) return 0;
  const done = goal.milestones.filter((m) => m.done).length;
  return Math.round((done / goal.milestones.length) * 100);
}

function deadlineLabel(days: number): { text: string; color: string } {
  if (days < 0)  return { text: `${Math.abs(days)}d overdue`,  color: "text-red-500" };
  if (days === 0) return { text: "Due today",                   color: "text-red-500" };
  if (days <= 3)  return { text: `${days}d left`,               color: "text-orange-500" };
  if (days <= 7)  return { text: `${days}d left`,               color: "text-amber-500" };
  return           { text: `${days}d left`,                      color: "text-gray-400" };
}

function formatDeadline(deadlineStr: string): string {
  const d = new Date(deadlineStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Seed data ────────────────────────────────────────────────────────────────

function makeGoal(
  title: string, description: string, category: GoalCategory,
  priority: Priority, deadlineDaysFromNow: number, milestoneTexts: string[],
  doneCount = 0,
): Goal {
  const d = new Date();
  d.setDate(d.getDate() + deadlineDaysFromNow);
  const deadline = d.toISOString().split("T")[0];
  const milestones: Milestone[] = milestoneTexts.map((t, i) => ({
    id: genId(), text: t, done: i < doneCount,
  }));
  return { id: genId(), title, description, category, priority, deadline, milestones, createdAt: new Date().toISOString() };
}

const SEED_GOALS: Goal[] = [
  makeGoal(
    "Launch personal portfolio", "Build and deploy a polished portfolio showcasing my best work",
    "Career", "high", 18,
    ["Design wireframes", "Build homepage", "Add projects section", "Write case studies", "Deploy to Vercel"],
    2
  ),
  makeGoal(
    "Run a 5K under 25 min", "Train consistently to hit my 5K personal best",
    "Health", "medium", 45,
    ["Week 1-2: base runs 3×/week", "Week 3-4: tempo runs", "Week 5-6: interval training", "Race day"],
    1
  ),
  makeGoal(
    "Save ₹1,00,000 emergency fund", "Build 3 months of expenses as a safety net",
    "Finance", "critical", 90,
    ["Audit monthly expenses", "Cut subscriptions", "Set auto-transfer ₹10k/mo", "Reach ₹50k milestone", "Reach ₹1L milestone"],
    2
  ),
  makeGoal(
    "Complete AWS Solutions Architect", "Pass the AWS SAA-C03 certification exam",
    "Learning", "high", 60,
    ["Finish EC2 & networking modules", "Study S3, RDS, DynamoDB", "Take 3 practice exams", "Score 85%+ on mock", "Book & pass real exam"],
    1
  ),
  makeGoal(
    "Write 30-page short story", "Draft and edit a complete short fiction piece",
    "Creative", "low", -5,
    ["Outline plot & characters", "Write first 10 pages", "Write pages 11-20", "Write pages 21-30", "Edit & proofread"],
    3
  ),
  makeGoal(
    "Learn conversational Spanish", "Reach B1 level in Spanish for a trip to Spain",
    "Personal", "medium", 120,
    ["Complete Duolingo basics", "100 hours on Pimsleur", "Find language exchange partner", "Watch 20 Spanish films", "Pass B1 practice test"],
    0
  ),
];

// ─── GoalCard ──────────────────────────────────────────────────────────────────

interface GoalCardProps {
  goal: Goal;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
}

function GoalCard({ goal, onToggleMilestone }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status   = deriveStatus(goal);
  const progress = goalProgress(goal);
  const days     = daysUntil(goal.deadline);
  const dl       = deadlineLabel(days);
  const pm       = PRIORITY_META[goal.priority];

  const statusConfig = {
    active:    { icon: <Clock size={12} />,         label: "Active",    cls: "text-blue-500 bg-blue-50 dark:bg-blue-900/20"     },
    completed: { icon: <Trophy size={12} />,        label: "Completed", cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    overdue:   { icon: <AlertTriangle size={12} />, label: "Overdue",   cls: "text-red-500 bg-red-50 dark:bg-red-900/20"         },
  }[status];

  const progressColor =
    status === "completed" ? "bg-emerald-500" :
    status === "overdue"   ? "bg-red-400" :
    progress >= 70         ? "bg-indigo-500" :
    progress >= 40         ? "bg-amber-400" : "bg-gray-300 dark:bg-gray-600";

  return (
    <article
      className="bg-white dark:bg-[#1a2235] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      aria-label={`Goal: ${goal.title}`}
    >
      {/* Top accent bar by priority */}
      <div className={`h-1 w-full ${pm.dot}`} aria-hidden="true" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusConfig.cls}`}>
                {statusConfig.icon}{statusConfig.label}
              </span>
              {/* Category badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${CATEGORY_COLORS[goal.category]}`}>
                {goal.category}
              </span>
              {/* Priority badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${pm.bg} ${pm.color}`}>
                <Flag size={10} />{pm.label}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{goal.title}</h3>
            {goal.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{goal.description}</p>
            )}
          </div>

          {/* Progress ring */}
          <div className="shrink-0 relative w-12 h-12" aria-label={`${progress}% complete`}>
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
                className="text-gray-100 dark:text-gray-800" />
              <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                stroke={status === "completed" ? "#10b981" : status === "overdue" ? "#ef4444" : "#6366f1"}
                strokeDasharray={`${(progress / 100) * 94.2} 94.2`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
              {progress}%
            </span>
          </div>
        </div>

        {/* Deadline & milestone count */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5 text-gray-400">
            <CalendarDays size={12} aria-hidden="true" />
            <span>{formatDeadline(goal.deadline)}</span>
            <span aria-live="polite" className={`font-semibold ${dl.color}`}>· {dl.text}</span>
          </div>
          <span className="text-gray-400">
            {goal.milestones.filter((m) => m.done).length}/{goal.milestones.length} milestones
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3"
          role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
            style={{ width: `${clamp(progress, 0, 100)}%` }} />
        </div>

        {/* Milestones toggle */}
        {goal.milestones.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#6366F1] transition font-medium w-full text-left"
          >
            <Layers size={12} aria-hidden="true" />
            {expanded ? "Hide" : "Show"} milestones
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        {/* Milestone list */}
        {expanded && (
          <ul className="mt-3 space-y-2" aria-label="Milestones">
            {goal.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label={m.done ? `Mark "${m.text}" incomplete` : `Mark "${m.text}" complete`}
                  aria-pressed={m.done}
                  onClick={() => onToggleMilestone(goal.id, m.id)}
                  className="shrink-0 transition-transform active:scale-90"
                >
                  {m.done
                    ? <CheckCircle2 size={16} className="text-[#6366F1]" />
                    : <Circle size={16} className="text-gray-300 dark:text-gray-600 hover:text-[#6366F1] transition-colors" />
                  }
                </button>
                <span className={`text-xs ${m.done ? "line-through text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-300"}`}>
                  {m.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

// ─── NewGoalModal ─────────────────────────────────────────────────────────────

interface NewGoalPayload {
  title: string;
  description: string;
  category: GoalCategory;
  priority: Priority;
  deadline: string;
  milestones: string[];
}

interface NewGoalModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: NewGoalPayload) => void;
}

type ModalStep = "basics" | "milestones";
const MODAL_STEPS: ModalStep[] = ["basics", "milestones"];

function NewGoalModal({ open, onClose, onCreate }: NewGoalModalProps) {
  const [step, setStep]               = useState<ModalStep>("basics");
  const [title, setTitle]             = useState("");
  const [description, setDesc]        = useState("");
  const [category, setCategory]       = useState<GoalCategory>("Career");
  const [priority, setPriority]       = useState<Priority>("medium");
  const [deadline, setDeadline]       = useState("");
  const [milestoneInputs, setMInputs] = useState<string[]>(["", "", ""]);
  const [titleError, setTitleError]   = useState("");
  const [dateError, setDateError]     = useState("");
  const [submitted, setSubmitted]     = useState(false);

  const titleRef    = useRef<HTMLInputElement>(null);
  const stepIndex   = MODAL_STEPS.indexOf(step);

  // Min deadline = tomorrow
  const minDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  useEffect(() => {
    if (!open) return;
    setStep("basics"); setTitle(""); setDesc(""); setCategory("Career");
    setPriority("medium"); setDeadline(""); setMInputs(["", "", ""]);
    setTitleError(""); setDateError(""); setSubmitted(false);
    setTimeout(() => titleRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const validateBasics = (): boolean => {
    let ok = true;
    const t = sanitizeText(title, 80);
    if (t.length < 3) { setTitleError("Title must be at least 3 characters."); ok = false; }
    else setTitleError("");
    if (!deadline || !isValidDateString(deadline)) { setDateError("Please pick a valid deadline."); ok = false; }
    else setDateError("");
    return ok;
  };

  const addMilestoneField = () => {
    if (milestoneInputs.length >= 10) return;
    setMInputs((p) => [...p, ""]);
  };

  const updateMilestone = (i: number, val: string) => {
    setMInputs((p) => p.map((v, idx) => idx === i ? val.slice(0, 100) : v));
  };

  const removeMilestone = (i: number) => {
    setMInputs((p) => p.filter((_, idx) => idx !== i));
  };

  const handleNext = () => {
    if (step === "basics") {
      if (!validateBasics()) return;
      setStep("milestones");
    } else {
      handleCreate();
    }
  };

  const handleCreate = () => {
    const safeTitle    = sanitizeText(title, 80);
    const safeDesc     = sanitizeText(description, 200);
    const safeCategory: GoalCategory = ALLOWED_CATEGORIES.includes(category) ? category : "Career";
    const safePriority: Priority     = ALLOWED_PRIORITIES.includes(priority)  ? priority : "medium";
    const safeDeadline = isValidDateString(deadline) ? deadline : minDate;
    const safeMilestones = milestoneInputs
      .map((m) => sanitizeText(m, 100))
      .filter((m) => m.length >= 2);

    setSubmitted(true);
    setTimeout(() => {
      onCreate({ title: safeTitle, description: safeDesc, category: safeCategory,
                 priority: safePriority, deadline: safeDeadline, milestones: safeMilestones });
      onClose();
    }, 900);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      role="dialog" aria-modal="true" aria-label="Create new goal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-lg bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "94vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success overlay */}
        {submitted && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-[#111827]" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 animate-bounce">
              <Trophy size={28} className="text-emerald-500" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">Goal Set!</p>
            <p className="text-sm text-gray-400 mt-1">Now make it happen 🚀</p>
          </div>
        )}

        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-emerald-500" aria-hidden="true" />
            <h2 className="font-bold text-gray-900 dark:text-white text-base">New Goal</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X size={16} />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 shrink-0">
          {MODAL_STEPS.map((s, i) => {
            const done = i < stepIndex; const active = s === step;
            return (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => done && setStep(s)}
                  disabled={!done}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-1.5 text-xs font-medium transition ${
                    active ? "text-emerald-600" : done ? "text-gray-400 hover:text-emerald-600 cursor-pointer" : "text-gray-300 dark:text-gray-600 cursor-default"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    done  ? "bg-emerald-500 text-white" :
                    active? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 ring-1 ring-emerald-400/40" :
                            "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  }`}>
                    {done ? <Check size={10} /> : i + 1}
                  </span>
                  <span className="capitalize hidden sm:inline">{s === "basics" ? "Details" : "Milestones"}</span>
                </button>
                {i < MODAL_STEPS.length - 1 && (
                  <div className={`w-10 h-px ${done ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-5 pt-3 pb-5 overflow-y-auto flex-1 space-y-4">

          {/* ── STEP 1: Details ── */}
          {step === "basics" && (
            <>
              {/* Title */}
              <div>
                <label htmlFor="goal-title" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Goal title <span className="text-red-400">*</span>
                </label>
                <input
                  id="goal-title" ref={titleRef} type="text"
                  placeholder="e.g. Run a 5K under 25 minutes"
                  value={title} onChange={(e) => { setTitle(e.target.value.slice(0, 80)); if (titleError) setTitleError(""); }}
                  maxLength={80} autoComplete="off"
                  aria-invalid={!!titleError} aria-describedby={titleError ? "goal-title-err" : undefined}
                  className={`w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                    titleError ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-emerald-400/30 focus:border-emerald-500"
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {titleError && <p id="goal-title-err" role="alert" className="text-xs text-red-500">{titleError}</p>}
                  <p className="text-xs text-gray-400 ml-auto">{title.length}/80</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="goal-desc" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Description <span className="text-gray-300">(optional)</span></label>
                <textarea
                  id="goal-desc" rows={2}
                  placeholder="Why does this goal matter to you?"
                  value={description} onChange={(e) => setDesc(e.target.value.slice(0, 200))}
                  maxLength={200}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{description.length}/200</p>
              </div>

              {/* Category */}
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Category</legend>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_CATEGORIES.map((cat) => (
                    <button key={cat} type="button" aria-pressed={category === cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        category === cat ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}>{cat}</button>
                  ))}
                </div>
              </fieldset>

              {/* Priority */}
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Priority</legend>
                <div className="grid grid-cols-2 gap-2">
                  {ALLOWED_PRIORITIES.map((p) => {
                    const meta = PRIORITY_META[p];
                    return (
                      <button key={p} type="button" aria-pressed={priority === p}
                        onClick={() => setPriority(p)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
                          priority === p ? `border-transparent ${meta.bg} ${meta.color}` : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Deadline */}
              <div>
                <label htmlFor="goal-deadline" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Deadline <span className="text-red-400">*</span>
                </label>
                <input
                  id="goal-deadline" type="date"
                  value={deadline} min={minDate}
                  onChange={(e) => { setDeadline(e.target.value); if (dateError) setDateError(""); }}
                  aria-invalid={!!dateError} aria-describedby={dateError ? "goal-date-err" : undefined}
                  className={`w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 transition ${
                    dateError ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-emerald-400/30 focus:border-emerald-500"
                  }`}
                />
                {dateError && <p id="goal-date-err" role="alert" className="text-xs text-red-500 mt-1">{dateError}</p>}
              </div>
            </>
          )}

          {/* ── STEP 2: Milestones ── */}
          {step === "milestones" && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Break it down into milestones</p>
                <p className="text-xs text-gray-400">Add up to 10 checkpoints. Progress is calculated from these.</p>
              </div>

              {milestoneInputs.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] font-bold flex items-center justify-center shrink-0" aria-hidden="true">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    aria-label={`Milestone ${i + 1}`}
                    placeholder={`Milestone ${i + 1}…`}
                    value={val}
                    onChange={(e) => updateMilestone(i, e.target.value)}
                    maxLength={100}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition"
                  />
                  {milestoneInputs.length > 1 && (
                    <button type="button" aria-label={`Remove milestone ${i + 1}`} onClick={() => removeMilestone(i)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}

              {milestoneInputs.length < 10 && (
                <button type="button" onClick={addMilestoneField}
                  className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition mt-1">
                  <Plus size={14} aria-hidden="true" /> Add milestone
                </button>
              )}

              <p className="text-xs text-gray-400 pt-1">
                💡 You can skip milestones — progress will be tracked manually later.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
          {step !== "basics" && (
            <button type="button" onClick={() => setStep("basics")}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Back
            </button>
          )}
          <button
            type="button" onClick={handleNext}
            disabled={step === "basics" && title.trim().length === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition shadow-sm ${
              step === "basics" && title.trim().length === 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-300 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 dark:shadow-emerald-900/40"
            }`}
          >
            {step === "milestones" ? (
              <><Trophy size={15} aria-hidden="true" /> Set Goal</>
            ) : (
              <>Next <ChevronRight size={15} aria-hidden="true" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GoalsPage (main export) ──────────────────────────────────────────────────

export default function GoalsPage() {
  const [goals, setGoals]           = useState<Goal[]>(SEED_GOALS);
  const [activeTab, setActiveTab]   = useState<FilterTab>("All");
  const [modalOpen, setModalOpen]   = useState(false);
  const [sortBy, setSortBy]         = useState<"deadline" | "priority">("deadline");

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id !== goalId ? g : {
          ...g,
          milestones: g.milestones.map((m) =>
            m.id !== milestoneId ? m : { ...m, done: !m.done }
          ),
        }
      )
    );
  }, []);

  const handleCreate = useCallback((payload: NewGoalPayload) => {
    const safeTitle    = sanitizeText(payload.title, 80);
    if (safeTitle.length < 3) return;
    const safeDeadline = isValidDateString(payload.deadline) ? payload.deadline : (() => {
      const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split("T")[0];
    })();
    const safeCategory: GoalCategory = ALLOWED_CATEGORIES.includes(payload.category) ? payload.category : "Career";
    const safePriority: Priority     = ALLOWED_PRIORITIES.includes(payload.priority)  ? payload.priority : "medium";
    const milestones: Milestone[]    = payload.milestones.map((t) => ({
      id: genId(), text: sanitizeText(t, 100), done: false,
    }));

    const newGoal: Goal = {
      id: genId(),
      title: safeTitle,
      description: sanitizeText(payload.description, 200),
      category: safeCategory,
      priority: safePriority,
      deadline: safeDeadline,
      milestones,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [newGoal, ...prev]);
  }, []);

  // Derived stats
  const activeGoals    = goals.filter((g) => deriveStatus(g) === "active");
  const overdueGoals   = goals.filter((g) => deriveStatus(g) === "overdue");
  const completedGoals = goals.filter((g) => deriveStatus(g) === "completed");
  const avgProgress    = goals.length
    ? Math.round(goals.reduce((a, g) => a + goalProgress(g), 0) / goals.length)
    : 0;

  const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const filtered = goals
    .filter((g) => {
      if (activeTab === "All") return true;
      return deriveStatus(g) === activeTab.toLowerCase();
    })
    .sort((a, b) =>
      sortBy === "deadline"
        ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        : PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeGoals.length} active · {completedGoals.length} completed · {avgProgress}% avg progress
          </p>
        </div>
        <button
          type="button"
          aria-label="Create new goal"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40"
        >
          <Plus size={16} aria-hidden="true" />
          New Goal
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active",    value: activeGoals.length,    icon: <TrendingUp size={16} />,     color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20"     },
          { label: "Overdue",   value: overdueGoals.length,   icon: <AlertTriangle size={16} />,  color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20"       },
          { label: "Completed", value: completedGoals.length, icon: <Trophy size={16} />,         color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20"},
          { label: "Avg Progress",value: `${avgProgress}%`,  icon: <Target size={16} />,          color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-900/20" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`${color}`} aria-hidden="true">{icon}</div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue alert */}
      {overdueGoals.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl p-4 flex items-center gap-4" role="alert">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0">
            <AlertTriangle size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {overdueGoals.length} goal{overdueGoals.length > 1 ? "s are" : " is"} overdue
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {overdueGoals.map((g) => g.title).join(", ")} — review and update your deadline or progress.
            </p>
          </div>
        </div>
      )}

      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Filter goals">
          {ALL_FILTER_TABS.map((tab) => (
            <button
              key={tab} role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-emerald-500 text-white"
                  : "bg-white dark:bg-[#111827] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:text-emerald-600"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className={`ml-1.5 text-xs ${activeTab === tab ? "opacity-70" : "text-gray-400"}`}>
                  {tab === "Active" ? activeGoals.length : tab === "Overdue" ? overdueGoals.length : completedGoals.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort:</span>
          <button type="button" aria-pressed={sortBy === "deadline"}
            onClick={() => setSortBy("deadline")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${sortBy === "deadline" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"}`}>
            Deadline
          </button>
          <button type="button" aria-pressed={sortBy === "priority"}
            onClick={() => setSortBy("priority")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${sortBy === "priority" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"}`}>
            Priority
          </button>
        </div>
      </div>

      {/* Goals grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400" role="status">
          <p className="text-4xl mb-3" aria-hidden="true">🎯</p>
          <p className="text-sm font-medium">No goals here</p>
          <p className="text-xs mt-1">Try a different filter or create a new goal</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
          {filtered.map((goal) => (
            <li key={goal.id}>
              <GoalCard goal={goal} onToggleMilestone={toggleMilestone} />
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      <NewGoalModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
    </div>
  );
}