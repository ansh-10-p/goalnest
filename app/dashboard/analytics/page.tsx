"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Flame, Target, CheckSquare,
  Trophy, Calendar, Zap, BarChart2, Loader2, AlertTriangle,
  CheckCircle2, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayData     { date: string; day: string; value: number; total?: number; }
interface HeatmapDay  { date: string; count: number; rate: number; dayOfWeek: number; }
interface CategoryData{ category: string; total: number; completed: number; avgProgress: number; }
interface PriorityData{ priority: string; count: number; }
interface StreakData   { name: string; emoji: string; streak: number; longestStreak: number; color: string; }
interface HabitCatData{ category: string; count: number; completed: number; }

interface AnalyticsData {
  range: number;
  summary: {
    totalHabits: number; completedToday: number; todayRate: number;
    bestStreak: number; bestStreakHabit: string; currentStreak: number;
    totalCompletionsInRange: number; avgDailyCompletions: number;
    perfectDays: number; completionChange: number;
    totalGoals: number; completedGoals: number; overdueGoals: number; avgGoalProgress: number;
  };
  charts: {
    habitCompletionByDay: DayData[];
    completionRateByDay: DayData[];
    habitsByCategory: HabitCatData[];
    goalsByCategory: CategoryData[];
    goalsByPriority: PriorityData[];
    heatmap: HeatmapDay[];
    habitStreaks: StreakData[];
  };
  recentActivity: { id: string; type: string; title: string; description: string; time: string; }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ data, color = "#6366F1", maxVal }: { data: DayData[]; color?: string; maxVal?: number }) {
  const max = maxVal ?? Math.max(...data.map(d => d.value), 1);
  const show = data.length <= 14 ? data : data.filter((_, i) => i % Math.ceil(data.length / 14) === 0);
  return (
    <div className="flex items-end gap-1 h-20 w-full">
      {show.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
            {d.day}: {d.value}{d.total ? `/${d.total}` : ""}
          </div>
          <div className="w-full rounded-t-sm transition-all duration-300" style={{ height:`${clamp(d.value/max*100,2,100)}%`, backgroundColor: color, opacity: d.value===0?0.15:0.85 }}/>
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Line chart ───────────────────────────────────────────────────────────────
function LineChart({ data, color = "#6366F1" }: { data: DayData[]; color?: string }) {
  const max  = Math.max(...data.map(d => d.value), 1);
  const W    = 400; const H = 80; const pad = 8;
  const pts  = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - (d.value / max) * (H - pad * 2);
    return `${x},${y}`;
  });
  const area = `M${pts.join("L")} L${W-pad},${H-pad} L${pad},${H-pad} Z`;
  const show = data.length <= 14 ? data : data.filter((_, i) => i % Math.ceil(data.length / 7) === 0);
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lg)"/>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {data.map((d, i) => {
          const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
          const y = H - pad - (d.value / max) * (H - pad * 2);
          return <circle key={i} cx={x} cy={y} r="2.5" fill={color}/>;
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {show.map((d, i) => <span key={i} className="text-[9px] text-gray-400">{d.day}</span>)}
      </div>
    </div>
  );
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────
function Heatmap({ data }: { data: HeatmapDay[] }) {
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));
  const DAY_LABELS = ["S","M","T","W","T","F","S"];

  function heatColor(rate: number) {
    if (rate === 0)   return "bg-gray-100 dark:bg-gray-800";
    if (rate < 25)    return "bg-indigo-100 dark:bg-indigo-900/40";
    if (rate < 50)    return "bg-indigo-200 dark:bg-indigo-800/60";
    if (rate < 75)    return "bg-indigo-400";
    return "bg-indigo-600";
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {DAY_LABELS.map((d, i) => (
            <span key={i} className="text-[9px] text-gray-400 h-3 flex items-center">{i%2===0?d:""}</span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div key={di} className={`w-3 h-3 rounded-sm ${heatColor(day.rate)} transition-colors group relative cursor-default`}>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                  {day.date}: {day.rate}%
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-[9px] text-gray-400 mr-1">Less</span>
        {["bg-gray-100 dark:bg-gray-800","bg-indigo-100 dark:bg-indigo-900/40","bg-indigo-200 dark:bg-indigo-800/60","bg-indigo-400","bg-indigo-600"].map((c,i)=>(
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`}/>
        ))}
        <span className="text-[9px] text-gray-400 ml-1">More</span>
      </div>
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ slices, size = 80 }: { slices: { value: number; color: string; label: string }[]; size?: number }) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  if (total === 0) return <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400">No data</div>;
  const R = 16; const C = 2 * Math.PI * R;
  let offset = 0;
  const segments = slices.map(s => {
    const dash = (s.value / total) * C;
    const seg  = { ...s, dash, offset };
    offset += dash;
    return seg;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      {segments.map((s, i) => (
        <circle key={i} cx="18" cy="18" r={R} fill="none" stroke={s.color} strokeWidth="4"
          strokeDasharray={`${s.dash} ${C - s.dash}`} strokeDashoffset={-s.offset}
          className="-rotate-90 origin-center"
          transform="rotate(-90, 18, 18)"
        />
      ))}
      <text x="18" y="20" textAnchor="middle" className="text-[6px] font-bold fill-gray-700 dark:fill-gray-200" fontSize="6">{total}</text>
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconBg, change }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; iconBg: string; change?: number;
}) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={17}/>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${change >= 0 ? "text-emerald-500" : "text-red-400"}`}>
          {change >= 0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
          {Math.abs(change)}% vs last period
        </div>
      )}
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Activity icon ────────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; cls: string }> = {
    habit_complete: { icon: CheckCircle2, cls: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" },
    streak:         { icon: Flame,        cls: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
    goal_milestone: { icon: Target,       cls: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
    achievement:    { icon: Trophy,       cls: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
    progress:       { icon: TrendingUp,   cls: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  };
  const { icon: Icon, cls } = map[type] ?? { icon: Clock, cls: "text-gray-400 bg-gray-50 dark:bg-gray-800" };
  return <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cls}`}><Icon size={15}/></div>;
}

// ─── AnalyticsPage ────────────────────────────────────────────────────────────
const RANGES = [
  { label: "7 days",  value: 7  },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981",
};
const CATEGORY_COLORS_CHART: Record<string, string> = {
  Career:"#6366f1", Health:"#22c55e", Finance:"#10b981",
  Learning:"#3b82f6", Personal:"#a855f7", Creative:"#ec4899",
};

export default function AnalyticsPage() {
  const [data, setData]     = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [range, setRange]   = useState(30);
  const [chartTab, setChartTab] = useState<"completions" | "rate">("completions");

  const fetchData = useCallback(async (r: number) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${r}`);
      if (!res.ok) throw new Error("Failed to load analytics.");
      setData(await res.json());
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(range); }, [range, fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-400 gap-3">
      <AlertTriangle size={32}/>
      <p className="text-sm">{error ?? "Failed to load analytics."}</p>
      <button onClick={() => fetchData(range)} className="text-xs text-indigo-400 underline">Retry</button>
    </div>
  );

  const { summary, charts, recentActivity } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header + range selector */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your habits & goals performance overview</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl p-1">
          {RANGES.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)} type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${range===r.value?"bg-[#6366F1] text-white":"text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Completed Today" value={`${summary.completedToday}/${summary.totalHabits}`}
          sub={`${summary.todayRate}% completion rate`} iconBg="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-500"/>
        <StatCard icon={Flame} label="Best Streak" value={`${summary.bestStreak}d`}
          sub={summary.bestStreakHabit} iconBg="bg-orange-100 dark:bg-orange-900/20 text-orange-500"/>
        <StatCard icon={Zap} label="Avg Daily Completions" value={summary.avgDailyCompletions}
          sub={`${summary.perfectDays} perfect days`} change={summary.completionChange}
          iconBg="bg-violet-100 dark:bg-violet-900/20 text-violet-500"/>
        <StatCard icon={Target} label="Goal Progress" value={`${summary.avgGoalProgress}%`}
          sub={`${summary.completedGoals}/${summary.totalGoals} goals done`}
          iconBg="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500"/>
      </div>

      {/* Main chart — completion over time */}
      <ChartCard title="Habit Performance" subtitle={`Last ${range} days`}>
        <div className="flex gap-2 mb-4">
          {(["completions","rate"] as const).map(t => (
            <button key={t} onClick={() => setChartTab(t)} type="button"
              className={`px-3 py-1 rounded-lg text-xs font-medium transition capitalize ${chartTab===t?"bg-[#6366F1] text-white":"bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
              {t === "completions" ? "Daily completions" : "Completion rate %"}
            </button>
          ))}
        </div>
        {chartTab === "completions"
          ? <BarChart data={charts.habitCompletionByDay} color="#6366F1"/>
          : <LineChart data={charts.completionRateByDay} color="#6366F1"/>}
      </ChartCard>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Streak leaderboard */}
        <ChartCard title="Habit Streaks" subtitle="Current vs longest streak">
          {charts.habitStreaks.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No habits yet</p>
          ) : (
            <div className="space-y-3">
              {charts.habitStreaks.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg select-none w-6">{h.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{h.name}</p>
                      <span className="text-xs text-gray-400 ml-2 shrink-0">{h.streak}d / {h.longestStreak}d best</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${h.longestStreak > 0 ? clamp(h.streak/h.longestStreak*100,2,100) : 0}%` }}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Goal progress by category */}
        <ChartCard title="Goals by Category" subtitle="Average progress per category">
          {charts.goalsByCategory.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No goals yet</p>
          ) : (
            <div className="space-y-3">
              {charts.goalsByCategory.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS_CHART[c.category] ?? "#6366f1" }}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.category}</p>
                      <span className="text-xs text-gray-400">{c.avgProgress}% · {c.total} goal{c.total>1?"s":""}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width:`${c.avgProgress}%`, backgroundColor: CATEGORY_COLORS_CHART[c.category] ?? "#6366f1" }}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Heatmap + breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Heatmap */}
        <div className="lg:col-span-2">
          <ChartCard title="Activity Heatmap" subtitle="Last 12 weeks of habit completions">
            <Heatmap data={charts.heatmap}/>
          </ChartCard>
        </div>

        {/* Goal priority donut */}
        <ChartCard title="Goals by Priority" subtitle="Distribution across priority levels">
          {charts.goalsByPriority.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No goals yet</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <DonutChart size={100} slices={charts.goalsByPriority.map(p => ({
                value: p.count,
                color: PRIORITY_COLORS[p.priority] ?? "#6366f1",
                label: p.priority,
              }))}/>
              <div className="space-y-1.5 w-full">
                {charts.goalsByPriority.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p.priority] }}/>
                      <span className="capitalize text-gray-600 dark:text-gray-400">{p.priority}</span>
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Habits by category + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Habits by category */}
        <ChartCard title="Habits by Category" subtitle="Today's completion per category">
          {charts.habitsByCategory.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No habits yet</p>
          ) : (
            <div className="space-y-3">
              {charts.habitsByCategory.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.category}</p>
                      <span className="text-xs text-gray-400">{c.completed}/{c.count} today</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                        style={{ width:`${c.count>0?Math.round(c.completed/c.count*100):0}%` }}/>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-8 text-right">
                    {c.count>0?Math.round(c.completed/c.count*100):0}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Recent activity */}
        <ChartCard title="Recent Activity" subtitle="Latest actions across habits & goals">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No activity yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {recentActivity.map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <ActivityIcon type={a.type}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{a.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{a.description}</p>
                  </div>
                  <span className="text-[10px] text-gray-300 dark:text-gray-600 shrink-0 mt-0.5">{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Total Completions", value:summary.totalCompletionsInRange, icon:CheckSquare, color:"text-indigo-500", bg:"bg-indigo-50 dark:bg-indigo-900/20" },
          { label:"Perfect Days",      value:summary.perfectDays,             icon:Trophy,      color:"text-amber-500",  bg:"bg-amber-50 dark:bg-amber-900/20"   },
          { label:"Overdue Goals",     value:summary.overdueGoals,            icon:AlertTriangle,color:"text-red-500",  bg:"bg-red-50 dark:bg-red-900/20"       },
          { label:"Current Streak",    value:`${summary.currentStreak}d`,     icon:Flame,       color:"text-orange-500",bg:"bg-orange-50 dark:bg-orange-900/20" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
            <div className={color}><Icon size={16}/></div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}