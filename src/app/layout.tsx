import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { AppToaster } from "@/components/layout/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrendPlan",
  description:
    "Perencanaan konten TikTok mingguan berbasis tren — pilih niche yang cocok",
  applicationName: "TrendPlan",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`h-full ${dmSans.variable} ${fraunces.variable}`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink antialiased">
        <ThemeScript />
        <ThemeProvider>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
