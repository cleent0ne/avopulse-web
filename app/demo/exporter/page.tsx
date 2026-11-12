"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, BarChart3, Plus, CheckCircle, Leaf,
  TrendingUp, Package, X,
} from "lucide-react";

const API = "http://localhost:8000";

const WARD_DATA = [
  { ward: "Nyaribari Chache", verified: 13.2, hold: 4.8, pct: 73, orchards: 5, cleared: 3 },
  { ward: "Kitutu Chache",    verified: 8.3,  hold: 4.7, pct: 64, orchards: 4, cleared: 2 },
  { ward: "Bonchari",         verified: 8.7,  hold: 2.2, pct: 80, orchards: 3, cleared: 2 },
  { ward: "South Mugirango",  verified: 5.1,  hold: 6.3, pct: 45, orchards: 3, cleared: 1 },
  { ward: "Bobasi",           verified: 6.5,  hold: 5.0, pct: 57, orchards: 3, cleared: 1 },
];

const BOOKINGS_W46 = [
  { name: "East African Fresh Ltd",   week: "2026-W46", tonnes: 16.0 },
  { name: "Kisii Highlands Greens",   week: "2026-W46", tonnes: 10.5 },
  { name: "Serengeti Organics",       week: "2026-W46", tonnes: 8.0  },
];
const BOOKINGS_W47 = [
  { name: "East African Fresh Ltd",   week: "2026-W47", tonnes: 22.0 },
  { name: "Kisii Highlands Greens",   week: "2026-W47", tonnes: 14.0 },
];

function fmt(n: number, digits = 1) {
  return n % 1 === 0 ? n.toLocaleString() : n.toFixed(digits);
}

function CoveragePill({ pct }: { pct: number }) {
  const cls = pct >= 100 ? "badge-green" : pct >= 80 ? "badge-amber" : "badge-red";
  return <span className={`badge ${cls}`}>{Math.round(pct)}% coverage</span>;
}

export default function ExporterDashboard() {
  const [supply, setSupply] = useState({
    total_verified_mature_tonnes: 41.8,
    total_holdback_tonnes: 23.0,
    coverage_ratio_pct: 121.2,
  });
  const [week, setWeek] = useState<"2026-W46" | "2026-W47">("2026-W46");
  const [showBook, setShowBook] = useState(false);
  const [newTonnes, setNewTonnes] = useState("12");
  const [newExporter, setNewExporter] = useState("My Company");
  const [extraBookings, setExtraBookings] = useState<typeof BOOKINGS_W46>([]);

  useEffect(() => {
    fetch(`${API}/supply?week=${week}`)
      .then(r => r.json())
      .then(d => setSupply(d))
      .catch(() => {});
  }, [week]);

  const baseBookings = week === "2026-W46" ? BOOKINGS_W46 : BOOKINGS_W47;
  const allBookings = [...baseBookings, ...extraBookings.filter(b => b.week === week)];
  const totalBooked = allBookings.reduce((s, b) => s + b.tonnes, 0);
  const coveragePct = supply.total_verified_mature_tonnes / totalBooked * 100;

  async function handleBook() {
    try {
      await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exporter_name: newExporter, week, tonnes: parseFloat(newTonnes) }),
      });
    } catch {}
    setExtraBookings(prev => [...prev, { name: newExporter, week, tonnes: parseFloat(newTonnes) }]);
    setShowBook(false);
    setNewExporter("My Company");
    setNewTonnes("12");
  }

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className="app-sidebar">
        {/* Logo */}
        <div style={{ padding: "4px 8px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Leaf size={16} color="var(--lime)" />
          </div>
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 16, color: "white", letterSpacing: "-0.02em" }}>
            Avo<span style={{ color: "var(--lime)" }}>Pulse</span>
          </span>
        </div>

        {/* Role badge */}
        <div style={{ padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "var(--r-md)", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#5a3a1a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "white", flexShrink: 0 }}>MK</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "white" }}>Martin Kamau</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Procurement Manager</div>
            </div>
          </div>
          <div style={{ marginTop: 10, padding: "4px 8px", background: "rgba(201,168,76,0.15)", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Package size={10} color="var(--gold)" />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>East African Fresh Ltd</span>
          </div>
        </div>

        <div className="divider-dark" style={{ margin: "12px 0" }} />

        <button className="sidebar-link active">
          <BarChart3 size={16} />
          Supply Dashboard
        </button>
        <button className="sidebar-link">
          <TrendingUp size={16} />
          Market Analytics
        </button>

        {/* Week selector */}
        <div style={{ marginTop: 16, padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "var(--r-sm)" }}>
          <div className="t-label" style={{ color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>View week</div>
          {(["2026-W46", "2026-W47"] as const).map(w => (
            <button
              key={w}
              className={`sidebar-link${week === w ? " active" : ""}`}
              style={{ marginBottom: 2 }}
              onClick={() => setWeek(w)}
            >
              {w}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <Link href="/demo" style={{ textDecoration: "none" }}>
          <button className="sidebar-link"><ArrowLeft size={16} />Demo Hub</button>
        </Link>
      </aside>

      {/* ── MAIN ── */}
      <main className="app-main">
        <div className="app-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BarChart3 size={18} color="var(--canopy)" />
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Supply Dashboard</span>
            <span className="badge badge-blue">{week} · Kisii Highlands · Hass</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowBook(true)}>
            <Plus size={15} /> Add Booking
          </button>
        </div>

        <div className="app-content">
          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              {
                label: "Verified Mature",
                val: `${supply.total_verified_mature_tonnes}t`,
                sub: "ready for pickup",
                color: "var(--canopy)",
                badge: "badge-green",
                badgeText: "cleared",
              },
              {
                label: "On Hold",
                val: `${supply.total_holdback_tonnes}t`,
                sub: "pending re-assessment",
                color: "var(--gold)",
                badge: "badge-amber",
                badgeText: "holdback",
              },
              {
                label: "Forward Booked",
                val: `${fmt(totalBooked)}t`,
                sub: `${allBookings.length} commitments`,
                color: "var(--ink)",
                badge: "badge-blue",
                badgeText: week,
              },
              {
                label: "Coverage Ratio",
                val: `${Math.round(coveragePct)}%`,
                sub: "verified vs booked",
                color: coveragePct >= 100 ? "var(--canopy)" : coveragePct >= 80 ? "#92400e" : "#991b1b",
                badge: coveragePct >= 100 ? "badge-green" : coveragePct >= 80 ? "badge-amber" : "badge-red",
                badgeText: coveragePct >= 100 ? "fully covered" : "under-covered",
              },
            ].map(c => (
              <div key={c.label} className="card" style={{ padding: "18px 20px" }}>
                <div className="t-label" style={{ color: "var(--mist)", marginBottom: 10 }}>{c.label}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: c.color, lineHeight: 1, marginBottom: 8 }}>
                  {c.val}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`badge ${c.badge}`}>{c.badgeText}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ward supply table */}
          <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Verified Supply by Ward</span>
              <span className="badge badge-green">{supply.total_verified_mature_tonnes}t cleared · {week}</span>
            </div>
            {WARD_DATA.map(w => (
              <div
                key={w.ward}
                style={{ padding: "16px 20px", borderBottom: "1px solid var(--rule)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{w.ward}</span>
                    <span style={{ fontSize: 12, color: "var(--smoke)", marginLeft: 10 }}>
                      {w.orchards} orchards · {w.cleared} cleared
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "var(--canopy)" }}>
                      {w.verified}t verified
                    </span>
                    <span style={{ fontSize: 13, color: "var(--smoke)" }}>{w.hold}t held</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--smoke)", minWidth: 36, textAlign: "right" }}>
                      {w.pct}%
                    </span>
                  </div>
                </div>
                <div className="bar-track" style={{ height: 8 }}>
                  <div
                    className="bar-fill"
                    style={{
                      width: `${w.pct}%`,
                      background: w.pct >= 75 ? "linear-gradient(90deg, var(--canopy), var(--lime))"
                        : w.pct >= 55 ? "linear-gradient(90deg, var(--gold), #e8c06a)"
                        : "linear-gradient(90deg, #dc2626, #f87171)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Forward bookings */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Forward Bookings — {week}</span>
              <CoveragePill pct={coveragePct} />
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exporter</th>
                  <th>Week</th>
                  <th style={{ textAlign: "right" }}>Tonnes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td><span className="t-mono">{b.week}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
                        {fmt(b.tonnes)}t
                      </span>
                    </td>
                    <td><span className="badge badge-green">confirmed</span></td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr style={{ background: "var(--parchment)" }}>
                  <td colSpan={2} style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>Total Booked</td>
                  <td style={{ textAlign: "right", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
                    {fmt(totalBooked)}t
                  </td>
                  <td><CoveragePill pct={coveragePct} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── BOOKING MODAL ── */}
      {showBook && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,31,16,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={e => { if (e.target === e.currentTarget) setShowBook(false); }}
        >
          <div className="card" style={{ padding: 32, width: 420, boxShadow: "var(--shadow-float)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>
                Add Forward Booking
              </h2>
              <button className="btn btn-ghost btn-sm" style={{ padding: "0 8px" }} onClick={() => setShowBook(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "10px 14px", background: "var(--parchment)", borderRadius: "var(--r-sm)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success-dot)" }} />
              <span style={{ fontSize: 13, color: "var(--smoke)" }}>Week {week} · {supply.total_verified_mature_tonnes}t available</span>
            </div>

            {[
              { label: "Exporter name", val: newExporter, set: setNewExporter, type: "text", placeholder: "e.g. Fresh Horizons Ltd" },
              { label: "Tonnes", val: newTonnes, set: setNewTonnes, type: "number", placeholder: "e.g. 12" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--smoke)", marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={f.val}
                  placeholder={f.placeholder}
                  onChange={e => f.set(e.target.value)}
                  className="input input-lg"
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowBook(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={handleBook}
              >
                <CheckCircle size={16} /> Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
