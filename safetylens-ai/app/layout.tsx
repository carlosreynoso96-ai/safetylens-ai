import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SafetyLens AI — AI-Powered Safety Audits for Construction",
  description:
    "Turn jobsite photos into OSHA-cited safety reports in seconds. Walk with an AI safety coach who guides you in real time. Built for construction professionals.",
  keywords: [
    "construction safety",
    "OSHA compliance",
    "safety audit",
    "AI safety inspector",
    "jobsite safety",
    "safety walk",
  ],
  openGraph: {
    title: "SafetyLens AI — AI-Powered Safety Audits for Construction",
    description:
      "Turn jobsite photos into OSHA-cited safety reports in seconds.",
    url: "https://safetylens.ai",
    siteName: "SafetyLens AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafetyLens AI",
    description:
      "Turn jobsite photos into OSHA-cited safety reports in seconds.",
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
        {children}
      </body>
    </html>
  );
}
