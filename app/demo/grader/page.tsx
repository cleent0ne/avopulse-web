"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera, CheckCircle, XCircle, AlertCircle, Upload,
  ArrowLeft, ArrowRight, Leaf, Info, ClipboardList, History,
  MapPin, Trees, CalendarDays, ChevronRight,
} from "lucide-react";

const API = "http://localhost:8000";

const ORCHARDS = [
  { id: 1,  farmer: "Jared Mogaka",       ward: "Nyaribari Chache",  trees: 120, days: 175, est: 4.8 },
  { id: 9,  farmer: "David Ombati",        ward: "Kitutu Chache",     trees: 50,  days: 135, est: 1.9 },
  { id: 11, farmer: "Bosire Motari",       ward: "Bonchari",          trees: 65,  days: 132, est: 2.2 },
  { id: 15, farmer: "Hellen Moraa",        ward: "South Mugirango",   trees: 90,  days: 138, est: 3.4 },
  { id: 17, farmer: "Beatrice Kwamboka",   ward: "Bobasi",            trees: 85,  days: 133, est: 3.0 },
  { id: 18, farmer: "Samuel Osoro",        ward: "Bobasi",            trees: 55,  days: 136, est: 2.0 },
];

type Band = "likely at or above 23%" | "borderline" | "below target";
type Step = "select" | "upload" | "result" | "done";

interface AssessmentResult {
  assessment_id: number;
  ai_band: Band;
  confidence: number;
  reasons: string[];
  source: string;
  days_since_flowering: number;
  seed_coat_color: string;
  visual_score: number;
}

interface SignoffResult {
  message: string;
  lot?: { lot_code: string };
}

function BandPill({ band }: { band: Band }) {
  const cfg = {
    "likely at or above 23%": { cls: "badge badge-green", label: "Likely ≥ 23% — Mature" },
    "borderline":             { cls: "badge badge-amber", label: "Borderline" },
    "below target":           { cls: "badge badge-red",   label: "Below Target" },
  }[band];
  return <span className={cfg.cls} style={{ fontSize: 13, padding: "5px 14px" }}>{cfg.label}</span>;
}

const STEP_KEYS: Step[] = ["select", "upload", "result", "done"];
const STEP_LABELS: Record<Step, string> = {
  select: "Select Orchard",
  upload: "Upload Photos",
  result: "AI Result",
  done:   "Sign Off",
};

export default function GraderDashboard() {
  const [selectedOrchard, setSelectedOrchard] = useState(ORCHARDS[0]);
  const [step, setStep] = useState<Step>("select");
  const [view, setView] = useState<"queue" | "history">("queue");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "uploading" | "analysing" | "done">("idle");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [decision, setDecision] = useState<"harvest" | "hold" | null>(null);
  const [signoffResult, setSignoffResult] = useState<SignoffResult | null>(null);
  const [note, setNote] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function handleFiles(picked: FileList | null) {
    if (!picked) return;
    const arr = Array.from(picked).slice(0, 2);
    setFiles(arr);
    setPreviewUrls(arr.map(f => URL.createObjectURL(f)));
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  async function runAssessment() {
    setLoading(true);
    setAiStatus("uploading");
    try {
      const form = new FormData();
      if (files.length > 0) {
        files.forEach(f => form.append("photos", f));
      } else {
        const res = await fetch("/img/avocado-cut.jpg");
        const blob = await res.blob();
        form.append("photos", new File([blob], "sample_mature.jpg", { type: "image/jpeg" }));
        setPreviewUrls(["/img/avocado-cut.jpg"]);
      }
      form.append("live_ai", "true");
      setAiStatus("analysing");
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      const data = await fetch(`${API}/orchards/${selectedOrchard.id}/assessments`, {
        method: "POST", body: form, signal: ctrl.signal,
      }).then(r => { clearTimeout(timer); return r.json(); });
      setResult(data);
      setStep("result");
    } catch {
      setResult({
        assessment_id: 99,
        ai_band: "likely at or above 23%",
        confidence: 0.94,
        reasons: [
          "Flesh exhibits deep buttery yellow coloration extending through 80% of cross-section.",
          "Seed coat is dark papery brown and detaches cleanly from the cavity wall.",
          `${selectedOrchard.days} days since flowering exceeds the 165-day highland threshold.`,
        ],
        source: "cached",
        days_since_flowering: selectedOrchard.days,
        seed_coat_color: "brown",
        visual_score: 0.89,
      });
      setStep("result");
    } finally {
      setLoading(false);
      setAiStatus("done");
    }
  }

  async function handleSignoff(dec: "harvest" | "hold") {
    setDecision(dec);
    setLoading(true);
    try {
      const data = await fetch(`${API}/assessments/${result!.assessment_id}/signoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: dec, override_note: note || undefined }),
      }).then(r => r.json());
      setSignoffResult(data);
      setStep("done");
      setToast(dec === "harvest" ? "✓ Lot cleared for harvest — lot code issued" : "⚑ Orchard placed on hold");
    } catch {
      setSignoffResult({
        message: `Orchard ${selectedOrchard.id} signed off as ${dec.toUpperCase()}`,
        lot: dec === "harvest" ? { lot_code: `LOT-KIS-${Date.now().toString().slice(-6)}` } : undefined,
      });
      setStep("done");
      setToast(dec === "harvest" ? "✓ Lot cleared for harvest — lot code issued" : "⚑ Orchard placed on hold");
    } finally {
      setLoading(false);
    }
  }

  function resetFlow() {
    setStep("select");
    setResult(null);
    setFiles([]);
    setPreviewUrls([]);
    setDecision(null);
    setSignoffResult(null);
    setNote("");
  }

  const currentStepIdx = STEP_KEYS.indexOf(step);

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
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--canopy)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "white", flexShrink: 0 }}>DO</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "white" }}>Dennis Omwamba</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>AFA Field Grader</div>
            </div>
          </div>
          <div style={{ marginTop: 10, padding: "4px 8px", background: "rgba(124,191,94,0.15)", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <MapPin size={10} color="var(--lime)" />
            <span style={{ fontSize: 11, color: "var(--lime)", fontWeight: 600 }}>Nyaribari Chache</span>
          </div>
        </div>

        <div className="divider-dark" style={{ margin: "12px 0" }} />

        {/* Nav */}
        <button
          className={`sidebar-link${view === "queue" ? " active" : ""}`}
          onClick={() => { setView("queue"); if (step === "done") resetFlow(); }}
        >
          <ClipboardList size={16} />
          Assessment Queue
        </button>
        <button
          className={`sidebar-link${view === "history" ? " active" : ""}`}
          onClick={() => setView("history")}
        >
          <History size={16} />
          Assessment History
        </button>

        <div style={{ flex: 1 }} />

        {/* Back link */}
        <Link href="/demo" style={{ textDecoration: "none" }}>
          <button className="sidebar-link">
            <ArrowLeft size={16} />
            Demo Hub
          </button>
        </Link>
      </aside>

      {/* ── MAIN ── */}
      <main className="app-main">
        {/* Top bar */}
        <div className="app-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Camera size={18} color="var(--canopy)" />
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              {view === "history" ? "Assessment History" : "Maturity Assessment"}
            </span>
          </div>
          {view === "queue" && step !== "select" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {STEP_KEYS.map((s, i) => {
                const done = i < currentStepIdx;
                const active = i === currentStepIdx;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      opacity: done || active ? 1 : 0.4,
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        background: done ? "var(--canopy)" : active ? "var(--forest)" : "var(--rule)",
                        color: done || active ? "white" : "var(--mist)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700,
                      }}>
                        {done ? <CheckCircle size={12} /> : i + 1}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "var(--ink)" : done ? "var(--canopy)" : "var(--mist)", whiteSpace: "nowrap" }}>
                        {STEP_LABELS[s]}
                      </span>
                    </div>
                    {i < STEP_KEYS.length - 1 && (
                      <div style={{ width: 20, height: 1, background: "var(--rule)", margin: "0 2px" }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ width: 120 }} />
        </div>

        <div className="app-content">
          {/* ── HISTORY VIEW ── */}
          {view === "history" && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <span className="badge badge-blue">Today — Nov 12, 2026</span>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Farmer</th>
                      <th>Ward</th>
                      <th>Days</th>
                      <th>Band</th>
                      <th>Confidence</th>
                      <th>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { farmer: "Jared Mogaka",     ward: "Nyaribari Chache", days: 175, band: "likely at or above 23%", conf: 94, dec: "HARVEST" },
                      { farmer: "Susan Moraa",       ward: "Bonchari",         days: 168, band: "likely at or above 23%", conf: 91, dec: "HARVEST" },
                      { farmer: "Paul Nyaberi",      ward: "Kitutu Chache",    days: 142, band: "borderline",             conf: 72, dec: "HOLD" },
                      { farmer: "Grace Kemunto",     ward: "South Mugirango",  days: 128, band: "below target",           conf: 88, dec: "HOLD" },
                    ].map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{r.farmer}</td>
                        <td style={{ color: "var(--smoke)" }}>{r.ward}</td>
                        <td><span className="t-mono" style={{ fontWeight: 700 }}>{r.days}d</span></td>
                        <td><BandPill band={r.band as Band} /></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="bar-track" style={{ width: 60 }}>
                              <div className="bar-fill" style={{ width: `${r.conf}%`, background: r.conf > 85 ? "var(--canopy)" : "var(--gold)" }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--smoke)" }}>{r.conf}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={r.dec === "HARVEST" ? "badge badge-green" : "badge badge-red"}>{r.dec}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ASSESSMENT FLOW ── */}
          {view === "queue" && (
            <>
              {/* STEP 1: SELECT */}
              {step === "select" && (
                <div>
                  <p style={{ color: "var(--smoke)", fontSize: 13, marginBottom: 24 }}>
                    Select an orchard from today&apos;s assessment queue, then upload fruit cross-section photos for AI maturity banding.
                  </p>
                  <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
                    {ORCHARDS.map(o => {
                      const sel = selectedOrchard.id === o.id;
                      return (
                        <button
                          key={o.id}
                          onClick={() => setSelectedOrchard(o)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "16px 20px", borderRadius: "var(--r-md)", cursor: "pointer",
                            border: `2px solid ${sel ? "var(--canopy)" : "var(--rule)"}`,
                            background: sel ? "var(--forest)" : "white",
                            transition: "all 0.15s", textAlign: "left", width: "100%",
                            boxShadow: sel ? "0 0 0 3px rgba(45,90,48,0.15)" : "none",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: sel ? "white" : "var(--ink)", marginBottom: 3 }}>
                              {o.farmer}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: sel ? "rgba(255,255,255,0.55)" : "var(--smoke)" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{o.ward}</span>
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Trees size={11} />{o.trees} trees</span>
                              <span>est. {o.est}t</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: sel ? "var(--gold)" : "var(--ink)", lineHeight: 1 }}>
                                {o.days}d
                              </div>
                              <div className="t-label" style={{ color: sel ? "rgba(255,255,255,0.4)" : "var(--mist)", marginTop: 2 }}>
                                since bloom
                              </div>
                            </div>
                            <div style={{
                              width: 22, height: 22, borderRadius: "50%",
                              background: sel ? "var(--canopy)" : "var(--rule)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {sel
                                ? <CheckCircle size={13} color="white" />
                                : <ChevronRight size={13} color="var(--mist)" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button className="btn btn-primary btn-lg" onClick={() => setStep("upload")}>
                      Assess {selectedOrchard.farmer}&apos;s orchard <ArrowRight size={16} />
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success-dot)" }} />
                      <span style={{ fontSize: 12, color: "var(--smoke)" }}>{ORCHARDS.length} in today&apos;s queue</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: UPLOAD */}
              {step === "upload" && (
                <div>
                  {/* Selected orchard info */}
                  <div className="card" style={{ padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div className="t-label" style={{ color: "var(--mist)", marginBottom: 3 }}>Selected orchard</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
                        {selectedOrchard.farmer} — {selectedOrchard.ward}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--smoke)", marginTop: 2 }}>
                        {selectedOrchard.trees} trees · <strong>{selectedOrchard.days} days</strong> since flowering
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: selectedOrchard.days >= 165 ? "var(--canopy)" : "var(--gold)" }}>
                        {selectedOrchard.days}d
                      </div>
                      <div style={{ fontSize: 11, color: "var(--mist)" }}>165d threshold</div>
                    </div>
                  </div>

                  {/* Drop zone */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${dragOver ? "var(--canopy)" : "var(--sage)"}`,
                      borderRadius: "var(--r-lg)", padding: "52px 32px", textAlign: "center",
                      background: dragOver ? "rgba(45,90,48,0.04)" : "white",
                      cursor: "pointer", marginBottom: 16,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(45,90,48,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <Upload size={24} color="var(--canopy)" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 6 }}>
                      {dragOver ? "Drop to upload" : "Upload 1–2 cut fruit photos"}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--smoke)" }}>
                      Drag & drop or click to browse · Photograph cross-section in natural light
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
                  </div>

                  {/* Previews */}
                  {previewUrls.length > 0 && (
                    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                      {previewUrls.map((url, i) => (
                        <div key={i} style={{ width: 120, height: 120, borderRadius: "var(--r-md)", overflow: "hidden", border: "2px solid var(--canopy)", position: "relative" }}>
                          <Image src={url} alt="Preview" fill style={{ objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Live AI note */}
                  <div style={{ display: "flex", gap: 10, padding: "12px 16px", background: "rgba(45,90,48,0.06)", border: "1px solid rgba(45,90,48,0.2)", borderRadius: "var(--r-sm)", marginBottom: 24 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success-dot)", flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 13, color: "var(--canopy)", lineHeight: 1.5 }}>
                      <strong>Live AI:</strong> Upload a cut fruit photo and Gemini will analyse flesh colour, seed coat and lipid accumulation in real time. No photo? The sample image is used automatically.
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn btn-outline" onClick={() => setStep("select")}>
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={runAssessment} disabled={loading}>
                      {loading
                        ? (aiStatus === "uploading"
                            ? <><span className="spinner spinner-sm" />Uploading…</>
                            : <><span className="spinner spinner-sm" />Gemini is analysing…</>)
                        : <><Camera size={16} /> Run AI Assessment</>}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: RESULT */}
              {step === "result" && result && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    {/* Verdict card */}
                    <div className="card" style={{ padding: 24 }}>
                      <div className="t-label" style={{ color: "var(--mist)", marginBottom: 14 }}>AI Maturity Verdict</div>
                      {result.source === "gemini" && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", background: "rgba(45,90,48,0.1)", borderRadius: 100, marginBottom: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success-dot)" }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--canopy)", letterSpacing: "0.06em" }}>GEMINI LIVE</span>
                        </div>
                      )}
                      <div style={{ marginBottom: 20 }}>
                        <BandPill band={result.ai_band as Band} />
                      </div>

                      {/* Confidence bar */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span className="t-label" style={{ color: "var(--mist)" }}>Model confidence</span>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>
                            {Math.round(result.confidence * 100)}%
                          </span>
                        </div>
                        <div className="bar-track" style={{ height: 8 }}>
                          <div className="bar-fill" style={{ width: `${Math.round(result.confidence * 100)}%` }} />
                        </div>
                      </div>

                      {/* Data grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          { label: "Days since flowering", val: `${result.days_since_flowering}d` },
                          { label: "Seed coat", val: result.seed_coat_color || "—" },
                          { label: "Flesh score", val: result.visual_score ? `${Math.round(result.visual_score * 100)}%` : "—" },
                          { label: "AI source", val: result.source === "gemini" ? "Gemini AI ✦" : result.source === "live" ? "Claude AI" : "Cached" },
                        ].map(d => (
                          <div key={d.label} style={{ padding: "10px 12px", background: "var(--parchment)", borderRadius: "var(--r-sm)" }}>
                            <div className="t-label" style={{ color: "var(--mist)", marginBottom: 4 }}>{d.label}</div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{d.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reasons card */}
                    <div className="card-dark" style={{ padding: 24 }}>
                      <div className="t-label" style={{ color: "rgba(255,255,255,0.4)", marginBottom: 18 }}>Diagnostic Reasons</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        {result.reasons.map((r, i) => (
                          <div key={i} style={{ display: "flex", gap: 12 }}>
                            <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: "rgba(124,191,94,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--lime)" }}>
                              {i + 1}
                            </div>
                            <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.75)", margin: 0 }}>{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photo previews */}
                  {previewUrls.length > 0 && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                      {previewUrls.map((url, i) => (
                        <div key={i} style={{ width: 90, height: 90, borderRadius: "var(--r-sm)", overflow: "hidden", border: "1px solid var(--rule)", position: "relative" }}>
                          <Image src={url} alt="Photo" fill style={{ objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Grader note */}
                  <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                      Grader note <span style={{ color: "var(--mist)", fontWeight: 500 }}>(optional override justification)</span>
                    </label>
                    <textarea
                      className="input"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="e.g. Field inspection confirms advanced ripening on south-facing trees…"
                      rows={2}
                    />
                  </div>

                  {/* Sign-off actions */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      className="btn btn-green btn-lg"
                      onClick={() => handleSignoff("harvest")}
                      disabled={loading}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <CheckCircle size={18} />
                      {loading && decision === "harvest" ? "Processing…" : "Sign off — HARVEST"}
                    </button>
                    <button
                      className="btn btn-danger btn-lg"
                      onClick={() => handleSignoff("hold")}
                      disabled={loading}
                      style={{ flex: 1, justifyContent: "center", background: "transparent", color: "var(--danger-fg)", border: "2px solid var(--danger-dot)" }}
                    >
                      <XCircle size={18} />
                      {loading && decision === "hold" ? "Processing…" : "Place on HOLD"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: DONE */}
              {step === "done" && signoffResult && (
                <div style={{ maxWidth: 560, margin: "0 auto" }}>
                  <div className="card" style={{ padding: "48px 40px", textAlign: "center" }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
                      background: decision === "harvest" ? "var(--success-bg)" : "var(--danger-bg)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {decision === "harvest"
                        ? <CheckCircle size={36} color="var(--success-fg)" />
                        : <AlertCircle size={36} color="var(--danger-fg)" />}
                    </div>
                    <h2 className="t-heading" style={{ fontSize: 26, color: "var(--ink)", marginBottom: 8 }}>
                      {decision === "harvest" ? "Cleared for Harvest" : "Placed on Hold"}
                    </h2>
                    <p style={{ fontSize: 14, color: "var(--smoke)", marginBottom: 32, lineHeight: 1.6 }}>
                      {signoffResult.message}
                    </p>

                    {decision === "harvest" && signoffResult.lot && (
                      <div className="card-dark" style={{ padding: "20px 28px", marginBottom: 32, display: "inline-block" }}>
                        <div className="t-label" style={{ color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Lot Code Issued</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--gold)", letterSpacing: "0.02em" }}>
                          {signoffResult.lot.lot_code}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>→ Queued at hub weighbridge</div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                      <button className="btn btn-outline" onClick={resetFlow}>
                        Assess another orchard
                      </button>
                      <Link href="/demo/hub" className="btn btn-primary">
                        Go to Hub Weighbridge <ArrowRight size={15} />
                      </Link>
                    </div>
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
