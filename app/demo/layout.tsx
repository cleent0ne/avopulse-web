import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "AvoPulse — Live Demo",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

