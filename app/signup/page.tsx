"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Target, Eye, EyeOff, ArrowRight, Github } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = password.length >= 12 ? "strong" : password.length >= 8 ? "medium" : password.length > 0 ? "weak" : "";
  const strengthColors: Record<string, string> = { weak: "#EF4444", medium: "#F59E0B", strong: "#10B981" };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0F172A] py-12">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl gradient-primary shadow-lg mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-sm text-white/60">Start your journey with GoalNest — free forever</p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl border border-white/15 hover:bg-white/10 transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl border border-white/15 hover:bg-white/10 transition-all duration-200"
            >
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-xs text-white/40">or sign up with email</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-white/80">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/15 bg-white/8 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 backdrop-blur-sm"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-white/80">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/15 bg-white/8 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 backdrop-blur-sm"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-white/80">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 text-sm rounded-xl border border-white/15 bg-white/8 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 flex gap-1">
                    {["weak", "medium", "strong"].map((level) => (
                      <div
                        key={level}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor:
                            (passwordStrength === "weak" && level === "weak") ||
                            (passwordStrength === "medium" && ["weak", "medium"].includes(level)) ||
                            (passwordStrength === "strong")
                              ? strengthColors[passwordStrength]
                              : "rgba(255,255,255,0.1)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs capitalize" style={{ color: strengthColors[passwordStrength] }}>
                    {passwordStrength}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-white/80">Confirm password</label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={cn(
                    "w-full px-4 py-2.5 pr-11 text-sm rounded-xl border bg-white/8 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:border-indigo-500/50 transition-all duration-200 backdrop-blur-sm",
                    confirm.length > 0 && confirm !== password
                      ? "border-red-500/50 focus:ring-red-500/50"
                      : "border-white/15 focus:ring-indigo-500/50"
                  )}
                  required
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm.length > 0 && confirm !== password && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-white/40 leading-relaxed">
              By signing up, you agree to our{" "}
              <Link href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Terms of Service</Link>{" "}
              and{" "}
              <Link href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl gradient-primary hover:opacity-90 shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 group"
            >
              Create account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-white/50 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
