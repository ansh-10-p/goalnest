"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Menu, X, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "About" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)] shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-shadow">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[var(--foreground)]">
            Goal<span className="text-[var(--primary)]">Nest</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--card-bg)] transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] border border-[var(--border)] transition-all duration-200"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}

          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--card-bg)] transition-all duration-200"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg gradient-primary hover:opacity-90 shadow-sm hover:shadow-indigo-500/30 transition-all duration-200"
          >
            Get started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          aria-label="Toggle mobile menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] rounded-lg transition"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-[var(--border)] pt-3 mt-1 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-center rounded-lg border border-[var(--border)] hover:bg-[var(--card-bg)] transition">Log in</Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-center text-white rounded-lg gradient-primary hover:opacity-90 transition">Get started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
