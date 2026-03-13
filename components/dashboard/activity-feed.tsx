"use client";
 
import { CheckCircle2, Target, Flame, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
 
type ActivityType = "habit_complete" | "goal_milestone" | "streak" | "achievement" | "progress";
 
interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
}
 
const iconMap: Record<ActivityType, { icon: React.ElementType; bg: string; text: string }> = {
  habit_complete: { icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-500" },
  goal_milestone: { icon: Target, bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-500" },
  streak: { icon: Flame, bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-500" },
  achievement: { icon: Award, bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-500" },
  progress: { icon: TrendingUp, bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-500" },
};
 
interface ActivityFeedProps {
  activities: Activity[];
}
 
export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
      <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-4">Recent Activity</h3>
 
      <div className="space-y-1">
        {activities.map((activity, index) => {
          const { icon: Icon, bg, text } = iconMap[activity.type];
          const isLast = index === activities.length - 1;
 
          return (
            <div key={activity.id} className="flex gap-3">
              {/* Icon + timeline line */}
              <div className="flex flex-col items-center">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon size={15} className={text} />
                </div>
                {!isLast && <div className="w-px flex-1 bg-gray-100 dark:bg-gray-800 my-1" />}
              </div>
 
              {/* Content */}
              <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{activity.description}</p>
                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
 
      <button className="mt-2 w-full text-center text-xs text-[#6366F1] font-medium hover:underline py-1">
        View all activity →
      </button>
    </div>
  );
}