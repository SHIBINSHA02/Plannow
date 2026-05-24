// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://planora.plannow.in"),

  title: {
    default: "Planora | Automated Timetable Scheduler",
    template: "%s | Planora",
  },

  description:
    "Planora is an AI-powered automated timetable scheduling platform for schools, colleges, and educational institutions. Generate optimized class schedules, manage teachers, classrooms, workloads, and automate timetable planning efficiently.",

  keywords: [
    "Planora",
    "Automated Timetable Scheduler",
    "School Timetable Software",
    "College Timetable Generator",
    "AI Timetable Scheduler",
    "Class Scheduling System",
    "Teacher Schedule Management",
    "Education Management Software",
    "Automated Scheduling",
    "Timetable Automation",
    "Planora Scheduler",
  ],

  authors: [
    {
      name: "Shibinsha",
      url: "https://planora.plannow.in",
    },
  ],

  creator: "Shibinsha",
  publisher: "Planora",

  applicationName: "Planora",

  category: "Education",

  alternates: {
    canonical: "https://planora.plannow.in",
  },

  openGraph: {
    title: "Planora | Automated Timetable Scheduler",
    description:
      "AI-powered timetable scheduling platform for educational institutions. Automate schedules, manage workloads, optimize classrooms, and simplify timetable planning with Planora.",
    url: "https://planora.plannow.in",
    siteName: "Planora",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Planora Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Planora | Automated Timetable Scheduler",
    description:
      "Automate timetable scheduling for schools and colleges using Planora.",
    images: ["/logo.png"],
    creator: "@planora",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  verification: {
    google: "google-site-verification-code",
  },

  other: {
    "theme-color": "#0f172a",
    "contact:email": "shibin24666@gmail.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}