import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoalNest — Build Better Habits, Achieve More Goals",
  description:
    "GoalNest helps you track habits, manage goals, and stay productive with beautiful analytics and an intuitive dashboard.",
  keywords: ["habit tracker", "goal management", "productivity", "dashboard"],
  openGraph: {
    title: "GoalNest",
    description: "Build Better Habits, Achieve More Goals",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
