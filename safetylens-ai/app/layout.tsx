import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getvorsa.ai"),
  title: {
    default: "Vorsa AI — AI-Powered Safety Audits for Construction",
    template: "%s — Vorsa AI",
  },
  description:
    "Turn jobsite photos into OSHA-cited safety reports in seconds. Walk with an AI safety coach who guides you in real time. Built for construction professionals.",
  keywords: [
    "construction safety",
    "OSHA compliance",
    "safety audit",
    "AI safety inspector",
    "jobsite safety",
    "safety walk",
    "construction safety audit software",
    "AI safety inspection",
    "OSHA violation detection",
    "jobsite photo analysis",
    "safety audit report",
    "construction safety technology",
    "automated safety inspection",
    "OSHA construction fines",
    "safety compliance software",
    "construction hazard detection",
  ],
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "kHtwkrpDZ_LlvLifHJNod69mL9jw2Uuf3caFpRgdsx8",
  },
  openGraph: {
    title: "Vorsa AI — AI-Powered Safety Audits for Construction",
    description:
      "Turn jobsite photos into OSHA-cited safety reports in seconds.",
    url: "https://getvorsa.ai",
    siteName: "Vorsa AI",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vorsa AI — AI-Powered Safety Audits for Construction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vorsa AI",
    description:
      "Turn jobsite photos into OSHA-cited safety reports in seconds.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
