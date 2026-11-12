"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Leaf, User, TrendingUp, Star,
  CreditCard, BookOpen, Award, ArrowRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LedgerEntry {
  id: number;
  date: string;
  reference: string;
  kg_settled: number;
  net_paid: number;
  running_balance: number;
  note: string;
}

interface CreditReadiness {
  tier: string;
  score: number;
  max_score: number;
  eligible_limit_kes: number;
  badge: string;
  illustrative_note: string;
  qualification_factors: string[];
}

interface FarmerLedger {
  farmer_id: number;
  farmer_name: string;
  ward: string;
  group_name: string;
  total_harvests: number;
  total_kg_settled: number;
  total_net_paid_kes: number;
  credit_readiness: CreditReadiness;
  entries: LedgerEntry[];
}

const MOCK_LEDGER: FarmerLedger = {
  farmer_id: 1,
  farmer_name: "Jared Mogaka",
  ward: "Nyaribari Chache",
  group_name: "Keumbu Avocado Producers Co-op",
  total_harvests: 5,
  total_kg_settled: 12400,
  total_net_paid_kes: 1098470,
  credit_readiness: {
    tier: "Tier 1 â€” Prime Commercial",
    score: 815,
    max_score: 900,
    eligible_limit_kes: 150000,
    badge: "AFA Verified â€” Eligible for input credit",
    illustrative_note: "Rules-based calculation over verifiable delivery ledger.",
    qualification_factors: [
      "5 consecutive verified harvests logged over 6 months",
      "Consistently high export packout (>84%) with low reject rate (<4%)",
      "KES 1,098,470 direct digital M-Pesa disbursements on record",
    ],
  },
  entries: [
    { id: 5, date: "2026-10-28", reference: "M-PESA QS67V4B19K", kg_settled: 3100, net_paid: 274730, running_balance: 1098470, note: "Settlement for LOT-KIS-2026-1028 (2697kg export, 310kg oil)" },
    { id: 4, date: "2026-09-19", reference: "M-PESA QR12F8L55M", kg_settled: 2800, net_paid: 248120, running_balance: 823740,  note: "Settlement for LOT-KIS-2026-0919 (2408kg export, 308kg oil)" },
    { id: 3, date: "2026-08-10", reference: "M-PESA QP89T3W40Z", kg_settled: 1950, net_paid: 172730, running_balance: 575620,  note: "Settlement for LOT-KIS-2026-0810 (1638kg export, 254kg oil)" },
    { id: 2, date: "2026-06-22", reference: "M-PESA QM44K2P81Y", kg_settled: 2450, net_paid: 216795, running_balance: 402890,  note: "Settlement for LOT-KIS-2026-0622 (2082kg export, 294kg oil)" },
    { id: 1, date: "2026-05-18", reference: "M-PESA QL31A7M92X", kg_settled: 2100, net_paid: 186095, running_balance: 186095,  note: "Settlement for LOT-KIS-2026-0518 (1722kg export, 294kg oil)" },
  ],
};

function fmt(n: number) { return n.toLocaleString("en-KE"); }

type Tab = "statement" | "ledger" | "credit";

export default function FarmerDashboard() {
  const [ledger, setLedger] = useState<FarmerLedger>(MOCK_LEDGER);
  const [tab, setTab] = useState<Tab>("statement");

  useEffect(() => {
    fetch(`${API}/farmers/1/ledger`)
      .then(r => r.json())
      .then((d: FarmerLedger) => { if (d.farmer_name) setLedger(d); })
      .catch(() => {});
  }, []);

  const latestEntry = ledger.entries[0];
  const cr = ledger.credit_readiness;
  const scorePct = Math.round((cr.score / cr.max_score) * 100);

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "statement", label: "Latest Settlement", icon: <CreditCard size={15} /> },
    { key: "ledger",    label: "Full Ledger",        icon: <BookOpen size={15} /> },
    { key: "credit",    label: "Credit Score",       icon: <Award size={15} /> },
  ];

  return (
    <div className="app-layout">
      {/* â”€â”€ SIDEBAR â”€â”€ */}
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

        {/* Profile card */}
        <div style={{ padding: "14px", background: "rgba(255,255,255,0.05)", borderRadius: "var(--r-md)", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--canopy)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "white", flexShrink: 0 }}>JM</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "white" }}>Jared Mogaka</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Farmer Â· Kisii</div>
            </div>
          </div>
          <div style={{ paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="t-label" style={{ color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Total earned</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
              KES {fmt(ledger.total_net_paid_kes)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "var(--r-sm)", padding: "8px 10px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "white" }}>{ledger.total_harvests}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Harvests</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "var(--r-sm)", padding: "8px 10px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "white" }}>T1</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Credit tier</div>
            </div>
          </div>
        </div>

        <div className="divider-dark" style={{ margin: "12px 0" }} />

        {/* Tab nav links */}
        {TABS.map(t => (
          <button
            key={t.key}
            className={`sidebar-link${tab === t.key ? " active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <Link href="/demo" style={{ textDecoration: "none" }}>
          <button className="sidebar-link"><ArrowLeft size={16} />Demo Hub</button>
        </Link>
      </aside>

      {/* â”€â”€ MAIN â”€â”€ */}
      <main className="app-main">
        <div className="app-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <User size={18} color="var(--canopy)" />
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
              {TABS.find(t => t.key === tab)?.label}
            </span>
          </div>
          <span style={{ fontSize: 12, color: "var(--smoke)" }}>
            {ledger.group_name} Â· {ledger.ward}
          </span>
        </div>

        <div className="app-content">
          {/* â”€â”€ STATEMENT TAB â”€â”€ */}
          {tab === "statement" && latestEntry && (
            <div>
              {/* M-Pesa receipt */}
              <div className="mpesa-card" style={{ marginBottom: 20 }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div className="t-label" style={{ color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Most Recent M-Pesa Receipt</div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 42, fontWeight: 700, color: "white", lineHeight: 1, marginBottom: 6 }}>
                    KES {fmt(latestEntry.net_paid)}
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 20 }}>
                    Received {new Date(latestEntry.date).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                  <div style={{ display: "inline-block", padding: "10px 18px", background: "rgba(255,255,255,0.15)", borderRadius: "var(--r-md)", backdropFilter: "blur(4px)" }}>
                    <div className="t-label" style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Transaction ID</div>
                    <div className="t-mono" style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
                      {latestEntry.reference.replace("M-PESA ", "")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail card */}
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--rule)" }}>
                  <span className="t-label" style={{ color: "var(--mist)" }}>{latestEntry.note}</span>
                </div>
                <table className="data-table">
                  <tbody>
                    {[
                      { label: "Total gross weight",    val: `${fmt(latestEntry.kg_settled)} kg`,                                                       credit: true },
                      { label: "Export grade (84â€“87%)", val: `KES ${fmt(Math.round(latestEntry.kg_settled * 0.86 * 95))}`,                              credit: true },
                      { label: "Oil grade (10â€“13%)",    val: `KES ${fmt(Math.round(latestEntry.kg_settled * 0.10 * 38))}`,                              credit: true },
                      { label: "Transport deduction",   val: `âˆ’ KES ${fmt(Math.round(latestEntry.kg_settled * 4.5))}`,                                  credit: false },
                      { label: "AvoPulse grading fee",  val: `âˆ’ KES ${fmt(Math.round(latestEntry.kg_settled * 3))}`,                                    credit: false },
                    ].map(row => (
                      <tr key={row.label}>
                        <td style={{ color: "var(--smoke)" }}>{row.label}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: row.val.includes("âˆ’") ? "var(--danger-fg)" : "var(--ink)" }}>
                          {row.val}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "var(--parchment)" }}>
                      <td style={{ fontWeight: 800, fontSize: 15 }}>Net Paid to Phone</td>
                      <td style={{ textAlign: "right", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--canopy)" }}>
                        KES {fmt(latestEntry.net_paid)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 20 }}>
                <button className="btn btn-outline" onClick={() => setTab("ledger")}>
                  View full ledger history <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* â”€â”€ LEDGER TAB â”€â”€ */}
          {tab === "ledger" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Total kg delivered",   val: fmt(ledger.total_kg_settled),        unit: "kg" },
                  { label: "Cumulative earned",    val: `KES ${fmt(ledger.total_net_paid_kes)}`, unit: "" },
                  { label: "Avg per harvest",      val: `KES ${fmt(Math.round(ledger.total_net_paid_kes / ledger.total_harvests))}`, unit: "" },
                ].map(c => (
                  <div key={c.label} className="card" style={{ padding: "18px 20px" }}>
                    <div className="t-label" style={{ color: "var(--mist)", marginBottom: 8 }}>{c.label}</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
                      {c.val}
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Delivery Ledger</span>
                  <span className="badge badge-blue">{ledger.total_harvests} settlements</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>kg settled</th>
                      <th style={{ textAlign: "right" }}>Net paid</th>
                      <th style={{ textAlign: "right" }}>Running balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.entries.map(entry => (
                      <tr key={entry.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {new Date(entry.date).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--smoke)", marginTop: 2 }}>{entry.note}</div>
                        </td>
                        <td><span className="t-mono" style={{ color: "var(--mist)" }}>{entry.reference}</span></td>
                        <td><span style={{ fontWeight: 600 }}>{fmt(entry.kg_settled)} kg</span></td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--success-fg)" }}>
                            KES {fmt(entry.net_paid)}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "var(--smoke)" }}>
                            {fmt(entry.running_balance)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* â”€â”€ CREDIT TAB â”€â”€ */}
          {tab === "credit" && (
            <div>
              {/* Score hero */}
              <div className="card-dark" style={{ padding: "40px", marginBottom: 20, textAlign: "center" }}>
                <div className="t-label" style={{ color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
                  AvoPulse Credit Readiness Score
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 80, fontWeight: 700, color: "white", lineHeight: 1 }}>
                  {cr.score}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>of {cr.max_score}</div>

                {/* Score bar */}
                <div style={{ maxWidth: 320, margin: "0 auto 20px" }}>
                  <div className="bar-track bar-track-dark" style={{ height: 10 }}>
                    <div
                      style={{
                        height: "100%", borderRadius: 5,
                        background: "linear-gradient(90deg, var(--canopy), var(--gold))",
                        width: `${scorePct}%`,
                        transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", background: "rgba(124,191,94,0.18)", borderRadius: "var(--r-md)", marginBottom: 8 }}>
                  <Star size={14} fill="var(--lime)" color="var(--lime)" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--lime)" }}>{cr.tier}</span>
                </div>
              </div>

              {/* Credit limit */}
              <div className="card" style={{ padding: "24px 28px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div className="t-label" style={{ color: "var(--mist)", marginBottom: 6 }}>Pre-approved input credit limit</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 700, color: "var(--canopy)" }}>
                      KES {fmt(cr.eligible_limit_kes)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={20} fill="var(--gold)" color="var(--gold)" />
                    ))}
                  </div>
                </div>
                <div style={{ padding: "12px 16px", background: "var(--success-bg)", borderRadius: "var(--r-sm)", border: "1px solid #a7f3d0" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--success-fg)", marginBottom: 2 }}>{cr.badge}</div>
                  <div style={{ fontSize: 12, color: "var(--success-fg)", opacity: 0.7 }}>{cr.illustrative_note}</div>
                </div>
              </div>

              {/* Qualification factors */}
              <div className="card" style={{ padding: "24px 28px" }}>
                <div className="t-label" style={{ color: "var(--mist)", marginBottom: 16 }}>Qualification Factors</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {cr.qualification_factors.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < cr.qualification_factors.length - 1 ? "1px solid var(--rule)" : "none" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TrendingUp size={12} color="var(--success-fg)" />
                      </div>
                      <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <Link href="/demo" className="btn btn-outline" style={{ display: "inline-flex" }}>
                  <ArrowLeft size={14} /> Back to demo hub
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

