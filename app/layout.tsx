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
  metadataBase: new URL("https://plannow.in"),

  title: {
    default: "Plannow | Automated Timetable Scheduler",
    template: "%s | Plannow",
  },

  description:
    "Plannow is an AI-powered automated timetable scheduling platform for schools, colleges, and educational institutions. Generate optimized class schedules, manage teachers, classrooms, workloads, and automate timetable planning efficiently.",

  keywords: [
    "Plannow",
    "Automated Timetable Scheduler",
    "School Timetable Software",
    "College Timetable Generator",
    "AI Timetable Scheduler",
    "Class Scheduling System",
    "Teacher Schedule Management",
    "Education Management Software",
    "Automated Scheduling",
    "Timetable Automation",
    "Plannow Scheduler",
  ],

  authors: [
    {
      name: "Shibinsha",
      url: "https://plannow.in",
    },
  ],

  creator: "Shibinsha",
  publisher: "Plannow",

  applicationName: "Plannow",

  category: "Education",

  alternates: {
    canonical: "https://plannow.in",
  },

  openGraph: {
    title: "Plannow | Automated Timetable Scheduler",
    description:
      "AI-powered timetable scheduling platform for educational institutions. Automate schedules, manage workloads, optimize classrooms, and simplify timetable planning with Plannow.",
    url: "https://plannow.in",
    siteName: "Plannow",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Plannow Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Plannow | Automated Timetable Scheduler",
    description:
      "Automate timetable scheduling for schools and colleges using Plannow.",
    images: ["/logo.png"],
    creator: "@plannow",
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
    google: "5Nim4XDxhDmiNG1JSbKj_3L5pUd9oV4o4KBjCiluCQE", // Paste your actual token here
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