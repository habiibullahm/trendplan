import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { AppToaster } from "@/components/toaster";
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
    "Perencanaan konten TikTok mingguan berbasis tren — niche Couple Date Ideas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
