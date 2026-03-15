import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "AI Golf Coach",
  description: "Your personal AI golf coach",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
