"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer at Figma",
    avatar: "SC",
    avatarColor: "#6366F1",
    rating: 5,
    text: "GoalNest transformed how I approach my personal goals. The habit tracking is incredibly intuitive and the analytics give me insights I never had before. I've built 6 new habits in 2 months!",
  },
  {
    name: "Marcus Williams",
    role: "Founder & CEO at StartupCo",
    avatar: "MW",
    avatarColor: "#8B5CF6",
    rating: 5,
    text: "As a founder, staying disciplined is everything. GoalNest keeps me accountable without being overwhelming. The streak feature is addictive in the best possible way.",
  },
  {
    name: "Priya Patel",
    role: "Software Engineer at Stripe",
    avatar: "PP",
    avatarColor: "#06B6D4",
    rating: 5,
    text: "I've tried every productivity app out there. GoalNest is the first one that's stuck. The interface is beautiful, it's fast, and the weekly review feature is a game-changer.",
  },
  {
    name: "James O'Brien",
    role: "Marathon Runner & Coach",
    avatar: "JO",
    avatarColor: "#10B981",
    rating: 5,
    text: "I recommend GoalNest to all my athletes. The ability to track multiple goal dimensions — sleep, nutrition, training — in one place is exactly what we needed.",
  },
  {
    name: "Aiko Tanaka",
    role: "UX Researcher at Apple",
    avatar: "AT",
    avatarColor: "#F59E0B",
    rating: 5,
    text: "The attention to detail in GoalNest's design is remarkable. As a UX researcher, I'm picky about apps. This one gets everything right — from onboarding to daily use.",
  },
  {
    name: "David Kumar",
    role: "Medical Student",
    avatar: "DK",
    avatarColor: "#EF4444",
    rating: 5,
    text: "Medical school requires extreme discipline. GoalNest's structured goal-setting helped me optimize my study routine and maintain a healthy work-life balance.",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-24 bg-[var(--card-bg)] border-y border-[var(--border)] relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />

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
            💬 What people are saying
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] tracking-tight mb-5">
            Loved by <span className="gradient-text">thousands</span>
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
            Join 50,000+ people who use GoalNest to build better habits,
            crush their goals, and live more intentionally.
          </p>
        </motion.div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group p-6 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl hover:border-[var(--primary)]/20 hover:shadow-lg transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: t.avatarColor }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">
                    {t.name}
                  </div>
                  <div className="text-xs text-[var(--muted)]">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
