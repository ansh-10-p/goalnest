"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Target, CheckCircle2, Circle, Clock, AlertTriangle,
  Trophy, ChevronRight, X, Check, Flag, CalendarDays,
  Layers, TrendingUp, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sanitizeText(input: unknown, maxLen = 120): string {
  if (typeof input !== "string") return "";
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLen);
}
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, isFinite(n) ? n : min)); }
function isValidDateString(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)); }

// ─── Constants ────────────────────────────────────────────────────────────────
const ALLOWED_PRIORITIES = ["critical", "high", "medium", "low"] as const;
type Priority = (typeof ALLOWED_PRIORITIES)[number];

const ALLOWED_CATEGORIES = ["Career", "Health", "Finance", "Learning", "Personal", "Creative"] as const;
type GoalCategory = (typeof ALLOWED_CATEGORIES)[number];

const ALL_FILTER_TABS = ["All", "Active", "Completed", "Overdue"] as const;
type FilterTab = (typeof ALL_FILTER_TABS)[number];

const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label:"Critical", color:"text-red-600 dark:text-red-400",      bg:"bg-red-50 dark:bg-red-900/20",      dot:"bg-red-500"    },
  high:     { label:"High",     color:"text-orange-600 dark:text-orange-400", bg:"bg-orange-50 dark:bg-orange-900/20", dot:"bg-orange-500" },
  medium:   { label:"Medium",   color:"text-amber-600 dark:text-amber-400",   bg:"bg-amber-50 dark:bg-amber-900/20",  dot:"bg-amber-400"  },
  low:      { label:"Low",      color:"text-emerald-600 dark:text-emerald-400",bg:"bg-emerald-50 dark:bg-emerald-900/20",dot:"bg-emerald-500"},
};

const CATEGORY_COLORS: Record<GoalCategory, string> = {
  Career:   "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  Health:   "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  Finance:  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  Learning: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  Personal: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  Creative: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Milestone { id: string; text: string; done: boolean; }
interface Goal {
  id: string; title: string; description: string;
  category: GoalCategory; priority: Priority;
  deadline: string; milestones: Milestone[];
  progress: number; daysLeft: number; createdAt: string;
}
interface NewGoalPayload {
  title: string; description: string; category: GoalCategory;
  priority: Priority; deadline: string; milestones: string[];
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function deriveStatus(g: Goal) {
  if (g.progress === 100) return "completed";
  if (g.daysLeft < 0)     return "overdue";
  return "active";
}
function deadlineLabel(days: number) {
  if (days < 0)   return { text:`${Math.abs(days)}d overdue`, color:"text-red-500" };
  if (days === 0) return { text:"Due today",                  color:"text-red-500" };
  if (days <= 3)  return { text:`${days}d left`,              color:"text-orange-500" };
  if (days <= 7)  return { text:`${days}d left`,              color:"text-amber-500" };
  return           { text:`${days}d left`,                     color:"text-gray-400" };
}
function formatDeadline(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

// ─── GoalCard ─────────────────────────────────────────────────────────────────
function GoalCard({ goal, onToggleMilestone }: { goal: Goal; onToggleMilestone: (gId: string, mId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const status = deriveStatus(goal);
  const dl     = deadlineLabel(goal.daysLeft);
  const pm     = PRIORITY_META[goal.priority];

  const statusConfig = {
    active:    { icon:<Clock size={12}/>,          label:"Active",    cls:"text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
    completed: { icon:<Trophy size={12}/>,         label:"Completed", cls:"text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    overdue:   { icon:<AlertTriangle size={12}/>,  label:"Overdue",   cls:"text-red-500 bg-red-50 dark:bg-red-900/20" },
  }[status];

  const progressColor = status==="completed"?"bg-emerald-500":status==="overdue"?"bg-red-400":goal.progress>=70?"bg-indigo-500":goal.progress>=40?"bg-amber-400":"bg-gray-300 dark:bg-gray-600";

  return (
    <article className="bg-white dark:bg-[#1a2235] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className={`h-1 w-full ${pm.dot}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusConfig.cls}`}>{statusConfig.icon}{statusConfig.label}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${CATEGORY_COLORS[goal.category]}`}>{goal.category}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${pm.bg} ${pm.color}`}><Flag size={10}/>{pm.label}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{goal.title}</h3>
            {goal.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{goal.description}</p>}
          </div>
          <div className="shrink-0 relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800"/>
              <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                stroke={status==="completed"?"#10b981":status==="overdue"?"#ef4444":"#6366f1"}
                strokeDasharray={`${(goal.progress/100)*94.2} 94.2`} strokeLinecap="round" className="transition-all duration-700"/>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">{goal.progress}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5 text-gray-400">
            <CalendarDays size={12}/>
            <span>{formatDeadline(goal.deadline)}</span>
            <span className={`font-semibold ${dl.color}`}>· {dl.text}</span>
          </div>
          <span className="text-gray-400">{goal.milestones.filter(m=>m.done).length}/{goal.milestones.length} milestones</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3" role="progressbar" aria-valuenow={goal.progress} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full transition-all duration-700 ${progressColor}`} style={{ width:`${clamp(goal.progress,0,100)}%` }}/>
        </div>
        {goal.milestones.length > 0 && (
          <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#6366F1] transition font-medium w-full text-left">
            <Layers size={12}/>{expanded?"Hide":"Show"} milestones
            {expanded?<ChevronUp size={12}/>:<ChevronDown size={12}/>}
          </button>
        )}
        {expanded && (
          <ul className="mt-3 space-y-2">
            {goal.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2.5">
                <button type="button" aria-pressed={m.done} onClick={()=>onToggleMilestone(goal.id, m.id)} className="shrink-0 transition-transform active:scale-90">
                  {m.done
                    ? <CheckCircle2 size={16} className="text-[#6366F1]"/>
                    : <Circle size={16} className="text-gray-300 dark:text-gray-600 hover:text-[#6366F1] transition-colors"/>}
                </button>
                <span className={`text-xs ${m.done?"line-through text-gray-300 dark:text-gray-600":"text-gray-600 dark:text-gray-300"}`}>{m.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

// ─── NewGoalModal ─────────────────────────────────────────────────────────────
type ModalStep = "basics" | "milestones";
const MODAL_STEPS: ModalStep[] = ["basics","milestones"];

function NewGoalModal({ open, onClose, onCreate }: { open:boolean; onClose:()=>void; onCreate:(p:NewGoalPayload)=>Promise<void> }) {
  const [step, setStep]               = useState<ModalStep>("basics");
  const [title, setTitle]             = useState("");
  const [description, setDesc]        = useState("");
  const [category, setCategory]       = useState<GoalCategory>("Career");
  const [priority, setPriority]       = useState<Priority>("medium");
  const [deadline, setDeadline]       = useState("");
  const [milestoneInputs, setMInputs] = useState<string[]>(["","",""]);
  const [titleError, setTitleError]   = useState("");
  const [dateError, setDateError]     = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [apiError, setApiError]       = useState("");
  const stepIndex = MODAL_STEPS.indexOf(step);

  const minDate = (() => { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; })();

  useEffect(() => {
    if (!open) return;
    setStep("basics"); setTitle(""); setDesc(""); setCategory("Career"); setPriority("medium");
    setDeadline(""); setMInputs(["","",""]); setTitleError(""); setDateError("");
    setSubmitting(false); setSubmitted(false); setApiError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: globalThis.KeyboardEvent) => { if (e.key==="Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const validateBasics = () => {
    let ok = true;
    if (sanitizeText(title,80).length < 3) { setTitleError("Title must be at least 3 characters."); ok=false; }
    else setTitleError("");
    if (!deadline || !isValidDateString(deadline)) { setDateError("Please pick a valid deadline."); ok=false; }
    else setDateError("");
    return ok;
  };

  const handleNext = async () => {
    if (step === "basics") { if (!validateBasics()) return; setStep("milestones"); }
    else {
      const safeTitle = sanitizeText(title,80);
      const safeMilestones = milestoneInputs.map(m=>sanitizeText(m,100)).filter(m=>m.length>=2);
      setSubmitting(true); setApiError("");
      try {
        await onCreate({
          title: safeTitle, description: sanitizeText(description,200),
          category: ALLOWED_CATEGORIES.includes(category)?category:"Career",
          priority: ALLOWED_PRIORITIES.includes(priority)?priority:"medium",
          deadline: isValidDateString(deadline)?deadline:minDate,
          milestones: safeMilestones,
        });
        setSubmitted(true);
        setTimeout(()=>onClose(), 900);
      } catch (err:any) {
        setApiError(err.message ?? "Failed to create goal.");
        setSubmitting(false);
      }
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)" }}
      role="dialog" aria-modal="true" onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{maxHeight:"94vh"}} onClick={(e)=>e.stopPropagation()}>
        {submitted && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-[#111827]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 animate-bounce"><Trophy size={28} className="text-emerald-500"/></div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">Goal Set!</p>
            <p className="text-sm text-gray-400 mt-1">Now make it happen 🚀</p>
          </div>
        )}
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700"/></div>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2"><Target size={16} className="text-emerald-500"/><h2 className="font-bold text-gray-900 dark:text-white text-base">New Goal</h2></div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><X size={16}/></button>
        </div>
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 shrink-0">
          {MODAL_STEPS.map((s,i) => {
            const done=i<stepIndex, active=s===step;
            return (
              <div key={s} className="flex items-center gap-2">
                <button onClick={()=>done&&setStep(s)} disabled={!done} className={`flex items-center gap-1.5 text-xs font-medium transition ${active?"text-emerald-600":done?"text-gray-400 hover:text-emerald-600 cursor-pointer":"text-gray-300 dark:text-gray-600 cursor-default"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done?"bg-emerald-500 text-white":active?"bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 ring-1 ring-emerald-400/40":"bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                    {done?<Check size={10}/>:i+1}
                  </span>
                  <span className="hidden sm:inline">{s==="basics"?"Details":"Milestones"}</span>
                </button>
                {i<MODAL_STEPS.length-1 && <div className={`w-10 h-px ${done?"bg-emerald-500":"bg-gray-200 dark:bg-gray-700"}`}/>}
              </div>
            );
          })}
        </div>
        <div className="px-5 pt-3 pb-5 overflow-y-auto flex-1 space-y-4">
          {apiError && <div className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-xs text-red-500">{apiError}</div>}

          {step === "basics" && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Goal title <span className="text-red-400">*</span></label>
                <input type="text" placeholder="e.g. Run a 5K under 25 minutes" value={title}
                  onChange={(e)=>{ setTitle(e.target.value.slice(0,80)); if(titleError) setTitleError(""); }}
                  maxLength={80} autoComplete="off" aria-invalid={!!titleError}
                  className={`w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${titleError?"border-red-400 focus:ring-red-300":"border-gray-200 dark:border-gray-700 focus:ring-emerald-400/30 focus:border-emerald-500"}`}
                />
                <div className="flex justify-between mt-1">
                  {titleError && <p role="alert" className="text-xs text-red-500">{titleError}</p>}
                  <p className="text-xs text-gray-400 ml-auto">{title.length}/80</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Description <span className="text-gray-300">(optional)</span></label>
                <textarea rows={2} placeholder="Why does this goal matter to you?" value={description}
                  onChange={(e)=>setDesc(e.target.value.slice(0,200))} maxLength={200}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{description.length}/200</p>
              </div>
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Category</legend>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_CATEGORIES.map(cat=>(
                    <button key={cat} type="button" aria-pressed={category===cat} onClick={()=>setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${category===cat?"bg-emerald-500 text-white":"bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>{cat}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Priority</legend>
                <div className="grid grid-cols-2 gap-2">
                  {ALLOWED_PRIORITIES.map(p=>{
                    const meta=PRIORITY_META[p];
                    return (
                      <button key={p} type="button" aria-pressed={priority===p} onClick={()=>setPriority(p)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${priority===p?`border-transparent ${meta.bg} ${meta.color}`:"border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}>
                        <span className={`w-2 h-2 rounded-full ${meta.dot}`}/>{meta.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Deadline <span className="text-red-400">*</span></label>
                <input type="date" value={deadline} min={minDate}
                  onChange={(e)=>{ setDeadline(e.target.value); if(dateError) setDateError(""); }}
                  aria-invalid={!!dateError}
                  className={`w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 transition ${dateError?"border-red-400 focus:ring-red-300":"border-gray-200 dark:border-gray-700 focus:ring-emerald-400/30 focus:border-emerald-500"}`}
                />
                {dateError && <p role="alert" className="text-xs text-red-500 mt-1">{dateError}</p>}
              </div>
            </>
          )}

          {step === "milestones" && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Break it down into milestones</p>
                <p className="text-xs text-gray-400">Add up to 10 checkpoints. Progress is calculated from these.</p>
              </div>
              {milestoneInputs.map((val,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i+1}</span>
                  <input type="text" placeholder={`Milestone ${i+1}…`} value={val}
                    onChange={(e)=>setMInputs(p=>p.map((v,idx)=>idx===i?e.target.value.slice(0,100):v))} maxLength={100}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition"
                  />
                  {milestoneInputs.length > 1 && (
                    <button type="button" onClick={()=>setMInputs(p=>p.filter((_,idx)=>idx!==i))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0"><X size={14}/></button>
                  )}
                </div>
              ))}
              {milestoneInputs.length < 10 && (
                <button type="button" onClick={()=>setMInputs(p=>[...p,""])}
                  className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition">
                  <Plus size={14}/> Add milestone
                </button>
              )}
              <p className="text-xs text-gray-400 pt-1">💡 You can skip milestones — progress will be tracked manually later.</p>
            </div>
          )}
        </div>
        <div className="px-5 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
          {step !== "basics" && (
            <button type="button" onClick={()=>setStep("basics")}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Back</button>
          )}
          <button type="button" onClick={handleNext} disabled={(step==="basics"&&title.trim().length===0)||submitting}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${(step==="basics"&&title.trim().length===0)||submitting?"bg-gray-100 dark:bg-gray-800 text-gray-300 cursor-not-allowed":"bg-emerald-500 hover:bg-emerald-600 text-white"}`}>
            {submitting?<><Loader2 size={15} className="animate-spin"/> Saving…</>:step==="milestones"?<><Trophy size={15}/> Set Goal</>:<>Next <ChevronRight size={15}/></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GoalsPage ────────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const [goals, setGoals]         = useState<Goal[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string|null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [sortBy, setSortBy]       = useState<"deadline"|"priority">("deadline");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchGoals = useCallback(async (tab: FilterTab, sort: string) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ sortBy: sort });
      if (tab !== "All") params.set("status", tab.toLowerCase());
      const res = await fetch(`/api/goals?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load goals.");
      const data = await res.json();
      setGoals(data.goals);
    } catch (err:any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(activeTab, sortBy); }, [activeTab, sortBy, fetchGoals]);

  // Optimistic milestone toggle
  const toggleMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => g.id !== goalId ? g : {
      ...g,
      milestones: g.milestones.map(m => m.id !== milestoneId ? m : { ...m, done: !m.done }),
      progress: (() => {
        const updated = g.milestones.map(m => m.id === milestoneId ? {...m, done:!m.done} : m);
        return updated.length ? Math.round(updated.filter(m=>m.done).length/updated.length*100) : 0;
      })(),
    }));

    try {
      const res = await fetch(`/api/goals/${goalId}/milestone/${milestoneId}`, { method:"PATCH" });
      if (!res.ok) fetchGoals(activeTab, sortBy); // revert by re-fetching
    } catch {
      fetchGoals(activeTab, sortBy);
    }
  }, [activeTab, sortBy, fetchGoals]);

  const handleCreate = useCallback(async (payload: NewGoalPayload) => {
    const res = await fetch("/api/goals", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to create goal.");
    setGoals(prev => [data.goal, ...prev]);
  }, []);

  // Derived stats (from all goals, not filtered)
  const activeGoals    = goals.filter(g=>deriveStatus(g)==="active").length;
  const overdueGoals   = goals.filter(g=>deriveStatus(g)==="overdue");
  const completedGoals = goals.filter(g=>deriveStatus(g)==="completed").length;
  const avgProgress    = goals.length ? Math.round(goals.reduce((a,g)=>a+g.progress,0)/goals.length) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeGoals} active · {completedGoals} completed · {avgProgress}% avg progress
          </p>
        </div>
        <button type="button" onClick={()=>setModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm">
          <Plus size={16}/> New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Active",       value:activeGoals,    icon:<TrendingUp size={16}/>,    color:"text-blue-500",    bg:"bg-blue-50 dark:bg-blue-900/20"      },
          { label:"Overdue",      value:overdueGoals.length, icon:<AlertTriangle size={16}/>, color:"text-red-500",     bg:"bg-red-50 dark:bg-red-900/20"        },
          { label:"Completed",    value:completedGoals, icon:<Trophy size={16}/>,         color:"text-emerald-500", bg:"bg-emerald-50 dark:bg-emerald-900/20" },
          { label:"Avg Progress", value:`${avgProgress}%`, icon:<Target size={16}/>,     color:"text-indigo-500",  bg:"bg-indigo-50 dark:bg-indigo-900/20"  },
        ].map(({label,value,icon,color,bg})=>(
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
            <div className={color}>{icon}</div>
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
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0"><AlertTriangle size={18}/></div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{overdueGoals.length} goal{overdueGoals.length>1?"s are":" is"} overdue</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{overdueGoals.map(g=>g.title).join(", ")} — review and update your deadline or progress.</p>
          </div>
        </div>
      )}

      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_FILTER_TABS.map(tab=>(
            <button key={tab} type="button" aria-pressed={activeTab===tab} onClick={()=>setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${activeTab===tab?"bg-emerald-500 text-white":"bg-white dark:bg-[#111827] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:text-emerald-600"}`}
            >{tab}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort:</span>
          {(["deadline","priority"] as const).map(s=>(
            <button key={s} type="button" aria-pressed={sortBy===s} onClick={()=>setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${sortBy===s?"bg-gray-900 dark:bg-white text-white dark:text-gray-900":"bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Goals grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-400"/></div>
      ) : error ? (
        <div className="text-center py-16 text-red-400">
          <p className="text-sm">{error}</p>
          <button onClick={()=>fetchGoals(activeTab,sortBy)} className="mt-2 text-xs text-emerald-500 underline">Retry</button>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-sm font-medium">{activeTab!=="All"?"No goals here":"No goals yet"}</p>
          <p className="text-xs mt-1">{activeTab!=="All"?"Try a different filter":"Click \"New Goal\" to get started"}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
          {goals.map(goal=>(
            <li key={goal.id}><GoalCard goal={goal} onToggleMilestone={toggleMilestone}/></li>
          ))}
        </ul>
      )}

      <NewGoalModal open={modalOpen} onClose={()=>setModalOpen(false)} onCreate={handleCreate}/>
    </div>
  );
}