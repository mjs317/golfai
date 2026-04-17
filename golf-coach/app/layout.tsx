import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import DemoBanner from "@/components/DemoBanner";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "AI Golf Coach",
  description: "Your personal AI golf coach",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Golf Coach" />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <DemoBanner />
            <Navigation />
            <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
