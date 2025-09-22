import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import SessionProvider from "@/components/SessionProvider";
import { Toaster } from "react-hot-toast";


const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BS Portal",
  description: "Bussiness Service Leave Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <SessionProvider>
          {children}
          <Toaster position="bottom-center" />
        </SessionProvider>
      </body>
    </html>
  );
}
