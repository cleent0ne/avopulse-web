// Shared UI primitives for AvoPulse dashboards

import { Leaf } from "lucide-react";
import Link from "next/link";

/** Animated skeleton block */
export function Skeleton({ w = "100%", h = 16, radius = 6 }: { w?: string | number; h?: number; radius?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h, borderRadius: radius, flexShrink: 0 }}
    />
  );
}

/** Full-page loading state with AvoPulse branding */
export function PageLoading({ role = "Loading…" }: { role?: string }) {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--parchment)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "var(--forest)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Leaf size={24} color="var(--lime)" />
      </div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--forest)" }}>
        Avo<span style={{ color: "var(--canopy)" }}>Pulse</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 20, height: 20, border: "2px solid var(--rule)",
          borderTopColor: "var(--canopy)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ fontSize: 13, color: "var(--smoke)" }}>{role}</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/** Sidebar logo block */
export function SidebarLogo() {
  return (
    <div style={{ padding: "4px 8px 20px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Leaf size={16} color="var(--lime)" />
      </div>
      <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 16, color: "white", letterSpacing: "-0.02em" }}>
        Avo<span style={{ color: "var(--lime)" }}>Pulse</span>
      </span>
    </div>
  );
}

/** Stat card */
export function StatCard({ label, value, sub, badgeCls }: { label: string; value: string; sub?: string; badgeCls?: string }) {
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div className="t-label" style={{ color: "var(--mist)", marginBottom: 8 }}>{label}</div>
      <div className="stat-num" style={{ marginBottom: sub ? 6 : 0 }}>{value}</div>
      {sub && badgeCls && <span className={`badge ${badgeCls}`}>{sub}</span>}
      {sub && !badgeCls && <div style={{ fontSize: 12, color: "var(--smoke)" }}>{sub}</div>}
    </div>
  );
}

/** Toast notification */
export function Toast({ message, type = "success" }: { message: string; type?: "success" | "error" | "info" }) {
  const colors = {
    success: { bg: "var(--success-bg)", color: "var(--success-fg)", dot: "var(--success-dot)" },
    error:   { bg: "var(--danger-bg)",  color: "var(--danger-fg)",  dot: "var(--danger-dot)" },
    info:    { bg: "var(--info-bg)",    color: "var(--info-fg)",    dot: "#3b82f6" },
  }[type];
  return (
    <div className="toast" style={{ background: colors.bg, color: colors.color }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.dot, flexShrink: 0 }} />
      {message}
    </div>
  );
}

/** Back to demo hub link for sidebar */
export function BackToHub() {
  return (
    <Link href="/demo" style={{ textDecoration: "none" }}>
      <button className="sidebar-link" style={{ gap: 8 }}>
        ← Demo Hub
      </button>
    </Link>
  );
}

