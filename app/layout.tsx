import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./components/providers";
import Navigation from "./components/navigation";
import ToastContainer from "./components/toast-container";
import { ensureProfile } from "./actions/auth-actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Momentum",
  description: "Personal operating system for habits, fitness, and wellness tracker",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Gracefully guarantee that Clerk profile matches a Supabase profile record
  await ensureProfile();

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
        style={{ colorScheme: 'dark' }}
      >
        <body className="min-h-full bg-[#030303] text-[#f4f4f5] flex flex-col md:flex-row font-sans">
          <Providers>
            {/* Global Navigation Side/Bottom Shell */}
            <Navigation />
            
            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col min-h-screen pt-16 md:pt-0 md:pl-64 pb-16 md:pb-0">
              <main className="flex-1 flex flex-col">
                {children}
              </main>
            </div>
            
            <ToastContainer />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
