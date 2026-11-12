import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvoPulse — Kisii Highlands Digital Verification Platform",
  description: "AI-powered avocado maturity verification, transparent weighbridge settlement and instant M-Pesa payouts for Kisii highland smallholder farmers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
