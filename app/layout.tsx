import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App Screenshot Maker",
  description: "Create beautiful app screenshots with ease. Professional mockups and templates for your app store listings.",
  keywords: ["app screenshots", "mockups", "app store", "design", "templates"],
  authors: [{ name: "App Screenshot Maker" }],
  creator: "App Screenshot Maker",
  openGraph: {
    title: "App Screenshot Maker",
    description: "Create beautiful app screenshots with ease",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "App Screenshot Maker",
    description: "Create beautiful app screenshots with ease",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AuthErrorBoundary>
          <AuthProvider>
            <div id="root" className="relative min-h-screen">
              {children}
            </div>
            <div id="modal-root" />
            <div id="tooltip-root" />
          </AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
