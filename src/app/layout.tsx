import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "MyEntertainmentTracker",
  description: "My personal drama tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navigation />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
