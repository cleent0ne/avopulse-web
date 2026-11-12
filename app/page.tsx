"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  CheckCircle, Camera, Scale, Smartphone,
  ArrowRight, Shield, Zap, TrendingUp, Leaf,
  Star,
} from "lucide-react";

/* ─── data ─── */
const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Farmers",  href: "#for-farmers" },
  { label: "For Exporters",href: "#for-exporters" },
  { label: "Platform",     href: "#platform" },
];

const STATS = [
  { num: "23%",  label: "Minimum verified dry matter" },
  { num: "1.5s", label: "Instant M-Pesa disbursement" },
  { num: "18",   label: "Highland orchards in network" },
  { num: "37t",  label: "Verified tonnes this season" },
];

/* ─── AnimatedNum ─── */
function AnimatedNum({ target }: { target: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) { setDisplay(target); return; }
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !fired.current) {
        fired.current = true;
        const duration = 1200;
        const start = performance.now();
        const isInt = Number.isInteger(num);
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const val = num * (1 - Math.pow(1 - p, 3));
          setDisplay(isInt ? Math.round(val).toString() : val.toFixed(1));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{display}</span>;
}

/* ─── Torn paper SVG divider ─── */
function TornEdge({ fromColor, toColor, flip = false }: { fromColor: string; toColor: string; flip?: boolean }) {
  return (
    <div style={{ position: "relative", height: 80, marginTop: -1, overflow: "hidden", background: fromColor }}>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "100%", transform: flip ? "scaleX(-1)" : "none" }}
      >
        <path
          d="M0,0 L0,45 C80,55 160,30 240,48 C320,66 380,25 460,38 C540,52 600,70 680,55 C760,40 820,20 900,35 C980,50 1040,65 1120,52 C1200,38 1280,22 1360,40 C1400,50 1420,55 1440,48 L1440,0 Z"
          fill={fromColor}
        />
        <path
          d="M0,45 C80,55 160,30 240,48 C320,66 380,25 460,38 C540,52 600,70 680,55 C760,40 820,20 900,35 C980,50 1040,65 1120,52 C1200,38 1280,22 1360,40 C1400,50 1420,55 1440,48 L1440,80 L0,80 Z"
          fill={toColor}
        />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: "var(--parchment)", overflowX: "hidden" }}>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(15,31,16,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={18} color="var(--lime)" />
          </div>
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 18, color: "white", letterSpacing: "-0.02em" }}>
            Avo<span style={{ color: "var(--lime)" }}>Pulse</span>
          </span>
        </div>
        <div className="desktop-nav">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} style={{ padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "white"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >{l.label}</a>
          ))}
        </div>
        <Link href="/demo" className="btn btn-gold">
          Launch Demo <ArrowRight size={14} />
        </Link>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        paddingTop: 64,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Full-bleed hero background image with cinematic drift */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Image
            src="/img/hero-bg.jpg"
            alt="Kisii avocado orchard with ripe Hass fruit"
            fill
            priority
            sizes="100vw"
            className="anim-hero-drift"
            style={{ objectFit: "cover", objectPosition: "center 30%" }}
          />
        </div>

        {/* Dark gradient overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(105deg, rgba(5,15,6,0.92) 0%, rgba(5,15,6,0.85) 35%, rgba(5,15,6,0.55) 55%, rgba(5,15,6,0.2) 75%, transparent 90%)",
        }} />

        {/* Subtle bottom vignette */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 160, zIndex: 2,
          background: "linear-gradient(to bottom, transparent, var(--parchment))",
          pointerEvents: "none",
        }} />

        {/* Text content */}
        <div style={{
          position: "relative", zIndex: 3,
          display: "flex", alignItems: "center",
          flex: 1,
        }}>
          <div className="hero-content">
            <div style={{ maxWidth: 840 }}>
              <h1 className="anim-fade-up" style={{
                fontFamily: "Georgia, serif", fontWeight: 700,
                fontSize: "clamp(2.4rem, 4.4vw, 4.4rem)",
                color: "white", lineHeight: 1.05,
                letterSpacing: "-0.03em", marginBottom: 20,
              }}>
                Highland harvest and aggregation
              </h1>

              <p className="anim-fade-up" style={{ fontSize: 18, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", marginBottom: 36, maxWidth: 580 }}>
                Digital maturity verification, transparent hub weighbridges, and instant M-Pesa payments for Kisii smallholder farmers.
              </p>

              <div className="anim-fade-up" style={{ display: "flex", gap: 14, marginBottom: 48, flexWrap: "wrap" }}>
                <Link href="/demo" className="btn btn-gold btn-xl">
                  See it live <ArrowRight size={16} />
                </Link>
                <a href="#how-it-works" className="btn btn-white-outline btn-xl">
                  How it works
                </a>
              </div>

              {/* Stats Strip */}
              <div className="stats-strip">
                {STATS.map(s => (
                  <div key={s.num} className="anim-fade-up" style={{ background: "rgba(15,31,16,0.65)", padding: "18px 20px", borderRadius: 12 }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700, color: "white", lineHeight: 1 }}>
                      <AnimatedNum target={s.num} />
                      <span style={{ color: "var(--lime)" }}>{s.num.replace(/[0-9.]/g, "")}</span>
                    </div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 8, lineHeight: 1.4 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Torn edge bottom */}
        <div style={{ position: "relative", zIndex: 3 }}>
          <TornEdge fromColor="transparent" toColor="var(--parchment)" />
        </div>
      </section>

      {/* ═══ SECTION 2: What is AvoPulse? ═══ */}
      <section id="how-it-works" style={{ background: "var(--parchment)", padding: "80px 24px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 56, alignItems: "start" }}>
            <div className="anim-fade-up">
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem, 3.2vw, 3rem)", fontWeight: 700, color: "var(--forest)", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 20 }}>
                What makes AvoPulse different?
              </h2>
              <p style={{ fontSize: 16, color: "var(--smoke)", lineHeight: 1.7, marginBottom: 36 }}>
                Every harvest step creates an immutable digital record. No paperwork, no price disputes, and no waiting days for payment.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {[
                  { label: "AI photo grading", body: "Gemini vision reads flesh colour, seed coat, and oil accumulation against KALRO's 23% benchmark." },
                  { label: "Grader sign-off", body: "Human oversight every time — grader confirms, overrides if needed, and issues a signed lot code." },
                  { label: "Live weighbridge", body: "Export, oil, and reject fractions keyed in at the hub with a live payout preview." },
                  { label: "Instant M-Pesa", body: "KES lands in the farmer's phone before leaving the hub. Receipt appended to their ledger." },
                ].map(f => (
                  <div key={f.label} style={{ background: "rgba(45,90,48,0.05)", padding: "20px", borderRadius: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--forest)", marginBottom: 6 }}>{f.label}</div>
                    <div style={{ fontSize: 14, color: "var(--smoke)", lineHeight: 1.6 }}>{f.body}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: image with organic frame and interactive scan-line HUD */}
            <div className="anim-fade-up" style={{ position: "relative" }}>
              <div style={{ borderRadius: "24px", overflow: "hidden", aspectRatio: "4/4", position: "relative" }}>
                <Image src="/img/avocado-cut.jpg" alt="AI maturity assessment" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 500px" />
                {/* MotionSites Laser Scan Wipe Line */}
                <div className="anim-scan-line" />
              </div>
              <div style={{
                position: "absolute", bottom: "16px", left: "16px",
                background: "var(--forest)", color: "white",
                borderRadius: 12, padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--lime)" }} className="anim-pulse" />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--lime)" }}>Likely ≥ 23% Mature</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>94% model confidence · Live scan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TornEdge fromColor="var(--parchment)" toColor="white" />

      {/* ═══ SECTION 3: For Farmers ═══ */}
      <section id="for-farmers" style={{ background: "white", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 56, alignItems: "center" }}>
          {/* Left: image */}
          <div className="anim-fade-up" style={{ position: "relative" }}>
            <div style={{ borderRadius: "24px", overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
              <Image src="/img/sustainable-farm.jpg" alt="Kisii avocado farm" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 500px" />
            </div>
            <div style={{
              position: "absolute", bottom: 16, right: 16,
              background: "var(--forest)", borderRadius: 12,
              padding: "18px 22px", minWidth: 200,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Jared Mogaka · Season Total</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "var(--lime)", marginTop: 4 }}>KES 1.09M</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={13} fill="var(--gold)" color="var(--gold)" />)}
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginLeft: 4 }}>Tier 1 Credit</span>
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div className="anim-fade-up">
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "var(--forest)", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 20 }}>
              Your harvest. Your ledger.
            </h2>
            <p style={{ fontSize: 16, color: "var(--smoke)", lineHeight: 1.7, marginBottom: 28 }}>
              Every delivery builds a permanent, verifiable record. Five harvests earn you Tier 1 credit without collateral or middlemen.
            </p>
            {[
              "Instant M-Pesa settlement the moment weights are confirmed",
              "Full line-item transparency with every deduction explained",
              "Tier 1 status unlocks up to KES 150,000 input credit",
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                <CheckCircle size={18} color="var(--canopy)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
            <div style={{ marginTop: 32 }}>
              <Link href="/demo/farmer" className="btn btn-primary btn-lg">
                View farmer demo <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TornEdge fromColor="white" toColor="var(--parchment)" flip />

      {/* ═══ SECTION 4: For Exporters ═══ */}
      <section id="for-exporters" style={{ background: "var(--parchment)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 32 }}>
            {/* Card 1 */}
            <div className="anim-fade-up" style={{ background: "white", borderRadius: 16, overflow: "hidden", display: "grid", gridTemplateColumns: "130px 1fr" }}>
              <div style={{ position: "relative" }}>
                <Image src="/img/avocados-crate.jpg" alt="Weighbridge" fill style={{ objectFit: "cover" }} sizes="130px" />
              </div>
              <div style={{ padding: "24px" }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--forest)", marginBottom: 8, lineHeight: 1.2 }}>Transparent settlement</h3>
                <p style={{ fontSize: 14, color: "var(--smoke)", lineHeight: 1.6 }}>Export, oil, and reject fractions auto-calculated with real-time payout previews.</p>
                <Link href="/demo/hub" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 700, color: "var(--canopy)", marginTop: 12, textDecoration: "none" }}>
                  Hub demo <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="anim-fade-up" style={{ background: "white", borderRadius: 16, overflow: "hidden", display: "grid", gridTemplateColumns: "130px 1fr" }}>
              <div style={{ position: "relative" }}>
                <Image src="/img/avocados-boxed.jpg" alt="Export supply" fill style={{ objectFit: "cover" }} sizes="130px" />
              </div>
              <div style={{ padding: "24px" }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--forest)", marginBottom: 8, lineHeight: 1.2 }}>Book with confidence</h3>
                <p style={{ fontSize: 14, color: "var(--smoke)", lineHeight: 1.6 }}>Verified tonnes by ward in real time. Know exactly what is mature before trucks roll.</p>
                <Link href="/demo/exporter" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 700, color: "var(--canopy)", marginTop: 12, textDecoration: "none" }}>
                  Exporter demo <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Ward supply preview strip */}
          <div id="platform" className="anim-fade-up" style={{ background: "white", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <div style={{ background: "var(--forest)", padding: "36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: 12 }}>Highland supply by ward</h3>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>Live verified tonnage across collection wards, updated the moment a grader signs off.</p>
              </div>
              <div style={{ padding: "32px" }}>
                {[
                  { ward: "Nyaribari Chache", t: 13.2, pct: 73 },
                  { ward: "Kitutu Chache",    t: 8.3,  pct: 64 },
                  { ward: "Bonchari",         t: 8.7,  pct: 80 },
                  { ward: "South Mugirango",  t: 5.1,  pct: 45 },
                  { ward: "Bobasi",           t: 6.5,  pct: 57 },
                ].map(w => (
                  <div key={w.ward} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", width: 140, flexShrink: 0 }}>{w.ward}</span>
                    <div className="bar-track" style={{ flex: 1, height: 8 }}>
                      <div className="bar-fill" style={{ width: `${w.pct}%` }} />
                    </div>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--canopy)", width: 45, textAlign: "right", flexShrink: 0 }}>{w.t}t</span>
                  </div>
                ))}
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, background: "rgba(45,90,48,0.03)", padding: "12px 16px", borderRadius: 8 }}>
                  <span style={{ fontSize: 14, color: "var(--smoke)", fontWeight: 500 }}>Total verified mature Hass</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--canopy)" }}>41.8 tonnes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TornEdge fromColor="var(--parchment)" toColor="#f5f0e6" />

      {/* ═══ SECTION 5: Platform features (Warm Sandstone Editorial) ═══ */}
      <section style={{ background: "#f5f0e6", padding: "88px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 64, alignItems: "center" }}>
          <div className="anim-fade-up">
            
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 3.4vw, 3.2rem)", color: "var(--forest)", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20 }}>
              Built for highland conditions.
            </h2>
            <p style={{ fontSize: 17, color: "var(--smoke)", lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
              Offline AI fallbacks, Kenya-calibrated KALRO thresholds, and instant mobile money — engineered specifically for the Kisii highlands.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                {
                  title: "Tamper-proof lot codes",
                  body: "Assessment, weigh-in, and payout linked in one continuous verifiable cryptographic chain.",
                  tag: "Traceability",
                },
                {
                  title: "Offline-resilient AI",
                  body: "Pre-cached models guarantee field assessments complete smoothly even without cellular signal.",
                  tag: "Edge AI",
                },
                {
                  title: "Credit readiness scoring",
                  body: "Five completed deliveries unlock Tier 1 standing and up to KES 150k seasonal input financing.",
                  tag: "Farmer Credit",
                },
                {
                  title: "KALRO-calibrated",
                  body: "Hass maturity benchmarks tuned specifically to 1,700–1,900m altitude and volcanic soil conditions.",
                  tag: "Agronomy",
                },
              ].map(f => (
                <div key={f.title} style={{
                  padding: "20px 24px",
                  background: "white",
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  borderLeft: "4px solid var(--canopy)",
                  
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "var(--forest)" }}>{f.title}</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--canopy)", background: "rgba(45,90,48,0.08)", padding: "2px 8px", borderRadius: 4 }}>
                      {f.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: 15, color: "var(--smoke)", lineHeight: 1.6 }}>{f.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: organic photo collage with live credit card */}
          <div className="anim-fade-up" style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 440, aspectRatio: "1/1", borderRadius: 28, overflow: "hidden", position: "relative",  }}>
              <Image src="/img/hass-labelled.jpg" alt="Export quality Hass avocados" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 440px" />
            </div>
            {/* Live credit pill floating without shadow */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(15,31,16,0.92)", color: "white",
              padding: "18px 24px",
              borderTop: "3px solid var(--lime)",
            }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "var(--lime)" }}>
                815 / 900 <span style={{ fontSize: 14, color: "white", fontWeight: 600, marginLeft: 8 }}>Tier 1 Prime Commercial</span>
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: "4px 0 0" }}>Verified harvest deliveries qualify for zero-collateral input financing</p>
            </div>
          </div>
        </div>
      </section>

      <TornEdge fromColor="#f5f0e6" toColor="var(--parchment)" />

      {/* ═══ SECTION 6: Four Perspectives ═══ */}
      <section style={{ background: "var(--parchment)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="anim-fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 3.2vw, 3rem)", color: "var(--forest)", letterSpacing: "-0.025em" }}>
              One platform. Every role.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20, marginBottom: 56 }}>
            {[
              { role: "Field Grader", name: "Dennis Omwamba", href: "/demo/grader", img: "/img/avocado-tree.jpg",    icon: Camera,  quote: "The lot code ends the dispute." },
              { role: "Hub Officer",  name: "Sarah Kwamboka", href: "/demo/hub",    img: "/img/avocados-crate.jpg",  icon: Scale,   quote: "Farmer gets paid before leaving." },
              { role: "Exporter",     name: "Martin Kamau",   href: "/demo/exporter",img: "/img/avocados-boxed.jpg", icon: TrendingUp, quote: "I book tonnage I can trust." },
              { role: "Farmer",       name: "Jared Mogaka",   href: "/demo/farmer", img: "/img/sustainable-farm.jpg",icon: Smartphone,quote: "My ledger, my credit." },
            ].map(p => {
              const Icon = p.icon;
              return (
                <Link key={p.role} href={p.href} style={{ textDecoration: "none" }}>
                  <div
                    className="anim-fade-up"
                    style={{ background: "white", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "transform 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                  >
                    <div style={{ height: 160, position: "relative" }}>
                      <Image src={p.img} alt={p.role} fill style={{ objectFit: "cover" }} sizes="260px" />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(15,31,16,0.3)" }} />
                      <div style={{ position: "absolute", bottom: 12, left: 12, width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} color="white" />
                      </div>
                    </div>
                    <div style={{ padding: "18px 20px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--canopy)", marginBottom: 4 }}>{p.role}</div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--forest)", marginBottom: 8 }}>{p.name}</div>
                      <p style={{ fontSize: 14, color: "var(--smoke)", lineHeight: 1.5, fontStyle: "italic", marginBottom: 12 }}>
                        &ldquo;{p.quote}&rdquo;
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 700, color: "var(--canopy)" }}>
                        Enter demo <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Big CTA */}
          <div className="anim-fade-up" style={{ background: "white", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", minHeight: 220 }}>
              <div style={{ position: "relative", minHeight: 200 }}>
                <Image src="/img/avocados-fruits.jpg" alt="Hass avocados" fill style={{ objectFit: "cover" }} sizes="300px" />
              </div>
              <div style={{ padding: "40px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "var(--forest)", marginBottom: 12, lineHeight: 1.1 }}>
                  Ready to see it in action?
                </h3>
                <p style={{ fontSize: 15, color: "var(--smoke)", lineHeight: 1.7, marginBottom: 28, maxWidth: 440 }}>
                  The live demo runs against real seeded data — 18 orchards, 5 harvest batches, genuine KES arithmetic. No login required.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/demo" className="btn btn-primary btn-lg">
                    Launch demo <ArrowRight size={15} />
                  </Link>
                  <Link href="/demo/grader" className="btn btn-outline btn-lg">
                    Start as Field Grader
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GALLERY STRIP ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", height: 160, overflow: "hidden" }}>
        {["/img/sustainable-farm.jpg","/img/avocado-cut.jpg","/img/avocados-fruits.jpg","/img/avocado-tree.jpg","/img/avocados-boxed.jpg","/img/hass-labelled.jpg"].map((src, i) => (
          <div key={i} style={{ position: "relative", overflow: "hidden" }}>
            <Image src={src} alt="" fill style={{ objectFit: "cover" }} sizes="200px" />
          </div>
        ))}
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "var(--forest)", padding: "56px 24px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, paddingBottom: 40, flexWrap: "wrap", gap: 32 }}>
            <div style={{ maxWidth: 320 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Leaf size={16} color="var(--lime)" />
                </div>
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 17, color: "white", letterSpacing: "-0.02em" }}>
                  Avo<span style={{ color: "var(--lime)" }}>Pulse</span>
                </span>
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                Digital maturity verification and aggregation hub for Kisii Highlands smallholder avocado farmers.
              </p>
            </div>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              {[
                { title: "Platform",   links: ["Grader Dashboard", "Hub Weighbridge", "Exporter Supply", "Farmer Ledger"] },
                { title: "Technology", links: ["AI Vision Engine", "KALRO Thresholds", "M-Pesa Integration", "Credit Readiness"] },
              ].map(col => (
                <div key={col.title}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--lime)", marginBottom: 12 }}>{col.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {col.links.map(l => <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{l}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>© 2026 AvoPulse · Kisii Highlands Digital Agriculture Initiative</span>
            <div style={{ display: "flex", gap: 20 }}>
              {["KALRO Certified", "AFA Compliant", "M-Pesa Integrated"].map(l => (
                <span key={l} style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
