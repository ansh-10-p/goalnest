"use client";

import { motion } from "framer-motion";
import { Flame, Target, BarChart3, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "habit" | "goal" | "streak" | "analytics" | "achievement";
  title: string;
  description: string;
  time: string;
  color: string;
}

const iconMap = {
  habit: Flame,
  goal: Target,
  streak: Star,
  analytics: BarChart3,
  achievement: CheckCircle2,
};

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

const defaultActivities: ActivityItem[] = [
  {
    id: "1",
    type: "achievement",
    title: "New achievement unlocked!",
    description: "Completed 21-day meditation streak — \"Zen Master\" badge earned",
    time: "2m ago",
    color: "#6366F1",
  },
  {
    id: "2",
    type: "goal",
    title: "Goal milestone reached",
    description: "\"Read 24 books\" — 50% complete. You've read 12 books this year!",
    time: "1h ago",
    color: "#8B5CF6",
  },
  {
    id: "3",
    type: "habit",
    title: "Habit completed",
    description: "Morning Workout ✓ — Day 7 of your current streak",
    time: "3h ago",
    color: "#10B981",
  },
  {
    id: "4",
    type: "analytics",
    title: "Weekly report ready",
    description: "Your productivity score this week: 94% — up 12% from last week",
    time: "Yesterday",
    color: "#06B6D4",
  },
  {
    id: "5",
    type: "streak",
    title: "Personal best!",
    description: "Daily Reading — new personal best of 45 consecutive days 🔥",
    time: "2d ago",
    color: "#F59E0B",
  },
];

export function ActivityFeed({ activities = defaultActivities }: ActivityFeedProps) {
  return (
    <div className="p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Recent Activity</h3>
        <button className="text-xs text-[var(--primary)] hover:underline transition-colors">
          View all
        </button>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-[var(--border)]" />

        <div className="space-y-5">
          {activities.map((item, i) => {
            const Icon = iconMap[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex gap-4 group"
              >
                {/* Icon node */}
                <div
                  className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-[var(--card-bg)] transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--foreground)] leading-snug">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-[var(--muted)] shrink-0 mt-0.5">{item.time}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
