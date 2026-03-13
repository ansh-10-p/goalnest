"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const previewItems = [
  { label: "Daily Reading", progress: 85, streak: 12, color: "#6366F1" },
  { label: "Morning Workout", progress: 60, streak: 7, color: "#8B5CF6" },
  { label: "Meditation", progress: 95, streak: 21, color: "#06B6D4" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              custom={0}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-sm font-medium text-[var(--primary)] mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Trusted by 50,000+ goal-setters
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={0.1}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-[var(--foreground)] mb-6"
            >
              Build habits.{" "}
              <span className="gradient-text">Achieve&nbsp;goals.</span>{" "}
              Transform life.
            </motion.h1>

            {/* Description */}
            <motion.p
              custom={0.2}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-lg sm:text-xl text-[var(--muted)] leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10"
            >
              GoalNest is the all-in-one productivity platform that helps you
              track habits, manage goals, and visualize your progress with
              beautiful analytics.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={0.3}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-xl gradient-primary shadow-lg hover:shadow-indigo-500/30 hover:opacity-90 transition-all duration-200 group"
              >
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-medium text-[var(--foreground)] rounded-xl border border-[var(--border)] hover:bg-[var(--card-bg)] bg-[var(--card-bg)]/50 backdrop-blur-sm transition-all duration-200">
                <Play className="w-4 h-4 text-[var(--primary)]" />
                Watch demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              custom={0.4}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {["4F46E5", "7C3AED", "0E7490", "059669", "B45309"].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full ring-2 ring-[var(--background)] flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: `#${color}` }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--foreground)]">4.9/5</span>{" "}
                from 2,000+ reviews
              </div>
            </motion.div>
          </div>

          {/* Right: Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {/* Main Preview Card */}
            <div className="relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center gap-1.5 px-5 py-4 border-b border-[var(--border)]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs font-medium text-[var(--muted)]">
                  My Habits — Week 12
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Active Habits", value: "8", icon: "🔥" },
                    { label: "Best Streak", value: "21d", icon: "⚡" },
                    { label: "Completion", value: "94%", icon: "🎯" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-[var(--background)] rounded-xl p-3 text-center border border-[var(--border)]"
                    >
                      <div className="text-lg mb-0.5">{stat.icon}</div>
                      <div className="text-base font-bold text-[var(--foreground)]">{stat.value}</div>
                      <div className="text-xs text-[var(--muted)]">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Habits List */}
                <div className="space-y-3">
                  {previewItems.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--muted)]">
                            🔥 {item.streak} day streak
                          </span>
                          <span className="text-xs font-semibold" style={{ color: item.color }}>
                            {item.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -top-4 -right-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-xl"
            >
              <div className="text-xs text-[var(--muted)] mb-0.5">This week</div>
              <div className="text-lg font-bold text-green-500">+34% 📈</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-xl"
            >
              <div className="text-xs text-[var(--muted)] mb-0.5">Streak record</div>
              <div className="text-lg font-bold text-[var(--primary)]">🔥 21 days</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
