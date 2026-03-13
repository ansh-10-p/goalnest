"use client";

import { motion } from "framer-motion";
import {
  Zap,
  BarChart3,
  Calendar,
  Shield,
  Bell,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Habit Streaks",
    description:
      "Build lasting habits with visual streak tracking. See your consistency at a glance and stay motivated every single day.",
    color: "#6366F1",
    bg: "#6366F110",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Visualize your productivity trends with beautiful charts. Understand patterns and optimize your routine for peak performance.",
    color: "#8B5CF6",
    bg: "#8B5CF610",
  },
  {
    icon: Calendar,
    title: "Goal Planning",
    description:
      "Break down ambitious goals into actionable steps. Set milestones, track progress, and celebrate every win along the way.",
    color: "#06B6D4",
    bg: "#06B6D410",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Never miss a habit with intelligent, contextual reminders tailored to your schedule and timezone.",
    color: "#10B981",
    bg: "#10B98110",
  },
  {
    icon: Layers,
    title: "Goal Templates",
    description:
      "Start fast with proven goal templates for fitness, learning, finance, and more — crafted by productivity experts.",
    color: "#F59E0B",
    bg: "#F59E0B10",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data is yours. End-to-end encryption and strict privacy controls ensure your personal goals stay personal.",
    color: "#EF4444",
    bg: "#EF444410",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function Features() {
  return (
    <section id="features" className="py-24 bg-[var(--background)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-sm font-medium text-[var(--primary)] mb-6">
            ✨ Everything you need
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] tracking-tight mb-5">
            Supercharge your{" "}
            <span className="gradient-text">productivity</span>
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            GoalNest combines powerful habit tracking with goal management
            tools that adapt to your lifestyle and help you achieve what matters most.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300 cursor-default"
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: feature.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 60% 50% at 50% 100%, ${feature.color}08, transparent)`,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
