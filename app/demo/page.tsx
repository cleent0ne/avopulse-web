"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, Scale, User, BarChart3, Leaf, CheckCircle } from "lucide-react";

const ROLES = [
  {
    id: "grader",
    label: "Field Grader",
    name: "Dennis Omwamba",
    sub: "AFA Certified · Nyaribari Chache",
    description: "Photograph cut fruit cross-sections, receive instant AI maturity banding, and issue grader sign-off to create a verified lot code.",
    accent: "var(--lime)",
    badgeBg: "rgba(124,191,94,0.18)",
    img: "/img/avocado-cut.jpg",
    tasks: ["Upload fruit cross-section photos", "Review AI maturity band + diagnostic reasons", "Sign off HARVEST or HOLD"],
    icon: Camera,
  },
  {
    id: "hub",
    label: "Hub Officer",
    name: "Sarah Kwamboka",
    sub: "Weighbridge Officer · Kisii Central Hub",
    description: "Process incoming verified lots through the weighbridge, record export/oil/reject fractions, and trigger instant M-Pesa settlement.",
    accent: "#60a5fa",
    badgeBg: "rgba(96,165,250,0.18)",
    img: "/img/avocados-crate.jpg",
    tasks: ["View incoming lot queue", "Enter gross weight + grade fractions", "Trigger M-Pesa payout"],
    icon: Scale,
  },
  {
    id: "exporter",
    label: "Exporter",
    name: "Martin Kamau",
    sub: "Procurement · East African Fresh Ltd",
    description: "Live supply intelligence dashboard — verified tonnes by ward, forward booking management, and coverage ratio tracking.",
    accent: "var(--gold)",
    badgeBg: "rgba(201,168,76,0.2)",
    img: "/img/avocados-boxed.jpg",
    tasks: ["View verified supply by ward", "Track forward booking coverage", "Create new week booking"],
    icon: BarChart3,
  },
  {
    id: "farmer",
    label: "Farmer",
    name: "Jared Mogaka",
    sub: "Farmer · Keumbu Avocado Producers Co-op",
    description: "Personal delivery ledger with full settlement history, M-Pesa receipts on record, and rules-based credit readiness scoring.",
    accent: "var(--lime)",
    badgeBg: "rgba(124,191,94,0.18)",
    img: "/img/sustainable-farm.jpg",
    tasks: ["View latest settlement & receipt", "Browse full delivery ledger", "Check credit tier & limit"],
    icon: User,
  },
];

export default function DemoPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--forest)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <nav style={{
        height: 64, padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(15,31,16,0.95)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={18} color="var(--lime)" />
          </div>
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 18, color: "white", letterSpacing: "-0.02em" }}>
            Avo<span style={{ color: "var(--lime)" }}>Pulse</span>
          </span>
        </Link>
        <Link href="/" className="btn btn-white-outline btn-sm">
          ← Back to overview
        </Link>
      </nav>

      {/* Header section */}
      <header className="anim-fade-up" style={{ padding: "64px 24px 48px", textAlign: "center", maxWidth: 840, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "Georgia, serif", fontWeight: 700,
          fontSize: "clamp(2.6rem, 5vw, 4.4rem)",
          color: "white", lineHeight: 1.05,
          letterSpacing: "-0.03em", marginBottom: 16,
        }}>
          Choose your role in AvoPulse
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: 640, margin: "0 auto" }}>
          Experience the supply chain from any stakeholder perspective, backed by live verified data and instant settlement.
        </p>
      </header>

      {/* Role cards container */}
      <main style={{
        maxWidth: 1200, width: "100%", margin: "0 auto",
        padding: "0 24px 80px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 24,
      }}>
        {ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <Link key={role.id} href={`/demo/${role.id}`} style={{ textDecoration: "none", display: "flex" }}>
              <div
                className="anim-fade-up"
                style={{
                  background: "var(--grove)",
                  borderRadius: 20,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-4px)";
                  el.style.background = "#1d3d1f";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(0)";
                  el.style.background = "var(--grove)";
                }}
              >
                {/* Photo top */}
                <div style={{ height: 180, position: "relative", width: "100%" }}>
                  <Image
                    src={role.img}
                    alt={role.label}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="350px"
                  />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(15,31,16,0.3)" }} />
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    width: 40, height: 40, borderRadius: 10,
                    background: "rgba(15,31,16,0.75)",
                    backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} color={role.accent} />
                  </div>
                </div>

                {/* Card body */}
                <div style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{
                      display: "inline-block",
                      fontSize: 14, fontWeight: 700,
                      color: role.accent,
                      background: role.badgeBg,
                      padding: "4px 12px",
                      borderRadius: 6,
                      marginBottom: 10,
                    }}>
                      {role.label}
                    </span>
                    <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: 4 }}>
                      {role.name}
                    </h2>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{role.sub}</div>
                  </div>

                  <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.8)", marginBottom: 20, flex: 1 }}>
                    {role.description}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, paddingTop: 16 }}>
                    {role.tasks.map((task, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <CheckCircle size={16} color={role.accent} style={{ flexShrink: 0, marginTop: 4 }} />
                        <span style={{ fontSize: 15, color: "white", lineHeight: 1.4 }}>{task}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 15, fontWeight: 700,
                    color: role.accent,
                    marginTop: "auto",
                  }}>
                    Launch {role.label} demo <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
