"use client";
import { useState, useEffect } from "react";import Link from "next/link";
import {
  ArrowLeft, Scale, CheckCircle, Leaf, ArrowRight,
  ClipboardList, BarChart3, Phone, Package,
} from "lucide-react";

const API = "http://localhost:8000";

interface Lot {
  id: number;
  lot_code: string;
  status: string;
  farmer_name: string;
  farmer_phone: string;
  ward: string;
  est_tonnes: number;
  created_at: string;
}

interface LineItem {
  description: string;
  amount: number;
  type: string;
}

interface SettleResult {
  status: string;
  lot_code: string;
  farmer_name: string;
  farmer_phone: string;
  net_payout: number;
  mpesa_receipt: string;
  timestamp: string;
  line_items: LineItem[];
  gross_kg: number;
  export_kg: number;
  oil_kg: number;
  reject_kg: number;
}

const MOCK_LOTS: Lot[] = [
  { id: 6, lot_code: "LOT-KIS-2026-1111", status: "incoming", farmer_name: "Mary Kemunto",  farmer_phone: "0711452901", ward: "Nyaribari Chache", est_tonnes: 6.0, created_at: new Date().toISOString() },
  { id: 7, lot_code: "LOT-KIS-2026-DEMO", status: "incoming", farmer_name: "Agnes Nyaboke", farmer_phone: "0728340123", ward: "Kitutu Chache",    est_tonnes: 4.5, created_at: new Date().toISOString() },
];

const SETTLED_HISTORY = [
  { code: "LOT-KIS-2026-1028", farmer: "Jared Mogaka",   kg: 3100, net: 274730 },
  { code: "LOT-KIS-2026-0919", farmer: "Jared Mogaka",   kg: 2800, net: 248120 },
  { code: "LOT-KIS-2026-0810", farmer: "Jared Mogaka",   kg: 1950, net: 172730 },
  { code: "LOT-KIS-2026-0622", farmer: "Jared Mogaka",   kg: 2450, net: 216795 },
];

type Step = "queue" | "weighin" | "settling" | "done";

function fmt(n: number) { return n.toLocaleString("en-KE"); }

export default function HubDashboard() {
  const [lots, setLots] = useState<Lot[]>(MOCK_LOTS);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [step, setStep] = useState<Step>("queue");
  const [view, setView] = useState<"queue" | "history">("queue");

  const [grossKg, setGrossKg] = useState("2800");
  const [exportPct, setExportPct] = useState("85");
  const [oilPct, setOilPct] = useState("11");

  const [settleResult, setSettleResult] = useState<SettleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    fetch(`${API}/lots?status=incoming`)
      .then(r => r.json())
      .then((data: Lot[]) => { if (data.length > 0) setLots(data); })
      .catch(() => setLots(MOCK_LOTS));
  }, []);

  const gross = parseFloat(grossKg) || 0;
  const exp = Math.round(gross * parseFloat(exportPct) / 100 * 10) / 10;
  const oil = Math.round(gross * parseFloat(oilPct) / 100 * 10) / 10;
  const rej = Math.round((gross - exp - oil) * 10) / 10;
  const estNet = Math.round(exp * 95 + oil * 38 - gross * 7.5);

  async function doWeighin() {
    if (!selectedLot) return;
    setLoading(true);
    try {
      await fetch(`${API}/lots/${selectedLot.id}/weighin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ export_kg: exp, oil_kg: oil, reject_kg: rej, gross_kg: gross }),
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); });
      setStep("settling");
    } catch {
      setStep("settling");
    } finally {
      setLoading(false);
    }
  }

  async function doSettle() {
    if (!selectedLot) return;
    setLoading(true);
    try {
      const data: SettleResult = await fetch(`${API}/lots/${selectedLot.id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).then(r => { if (!r.ok) throw new Error(); return r.json(); });
      setSettleResult(data);
      setStep("done");
      setToast(`✓ M-Pesa sent to ${data.farmer_name} — KES ${data.net_payout.toLocaleString("en-KE")}`);
    } catch {
      const exportAmt = Math.round(exp * 95 * 100) / 100;
      const oilAmt    = Math.round(oil * 38 * 100) / 100;
      const trans     = Math.round(gross * 4.5 * 100) / 100;
      const grad      = Math.round(gross * 3 * 100) / 100;
      const net       = Math.round((exportAmt + oilAmt - trans - grad) * 100) / 100;
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const rcpt  = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      setSettleResult({
        status: "SETTLED",
        lot_code: selectedLot.lot_code,
        farmer_name: selectedLot.farmer_name,
        farmer_phone: selectedLot.farmer_phone,
        net_payout: net,
        mpesa_receipt: rcpt,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
        line_items: [
          { description: `Export Grade A (${fmt(exp)} kg @ KES 95.00)`,       amount: exportAmt, type: "credit" },
          { description: `Oil-Grade Offtake (${fmt(oil)} kg @ KES 38.00)`,    amount: oilAmt,    type: "credit" },
          { description: `Transport (${fmt(gross)} kg @ KES 4.50)`,           amount: -trans,    type: "deduction" },
          { description: `AvoPulse Grading Fee (${fmt(gross)} kg @ KES 3.00)`, amount: -grad,   type: "deduction" },
        ],
        gross_kg: gross, export_kg: exp, oil_kg: oil, reject_kg: rej,
      });
      setStep("done");
      setToast(`✓ M-Pesa sent — KES ${net.toLocaleString("en-KE")}`);
    } finally {
      setLoading(false);
    }
  }

  function resetFlow() {
    setStep("queue");
    setSelectedLot(null);
    setSettleResult(null);
    setGrossKg("2800");
    setExportPct("85");
    setOilPct("11");
  }

  return (
  <>
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
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2a4a7a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "white", flexShrink: 0 }}>SK</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "white" }}>Sarah Kwamboka</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Weighbridge Officer</div>
            </div>
          </div>
          <div style={{ marginTop: 10, padding: "4px 8px", background: "rgba(90,159,212,0.15)", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Package size={10} color="#5a9fd4" />
            <span style={{ fontSize: 11, color: "#5a9fd4", fontWeight: 600 }}>Kisii Central Hub</span>
          </div>
        </div>

        <div className="divider-dark" style={{ margin: "12px 0" }} />

        <button
          className={`sidebar-link${view === "queue" ? " active" : ""}`}
          onClick={() => { setView("queue"); if (step === "done") resetFlow(); }}
        >
          <ClipboardList size={16} />
          Lot Queue
        </button>
        <button
          className={`sidebar-link${view === "history" ? " active" : ""}`}
          onClick={() => setView("history")}
        >
          <BarChart3 size={16} />
          Settlement History
        </button>

        {/* Queue badge */}
        {view === "queue" && (
          <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: "var(--r-sm)" }}>
            <div className="t-label" style={{ color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Incoming today</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "white", lineHeight: 1 }}>
                {lots.filter(l => l.status === "incoming").length}
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>lots</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {lots.reduce((s, l) => s + l.est_tonnes, 0).toFixed(1)}t estimated
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <Link href="/demo" style={{ textDecoration: "none" }}>
          <button className="sidebar-link"><ArrowLeft size={16} />Demo Hub</button>
        </Link>
      </aside>

      {/* ── MAIN ── */}
      <main className="app-main">
        <div className="app-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Scale size={18} color="var(--canopy)" />
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              {view === "history" ? "Settlement History" : "Hub Weighbridge"}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--smoke)" }}>
            Kisii Highlands Aggregation Hub · W46
          </div>
        </div>

        <div className="app-content">
          {/* ── HISTORY ── */}
          {view === "history" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Lots settled (W46)",    val: "4",         note: "this week" },
                  { label: "Total kg processed",    val: "10,350",    note: "gross weight" },
                  { label: "Total M-Pesa sent",     val: "KES 912K",  note: "net disbursed" },
                ].map(c => (
                  <div key={c.label} className="card" style={{ padding: "18px 20px" }}>
                    <div className="t-label" style={{ color: "var(--mist)", marginBottom: 8 }}>{c.label}</div>
                    <div className="stat-num" style={{ marginBottom: 4 }}>{c.val}</div>
                    <div style={{ fontSize: 12, color: "var(--smoke)" }}>{c.note}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Lot Code</th>
                      <th>Farmer</th>
                      <th>Gross kg</th>
                      <th>Net Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SETTLED_HISTORY.map(r => (
                      <tr key={r.code}>
                        <td><span className="t-mono" style={{ fontWeight: 700 }}>{r.code}</span></td>
                        <td style={{ fontWeight: 600 }}>{r.farmer}</td>
                        <td>{fmt(r.kg)} kg</td>
                        <td><span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--success-fg)" }}>KES {fmt(r.net)}</span></td>
                        <td><span className="badge badge-green">SETTLED</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── QUEUE ── */}
          {view === "queue" && (
            <>
              {step === "queue" && (
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 16 }}>
                    Incoming Lots — {lots.filter(l => l.status === "incoming").length} waiting
                  </h2>
                  <div style={{ display: "grid", gap: 8, marginBottom: 28 }}>
                    {lots.filter(l => l.status === "incoming").map(lot => (
                      <button
                        key={lot.id}
                        onClick={() => { setSelectedLot(lot); setStep("weighin"); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "18px 20px", background: "white", border: "1px solid var(--rule)",
                          borderRadius: "var(--r-md)", cursor: "pointer", width: "100%",
                          textAlign: "left", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-raised)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span className="t-mono" style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                              {lot.lot_code}
                            </span>
                            <span className="badge badge-blue">INCOMING</span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", marginBottom: 2 }}>{lot.farmer_name}</div>
                          <div style={{ fontSize: 12, color: "var(--smoke)" }}>{lot.ward} · est. {lot.est_tonnes}t</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <div style={{ textAlign: "right" }}>
                            <div className="t-label" style={{ color: "var(--mist)", marginBottom: 3 }}>Phone</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                              <Phone size={12} />
                              {lot.farmer_phone}
                            </div>
                          </div>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--rule)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ArrowRight size={16} color="var(--smoke)" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Recently settled */}
                  <div className="card" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Recently Settled</span>
                      <span className="badge badge-dark">This week</span>
                    </div>
                    <table className="data-table">
                      <tbody>
                        {SETTLED_HISTORY.slice(0, 3).map(r => (
                          <tr key={r.code}>
                            <td><span className="t-mono">{r.code}</span></td>
                            <td style={{ color: "var(--smoke)" }}>{r.farmer}</td>
                            <td style={{ textAlign: "right" }}>
                              <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--success-fg)", fontSize: 14 }}>
                                KES {fmt(r.net)}
                              </span>
                            </td>
                            <td><span className="badge badge-green">SETTLED</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* WEIGHIN */}
              {step === "weighin" && selectedLot && (
                <div>
                  {/* Lot header */}
                  <div className="card-dark" style={{ padding: "16px 20px", marginBottom: 24 }}>
                    <div className="t-label" style={{ color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Lot on bench</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "white" }}>{selectedLot.lot_code}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                      {selectedLot.farmer_name} · {selectedLot.farmer_phone} · est. {selectedLot.est_tonnes}t
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                    {/* Input panel */}
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 20 }}>Enter Weights</div>
                      {[
                        { label: "Gross weight (kg)", val: grossKg, set: setGrossKg, suffix: "kg" },
                        { label: "Export grade %",   val: exportPct, set: setExportPct, suffix: "%" },
                        { label: "Oil grade %",      val: oilPct,    set: setOilPct,    suffix: "%" },
                      ].map(f => (
                        <div key={f.label} style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--smoke)", marginBottom: 6 }}>{f.label}</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type="number"
                              value={f.val}
                              onChange={e => f.set(e.target.value)}
                              className="input input-lg input-num"
                              style={{ paddingRight: 40 }}
                            />
                            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--mist)", fontWeight: 600 }}>
                              {f.suffix}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live breakdown */}
                    <div className="card" style={{ padding: 24, background: "var(--parchment)" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 20 }}>Live Breakdown</div>
                      {[
                        { label: "Export Grade A", kg: exp, rate: 95, badgeCls: "badge-green" },
                        { label: "Oil Grade",       kg: oil, rate: 38, badgeCls: "badge-amber" },
                        { label: "Reject / Loss",   kg: rej, rate: 0,  badgeCls: "badge-red" },
                      ].map(r => (
                        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--rule)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{r.label}</span>
                            <span className={`badge ${r.badgeCls}`}>{fmt(r.kg)} kg</span>
                          </div>
                          {r.rate > 0 && (
                            <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                              KES {fmt(r.kg * r.rate)}
                            </span>
                          )}
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, marginTop: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--smoke)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                          Est. Net Payout
                        </span>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--canopy)" }}>
                          KES {fmt(estNet)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn btn-outline" onClick={() => setStep("queue")}>
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={doWeighin} disabled={loading}>
                      <Scale size={16} />
                      {loading ? "Recording…" : "Confirm Weighin"}
                    </button>
                  </div>
                </div>
              )}

              {/* SETTLING */}
              {step === "settling" && selectedLot && (
                <div style={{ maxWidth: 560 }}>
                  <div className="card" style={{ padding: 32, marginBottom: 20 }}>
                    <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                      Weighin Confirmed
                    </h2>
                    <p style={{ fontSize: 13, color: "var(--smoke)", marginBottom: 28 }}>
                      {selectedLot.lot_code} — {fmt(exp)} kg export · {fmt(oil)} kg oil · {fmt(rej)} kg reject
                    </p>

                    <div style={{ padding: "16px 20px", background: "var(--parchment)", borderRadius: "var(--r-md)", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div className="t-label" style={{ color: "var(--mist)", marginBottom: 4 }}>Sending to</div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{selectedLot.farmer_name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--smoke)", marginTop: 2 }}>
                          <Phone size={12} /> {selectedLot.farmer_phone}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="t-label" style={{ color: "var(--mist)", marginBottom: 4 }}>Amount</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "var(--canopy)" }}>
                          KES {fmt(estNet)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={doSettle}
                      disabled={loading}
                      className="btn btn-green"
                      style={{ width: "100%", height: 52, fontSize: 15, fontWeight: 800, justifyContent: "center" }}
                    >
                      {loading
                        ? "Sending M-Pesa…"
                        : <><CheckCircle size={20} /> Trigger M-Pesa Payout</>}
                    </button>
                  </div>
                </div>
              )}

              {/* DONE */}
              {step === "done" && settleResult && (
                <div style={{ maxWidth: 600 }}>
                  {/* M-Pesa receipt card */}
                  <div className="mpesa-card" style={{ marginBottom: 20, textAlign: "center" }}>
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <CheckCircle size={40} color="white" style={{ display: "block", margin: "0 auto 16px" }} />
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 700, color: "white", lineHeight: 1 }}>
                        KES {fmt(settleResult.net_payout)}
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "10px 0 20px" }}>
                        Sent to {settleResult.farmer_name} · {settleResult.farmer_phone}
                      </div>
                      <div style={{ display: "inline-block", padding: "10px 20px", background: "rgba(255,255,255,0.15)", borderRadius: "var(--r-md)", backdropFilter: "blur(4px)" }}>
                        <div className="t-label" style={{ color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>M-Pesa Transaction ID</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "white" }}>
                          {settleResult.mpesa_receipt}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--rule)" }}>
                      <span className="t-label" style={{ color: "var(--mist)" }}>Settlement Statement — {settleResult.lot_code}</span>
                    </div>
                    <table className="data-table">
                      <tbody>
                        {settleResult.line_items.map((item, i) => (
                          <tr key={i}>
                            <td style={{ color: "var(--ink)" }}>{item.description}</td>
                            <td style={{ textAlign: "right", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: item.type === "credit" ? "var(--success-fg)" : "var(--danger-fg)" }}>
                              {item.type === "deduction" ? "−" : "+"}KES {fmt(Math.abs(item.amount))}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td style={{ fontWeight: 800, fontSize: 15, borderTop: "2px solid var(--ink)", paddingTop: 16 }}>Net Payout</td>
                          <td style={{ textAlign: "right", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--canopy)", borderTop: "2px solid var(--ink)", paddingTop: 16 }}>
                            KES {fmt(settleResult.net_payout)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn btn-outline" onClick={resetFlow}>Next lot</button>
                    <Link href="/demo/farmer" className="btn btn-primary">
                      View Farmer Statement <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
    {toast && (
      <div className="toast">
        <span>{toast}</span>
      </div>
    )}
  </>
  );
}
