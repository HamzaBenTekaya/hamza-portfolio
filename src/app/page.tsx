"use client";

import { useEffect, useRef, useState } from "react";
import WorldAtlas from "./components/WorldAtlas";

// ─── Dark-mode toggle hook ─────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return { dark, toggle };
}

// ─── Color system ─────────────────────────────────────────────────────────
// amber  → Academics & Distinctions
// cobalt → Engineering, Hardware, Experiences & Projects
// crimson → Leadership, Motorsport & Ventures
// teal   → Interests, Creative Media, Fitness

function getTagStyles(label: string): React.CSSProperties {
  if (/Mention|Baccalauréat|Technical Baccalaureate|Concours|Kangourou|Kangaroo|Très Bien|Highest Honors|Pilote|Pioneer|Élites|Preparatoire|Préparatoire|IPEIM|Scholarship|Distinction|STEM|Mathematical/i.test(label)) {
    return { backgroundColor: "var(--amber-bg)", color: "var(--amber)", border: "1px solid var(--amber-border)" };
  }
  if (/Electrical|Electronic|Semiconductor|Microchip|Mechatronic|IoT|Embedded|Arduino|Sensor|Bluetooth|PCB|Logic|Network|Maintenance|R&D|Hardware|Repair|Console|Diagnostics|Python|CAD|SolidWorks|G-Code|Mechanical|Programming|Game Development|Mobile App|GoMyCode|Industrial|Software|Engineering|Technical|BKS|Factory|Intern/i.test(label)) {
    return { backgroundColor: "var(--cobalt-bg)", color: "var(--cobalt)", border: "1px solid var(--cobalt-border)" };
  }
  if (/Formula 1|F1|Community|Founder|Leadership|Event|Misterio|E-commerce|Brand|Photo|Lightroom|Canon|Commercial|Visual|Football|Academy|Team Sport|Championship|Paint|Art|Sketch|Exhibition|Gymnastic|Rotary|Sahel|Motorsport|Ventures/i.test(label)) {
    return { backgroundColor: "var(--crimson-bg)", color: "var(--crimson)", border: "1px solid var(--crimson-border)" };
  }
  if (/Fitness|Strength|Training|Discipline|Gym|Teal|Creative|Photography|Media/i.test(label)) {
    return { backgroundColor: "var(--teal-bg)", color: "var(--teal)", border: "1px solid var(--teal-border)" };
  }
  return { backgroundColor: "var(--tag-bg)", color: "var(--tag-text)", border: "1px solid var(--border)" };
}

function Tag({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 11px", borderRadius: 999,
      fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap",
      ...getTagStyles(label),
    }}>
      {label}
    </span>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
      {tags.map((t) => <Tag key={t} label={t} />)}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 8px ${color}`, display: "inline-block", flexShrink: 0 }} />;
}

function EyebrowLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <Dot color={color} />
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color }}>
        {children}
      </span>
    </div>
  );
}

function TimelineCard({
  id,
  activeId,
  onToggle,
  period,
  title,
  institution,
  description,
  tags,
  link,
  linkLabel,
  highlight,
  accentColor,
}: {
  id?: string;
  activeId?: string | null;
  onToggle?: (id: string) => void;
  period: string;
  title: string;
  institution?: string;
  description: string | React.ReactNode;
  tags?: string[];
  link?: string;
  linkLabel?: string;
  highlight?: string;
  accentColor?: string;
}) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const cardId = id ?? title;
  const isExpanded = activeId !== undefined ? activeId === cardId : localExpanded;
  const dot = accentColor ?? "var(--text-muted)";

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click is inside a link, allow default link action
    if ((e.target as HTMLElement).closest("a")) return;
    if (onToggle) {
      onToggle(cardId);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        position: "relative",
        paddingLeft: 28,
        paddingBottom: isExpanded ? 38 : 32,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Spine milestone indicator */}
      <span
        style={{
          position: "absolute",
          left: isExpanded ? -7 : -5,
          top: isExpanded ? 4 : 5,
          width: isExpanded ? 14 : 10,
          height: isExpanded ? 14 : 10,
          borderRadius: "50%",
          border: isExpanded ? `3px solid ${dot}` : `2px solid ${dot}`,
          backgroundColor: isExpanded ? dot : "var(--bg)",
          boxShadow: isExpanded ? `0 0 16px ${dot}` : `0 0 10px ${dot}50`,
          outline: "3px solid var(--bg)",
          display: "block",
          transition: "all 0.25s ease",
          zIndex: 2,
        }}
      />

      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: isExpanded ? `1.5px solid ${dot}` : "1px solid var(--border)",
          borderRadius: 16,
          padding: isExpanded ? "26px 28px" : "20px 22px",
          transform: isExpanded ? "scale(1.015)" : "scale(1)",
          transformOrigin: "left center",
          boxShadow: isExpanded
            ? `0 16px 36px -8px rgba(0, 0, 0, 0.14), 0 0 20px ${dot}20`
            : "0 2px 8px rgba(0,0,0,0.02)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header row with Period + Milestone Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: dot }}>
            {period}
          </span>
          {isExpanded ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: dot,
                padding: "2px 9px",
                borderRadius: 999,
                backgroundColor: "var(--tag-bg)",
                border: `1px solid ${dot}40`,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: dot }} />
              Active Milestone
            </span>
          ) : (
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", opacity: 0.65 }}>
              Click to focus
            </span>
          )}
        </div>

        <h3
          style={{
            marginTop: 6,
            fontSize: isExpanded ? 17.5 : 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.35,
            transition: "font-size 0.2s ease",
          }}
        >
          {title}
        </h3>

        {institution && (
          <p style={{ marginTop: 3, fontSize: isExpanded ? 14 : 13.5, fontWeight: 500, color: "var(--text-secondary)" }}>
            {institution}
          </p>
        )}

        {highlight && (
          <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 7, backgroundColor: "var(--amber-bg)", color: "var(--amber)", border: "1px solid var(--amber-border)", borderRadius: 8, padding: "5px 12px", fontSize: 13, fontWeight: 700 }}>
            <span>★</span> {highlight}
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: isExpanded ? 14.5 : 14, lineHeight: isExpanded ? 1.85 : 1.75, color: "var(--text-secondary)", transition: "all 0.2s ease" }}>
          {description}
        </div>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: dot, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {linkLabel ?? link}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 2.5h7v7M2.5 9.5 9.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </a>
        )}

        {tags && tags.length > 0 && <TagRow tags={tags} />}
      </div>
    </div>
  );
}

function SkillGroup({ category, items, dotColor }: { category: string; items: string[]; dotColor?: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {dotColor && <Dot color={dotColor} />}
        <h3 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>{category}</h3>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {items.map(s => <Tag key={s} label={s} />)}
      </div>
    </div>
  );
}

// ─── 30-Second Modal ───────────────────────────────────────────────────────
function ThirtySecondModal({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  const rows = [
    { label: "Currently", value: "Engineering preparatory student in Tunisia & prospective Electrical & Electronic Engineering candidate." },
    { label: "Exploring", value: "Semiconductors, microchips, mechatronics, and industrial IoT systems." },
    { label: "Recent highlight", value: "Ranked 285th of 11,350 students nationally (top 2.51%) in the Tunisian Technical Baccalaureate with Highest Honors (Mention Très Bien, 17.05 / 20)." },
    { label: "Experience", value: "Industrial IoT R&D, hardware repair & custom PC micro-business, commercial brand photography, and e-commerce." },
    { label: "Leadership", value: "Founded F1 Sahel Community (scaled from 2 members to 90-person events) & member of Rotary Sidi Bou Said Le Baron." },
    { label: "Looking for", value: "Top undergraduate engineering programs (NTU Singapore, TUM, ETH Zurich, EPFL) & technical opportunities." },
  ];

  return (
    <div ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 580, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px 36px 28px", boxShadow: "0 24px 64px -12px rgba(0,0,0,0.5)" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, lineHeight: 1 }}>✕</button>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cobalt)", marginBottom: 8 }}>THE 30-SECOND VERSION</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 24, letterSpacing: "-0.025em" }}>Hi, I&apos;m Hamza.</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {rows.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ minWidth: 130, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", paddingTop: 2, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)", borderLeft: "1px solid var(--border)", paddingLeft: 12 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <a href="#contact" onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 10, backgroundColor: "var(--cobalt)", color: "#fff", fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>
            Get in touch
          </a>
          <a href="/cv-hamza-ben-tekaya.pdf" download="Hamza_Ben_Tekaya_CV.pdf" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)", textDecoration: "none" }}>
            ↓ Download CV · PDF
          </a>
        </div>
        <p style={{ marginTop: 20, fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic" }}>You can have the other 12 seconds back.</p>
      </div>
    </div>
  );
}

// ─── NavBar ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "About me", href: "#about" },
  { label: "Academics", href: "#academics" },
  { label: "Professional experiences", href: "#experience" },
  { label: "Projects & Skills", href: "#projects" },
  { label: "Interests", href: "#interests" },
];

function NavBar() {
  const { dark, toggle } = useDarkMode();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: scrolled ? "var(--bg)" : "transparent",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      transition: "background-color 0.2s, border-color 0.2s",
    }}>
      <nav style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Brand */}
        <a href="#" style={{ display: "flex", flexDirection: "column", textDecoration: "none", lineHeight: 1.2 }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "0.04em", color: "var(--text-primary)" }}>
            H<span style={{ color: "var(--cobalt)" }}>B</span>T
          </span>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>Engineering student</span>
        </a>

        {/* Desktop center links */}
        {!isMobile && (
          <ul style={{ display: "flex", alignItems: "center", gap: 24, listStyle: "none", margin: 0, padding: 0 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cobalt)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isMobile && (
            <>
              <a href="/cv-hamza-ben-tekaya.pdf" download="Hamza_Ben_Tekaya_CV.pdf" target="_blank" rel="noopener noreferrer" style={{ padding: "7px 15px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em", backgroundColor: "var(--cobalt-bg)", color: "var(--cobalt)", border: "1px solid var(--cobalt-border)", textDecoration: "none", transition: "opacity 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                ↓ Download CV
              </a>
              <a href="#contact" style={{ padding: "7px 15px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em", backgroundColor: "var(--amber-bg)", color: "var(--amber)", border: "1px solid var(--amber-border)", textDecoration: "none", transition: "opacity 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                Contact
              </a>
            </>
          )}
          <button onClick={toggle} aria-label="Toggle dark mode" style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--tag-bg)", color: "var(--amber)", border: "1px solid var(--border)", cursor: "pointer" }}>
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" /><path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11 3.05 3.05" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 10.5A7 7 0 0 1 5.5 2.5a5.5 5.5 0 1 0 8 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--tag-bg)", color: "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer" }}>
              {menuOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)", padding: "14px 24px 20px" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} onClick={() => setMenuOpen(false)} style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none" }}>
                  {label}
                </a>
              </li>
            ))}
            <li style={{ marginTop: 6, display: "flex", gap: 10 }}>
              <a href="/cv-hamza-ben-tekaya.pdf" download="Hamza_Ben_Tekaya_CV.pdf" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, backgroundColor: "var(--cobalt-bg)", color: "var(--cobalt)", border: "1px solid var(--cobalt-border)", textDecoration: "none" }}>↓ CV</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, backgroundColor: "var(--amber-bg)", color: "var(--amber)", border: "1px solid var(--amber-border)", textDecoration: "none" }}>Contact</a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<string | null>(null);
  const [activeInterest, setActiveInterest] = useState<string | null>(null);

  const handleMilestoneToggle = (id: string) => {
    setActiveMilestone((prev) => (prev === id ? null : id));
  };

  const container: React.CSSProperties = { maxWidth: 1024, margin: "0 auto", padding: "0 24px" };

  return (
    <>
      <NavBar />
      {modalOpen && <ThirtySecondModal onClose={() => setModalOpen(false)} />}

      <main style={{ ...container, paddingTop: 110, paddingBottom: 96 }}>

        {/* ══════ HERO ══════ */}
        <section style={{ marginBottom: 96 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 36, flexWrap: "wrap-reverse" }}>
            <div style={{ flex: "1 1 480px" }}>
              {/* Eyebrow */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "var(--cobalt-bg)", color: "var(--cobalt)", border: "1px solid var(--cobalt-border)", marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--cobalt)", boxShadow: "0 0 8px var(--cobalt)" }} />
                From Dreaming About Engineering to Realising It
              </div>

              <h1 style={{ fontSize: "clamp(2.4rem, 5.5vw, 3.2rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, color: "var(--text-primary)" }}>
                Hamza Ben Tekaya
              </h1>

              <p style={{ marginTop: 18, maxWidth: 580, fontSize: 15.5, lineHeight: 1.8, color: "var(--text-secondary)" }}>
                Prospective{" "}
                <strong style={{ color: "var(--cobalt)" }}>Electrical &amp; Electronic Engineering</strong>{" "}
                student specializing in Semiconductors, Microchips &amp; Mechatronics. Graduated with{" "}
                <strong style={{ color: "var(--amber)" }}>Highest Honors (Mention Très Bien, 17.05 / 20)</strong> — ranked{" "}
                <strong style={{ color: "var(--amber)" }}>285th of 11,350</strong> nationally.
              </p>

              {/* Action buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28, alignItems: "center" }}>
                <a href="#about" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 11, fontSize: 14, fontWeight: 700, backgroundColor: "var(--text-primary)", color: "var(--bg)", textDecoration: "none", transition: "opacity 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  Who am I?
                </a>
                <a href="/cv-hamza-ben-tekaya.pdf" download="Hamza_Ben_Tekaya_CV.pdf" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 11, fontSize: 14, fontWeight: 700, backgroundColor: "transparent", color: "var(--text-primary)", border: "1.5px solid var(--border)", textDecoration: "none", transition: "border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--cobalt)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                  ↓ Download my CV
                </a>
                <button onClick={() => setModalOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--text-muted)", textDecoration: "underline", textDecorationStyle: "dashed", textUnderlineOffset: 3, padding: 0, fontFamily: "inherit" }}>
                  Short on time? The 30-second version
                </button>
              </div>
            </div>

            {/* Portrait */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ position: "relative", width: 148, height: 174, borderRadius: 20, overflow: "hidden", border: "2px solid var(--amber-border)", backgroundColor: "var(--bg-card)", boxShadow: "0 20px 48px -10px rgba(0,0,0,0.3), 0 0 24px var(--amber-bg)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/photos/profile.jpg" alt="Hamza Ben Tekaya" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%", display: "block" }} />
              </div>
            </div>
          </div>

          {/* Topic pillars */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginTop: 36, padding: "12px 18px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, fontSize: 12.5, fontWeight: 600 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Topic Pillars:</span>
            {[
              { label: "Engineering & Hardware", color: "var(--cobalt)" },
              { label: "Academic Distinctions", color: "var(--amber)" },
              { label: "Motorsport & Ventures", color: "var(--crimson)" },
              { label: "Discipline & Fitness", color: "var(--teal)" },
            ].map(({ label, color }) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, color }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                {label}
              </span>
            ))}
          </div>

          {/* Key metric cards */}
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { value: "17.05", label: "Bac Score / 20", category: "Academic Distinction", color: "var(--amber)" },
              { value: "Highest Honors", label: "Baccalaureate Distinction", category: "Academic Distinction", color: "var(--amber)" },
              { value: "C1", label: "English (TOEFL iBT)", category: "Global Engineering", color: "var(--cobalt)" },
              { value: "Sousse", label: "Tunisia", category: "Regional Roots", color: "var(--crimson)" },
            ].map(({ value, label, category, color }) => (
              <div key={label} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: color }} />
                <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0, letterSpacing: "-0.02em" }}>{value}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{label}</p>
                <p style={{ fontSize: 10.5, fontWeight: 500, color: "var(--text-muted)", marginTop: 2 }}>{category}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ 01 — ABOUT ME ══════ */}
        <section id="about" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <EyebrowLabel color="var(--cobalt)">01 — About Me</EyebrowLabel>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)", marginBottom: 32 }}>
            An aspiring Electrical &amp; Electronic engineer
          </h2>

          <div style={{ display: "flex", gap: 36, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Bio */}
            <div style={{ flex: "1 1 420px" }}>
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px" }}>
                <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--text-secondary)", margin: 0 }}>
                  Prospective <strong style={{ color: "var(--cobalt)" }}>Electrical &amp; Electronic Engineering</strong> student specializing in Semiconductors, Microchips &amp; Mechatronics. Tunisian Technical Baccalaureate graduate with Highest Honors (Mention Très Bien, 17.05 / 20). Engineering-minded builder ranked <strong style={{ color: "var(--amber)" }}>285th of 11,350 students nationally (top 2.51%)</strong> in Tunisia&apos;s Technical Baccalaureate, with a 17.05 average. Designs and builds real systems: an Arduino irrigation controller, repaired phones and laptops, and custom PCs, while also founding a Formula 1 community that grew from 2 members to 90-person events and shooting photography for 3 brands. Combines technical depth with leadership, entrepreneurship, and visual communication. Seeking a place in a top engineering program to turn hands-on problem solving into scalable solutions.
                </p>
              </div>
            </div>

            {/* Portrait card — desktop sidebar */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ width: 160, borderRadius: 18, overflow: "hidden", border: "2px solid var(--amber-border)", backgroundColor: "var(--bg-card)", boxShadow: "0 16px 40px -8px rgba(0,0,0,0.25)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/photos/profile.jpg" alt="Hamza Ben Tekaya — portrait" style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "center 10%" }} />
              </div>
            </div>
          </div>
        </section>

        {/* ══════ 02 — ACADEMICS ══════ */}
        <section id="academics" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <EyebrowLabel color="var(--amber)">02 — Academics</EyebrowLabel>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)", marginBottom: 32 }}>
            An academic background built around excellence
          </h2>

          <div style={{ borderLeft: "1.5px solid var(--amber-border)", marginLeft: 5 }}>
            {/* Newest to oldest */}
            <TimelineCard
              id="acad-bac"
              activeId={activeMilestone}
              onToggle={handleMilestoneToggle}
              period="2026"
              title="Technical Baccalaureate Distinction"
              institution="Sousse Pioneer High School (Lycée Pilote de Sousse) — Technical Stream"
              accentColor="var(--amber)"
              highlight="285th / 11,350 · Top 2.51% · 17.05 / 20 · Highest Honors (Mention Très Bien)"
              description={<>Followed the engineering-focused <strong style={{ color: "var(--amber)" }}>Technical Stream</strong> in high school and graduated in the top 2.51% nationally — 285th of 11,350 students — with an overall average of <strong style={{ color: "var(--amber)" }}>17.05 / 20</strong>, earning the distinction of <strong>Highest Honors (Mention Très Bien)</strong>.</>}
              tags={["Technical Baccalaureate", "Highest Honors", "Top 2.51% Nationally"]}
            />
            <TimelineCard
              id="acad-pioneer-school"
              activeId={activeMilestone}
              onToggle={handleMilestoneToggle}
              period="2022 – 2026"
              title="Sousse Pioneer Middle & High School"
              institution="Tunisia's most competitive & selective public educational system"
              accentColor="var(--amber)"
              description="Completed both middle and high school in Tunisia's most competitive and selective public educational system — the elite Pioneer Schools network (Lycée Pilote de Sousse). Admitted in 2022 via the national Pioneer Entrance Exam (15.71 / 20)."
              tags={["Sousse Pioneer High School", "Pioneer Entrance Exam", "Pioneer Schools"]}
            />
            <TimelineCard
              id="acad-pioneer-exam"
              activeId={activeMilestone}
              onToggle={handleMilestoneToggle}
              period="End of Primary School"
              title="National Pioneer Entrance Exam"
              institution="Competitive National Entrance Exam for Pioneer Schools"
              accentColor="var(--amber)"
              description="At the end of primary school, took on and passed Tunisia's highly selective national examination assessing academic excellence, earning admission to the Sousse Pioneer School network."
              tags={["Pioneer Entrance Exam", "National Exam", "Academic Distinction"]}
            />
            <TimelineCard
              id="acad-stem-math"
              activeId={activeMilestone}
              onToggle={handleMilestoneToggle}
              period="Grades 6 & 7"
              title="Early STEM & Mathematical Foundations"
              institution="Kangaroo Mathematics Competition"
              accentColor="var(--amber)"
              description="Passionate about science and mathematics from an early age. Competed in the international Kangaroo Mathematics Competition in both grades 6 and 7."
              tags={["Kangaroo Mathematics Competition", "Mathematics", "STEM", "Mathematical Foundations"]}
            />
          </div>
        </section>

        {/* ══════ 03 — PROFESSIONAL EXPERIENCES ══════ */}
        <section id="experience" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <EyebrowLabel color="var(--cobalt)">03 — Professional Experiences</EyebrowLabel>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)", marginBottom: 32 }}>
            Building, repairing, founding, and shipping real things
          </h2>

          <div style={{ borderLeft: "1.5px solid var(--cobalt-border)", marginLeft: 5 }}>
            <TimelineCard
              id="exp-iot"
              activeId={activeMilestone}
              onToggle={handleMilestoneToggle}
              period="2026 – Present"
              title="Industrial IoT & Predictive Maintenance System"
              institution="Family Brick Factory — R&D"
              accentColor="var(--cobalt)"
              description={<>Conducting technical research and system architecture to equip brick transport wagons with <strong style={{ color: "var(--cobalt)" }}>embedded electronic cards</strong> and strategically placed factory sensors. Tracks start timestamps, cycle counts, operating duration, and wagon references over a <strong style={{ color: "var(--cobalt)" }}>local network</strong> connected to a central laptop — allowing technicians to look up any wagon reference directly from a mobile phone to streamline maintenance scheduling and reduce unplanned downtime.</>}
              tags={["IoT", "Embedded Systems", "Predictive Maintenance", "Arduino", "Local Network", "R&D"]}
            />
            <TimelineCard
              id="exp-misterio"
              activeId={activeMilestone}
              onToggle={handleMilestoneToggle}
              period="2026 – Present"
              title="Founder & Operator — Ell-Misterio"
              institution="Online Curated Mystery Football Jersey Brand — Tunisia"
              accentColor="var(--crimson)"
              description="Founded and operate an online curated mystery football jersey brand serving the Tunisian market. Oversees product sourcing and curation, brand identity, and customer-facing operations."
              tags={["E-commerce", "Founder", "Brand", "Football"]}
            />
            <TimelineCard
              id="exp-repair"
              activeId={activeMilestone}
              onToggle={handleMilestoneToggle}
              period="2025 – Present"
              title="Founder — Phone, Laptop & Console Repair Micro-Business"
              institution="Sousse, Tunisia · Self-Employed"
              accentColor="var(--cobalt)"
              description="Sourced damaged phones, laptops, and gaming consoles; performed diagnostics, component-level repairs (collaborating with specialist technicians where needed), and resold at a profit. Built a small self-employed repair and refurbishment operation."
              tags={["Hardware Repair", "Electronics", "Console Refurbishment", "Diagnostics", "Self-Employed"]}
            />
            <TimelineCard
              id="exp-photo"
              activeId={activeMilestone}
              onToggle={handleMilestoneToggle}
              period="2024 – Present"
              title="Freelance Brand Photographer"
              institution="Canon EOS 250D · @7amza_bt_photography"
              accentColor="var(--teal)"
              link="https://www.instagram.com/7amza_bt_photography/"
              linkLabel="@7amza_bt_photography on Instagram"
              description={<>Active photographer shooting with a <strong>Canon EOS 250D</strong>, editing in Adobe Lightroom. Covered major events at Sousse Pioneer High School and produced commercial photography for <strong>3 clothing brands</strong>.</>}
              tags={["Photography", "Adobe Lightroom", "Canon EOS 250D", "Commercial", "Brand Visuals"]}
            />
            <TimelineCard
              id="exp-bks"
              activeId={activeMilestone}
              onToggle={handleMilestoneToggle}
              period="Recurring Summers"
              title="Summer Intern — BKS"
              institution="Industrial Internship · Sousse, Tunisia"
              accentColor="var(--cobalt)"
              description="Completed recurring summer internship at BKS, gaining industrial exposure to on-site engineering operations, production workflows, and factory environments."
              tags={["Industrial Intern", "BKS", "Engineering", "Factory"]}
            />
          </div>
        </section>

        {/* ══════ 04 — PROJECTS & LEADERSHIP ══════ */}
        <section id="projects" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <EyebrowLabel color="var(--cobalt)">04 — Projects &amp; Leadership</EyebrowLabel>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)", marginBottom: 32 }}>
            Engineering projects, community building, and creative ventures
          </h2>

          {/* Engineering Projects */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cobalt)" }}>Engineering Projects</span>
            </div>
            <div style={{ borderLeft: "1.5px solid var(--cobalt-border)", marginLeft: 5 }}>
              <TimelineCard
                id="proj-irrigation"
                activeId={activeMilestone}
                onToggle={handleMilestoneToggle}
                period="2024"
                title="Automated Smart Irrigation System"
                institution="High School Engineering Project"
                accentColor="var(--cobalt)"
                description={<>Designed and built a smart irrigation system using an <strong style={{ color: "var(--cobalt)" }}>Arduino microcontroller</strong>, temperature and humidity sensors, and a <strong style={{ color: "var(--cobalt)" }}>Bluetooth module</strong> for remote smartphone control. Implemented automated watering logic based on live sensor readings.</>}
                tags={["Arduino", "IoT", "Sensors", "Bluetooth", "Embedded C", "Engineering Project"]}
              />
              <TimelineCard
                id="proj-gomycode"
                activeId={activeMilestone}
                onToggle={handleMilestoneToggle}
                period="GoMyCode Training"
                title="Software & Game Development"
                institution="GoMyCode"
                accentColor="var(--cobalt)"
                description={<>Completed hands-on coding training, building a <strong style={{ color: "var(--cobalt)" }}>Flappy Bird-style game</strong> and a <strong style={{ color: "var(--cobalt)" }}>mobile application</strong> from scratch, covering core programming logic, UI design, and project structure.</>}
                tags={["Game Development", "Mobile App", "Programming", "GoMyCode", "Software"]}
              />
            </div>
          </div>

          {/* Leadership */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, marginTop: 32 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--crimson)" }}>Leadership</span>
            </div>
            <div style={{ borderLeft: "1.5px solid var(--crimson-border)", marginLeft: 5 }}>
              <TimelineCard
                id="lead-rotary"
                activeId={activeMilestone}
                onToggle={handleMilestoneToggle}
                period="2026 – Ongoing"
                title="Member — Rotary Sidi Bou Said Le Baron"
                institution="Rotary International Club · Tunisia"
                accentColor="var(--crimson)"
                description="Active member of Rotary Sidi Bou Said Le Baron, participating in community service and professional development initiatives in Tunisia."
                tags={["Rotary", "Leadership", "Community"]}
              />
              <TimelineCard
                id="lead-f1sahel"
                activeId={activeMilestone}
                onToggle={handleMilestoneToggle}
                period="Feb 2024 – Present"
                title="Founder — F1 Sahel Community"
                institution="Regional Formula 1 Motorsport Community"
                accentColor="var(--crimson)"
                link="https://www.instagram.com/f1sahel/"
                linkLabel="@f1sahel on Instagram"
                description={<>Founded and lead a regional Formula 1 motorsport community, organising race weekend watch parties and fan events across the Sahel region. Scaled from <strong style={{ color: "var(--crimson)" }}>2 founding members to 90-person events</strong>. Completing legal registration to establish it as an official registered club.</>}
                tags={["Founder", "Leadership", "Formula 1", "F1", "Community", "Event Organisation", "Motorsport"]}
              />
              <TimelineCard
                id="lead-artclub"
                activeId={activeMilestone}
                onToggle={handleMilestoneToggle}
                period="2 Years"
                title="Media Head — Art Club, Sousse Pioneer High School"
                institution="Sousse Pioneer High School"
                accentColor="var(--crimson)"
                description="Led the media and visual communications arm of the school's Art Club for 2 years, overseeing photography, visual content, and event coverage for school exhibitions and activities."
                tags={["Leadership", "Photography", "Media", "Art Club", "Visual Communication"]}
              />
            </div>
          </div>
        </section>

        {/* ══════ 05 — SKILLS & LANGUAGES ══════ */}
        <section id="skills" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <EyebrowLabel color="var(--cobalt)">05 — Skills &amp; Languages</EyebrowLabel>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)", marginBottom: 32 }}>
            Technical proficiencies and certified language competencies
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
            <SkillGroup category="Engineering & Technical" dotColor="var(--cobalt)" items={["Digital Logic Design", "CNC G-Code Programming", "3D CAD (SolidWorks)", "Arduino Prototyping", "Mechanical Engineering", "Embedded Systems", "PCB Concepts"]} />
            <SkillGroup category="Software & Programming" dotColor="var(--cobalt)" items={["Python", "Programming", "Game Development", "Mobile App Development"]} />
            <SkillGroup category="Hardware & Repair" dotColor="var(--cobalt)" items={["PC Hardware Assembly", "PC Diagnostics", "Electronics Repair", "Console Refurbishment", "Smartphone Diagnostics"]} />
            <SkillGroup category="Creative & Photography" dotColor="var(--teal)" items={["Adobe Lightroom", "Photography", "Brand Visuals", "Event Coverage", "Commercial Photography"]} />
          </div>

          {/* Languages */}
          <div style={{ marginTop: 36, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Dot color="var(--cobalt)" />
              <h3 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>Languages &amp; Certifications</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
              {[
                { lang: "Arabic", level: "Native", cert: undefined, badgeColor: "var(--teal)" },
                { lang: "French", level: "Fluent", cert: undefined, badgeColor: "var(--teal)" },
                { lang: "English", level: "C1", cert: "TOEFL iBT — 2026", badgeColor: "var(--cobalt)" },
                { lang: "German", level: "A2 → studying B1", cert: "ÖSD Certified — 2026", badgeColor: "var(--amber)" },
              ].map(({ lang, level, cert, badgeColor }) => (
                <div key={lang} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ marginTop: 6, width: 7, height: 7, borderRadius: "50%", backgroundColor: badgeColor, boxShadow: `0 0 6px ${badgeColor}`, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 14 }}>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{lang}</span>
                      {" "}<span style={{ color: badgeColor, fontWeight: 700 }}>{level}</span>
                    </p>
                    {cert && <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: "var(--text-muted)" }}>{cert}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ 06 — INTERESTS & PERSONAL ATLAS ══════ */}
        <section id="interests" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <EyebrowLabel color="var(--teal)">06 — Interests &amp; Personal Atlas</EyebrowLabel>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)", marginBottom: 32 }}>
            Sport, creativity, and the countries I&apos;ve visited
          </h2>

          {/* Interests grid — newest to oldest */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 48 }}>
            {[
              {
                period: "2024 – Present",
                title: "Strength Training & Fitness",
                desc: "Consistent gym and strength training since age 17. Discipline is a core daily practice.",
                color: "var(--teal)",
                tags: ["Fitness", "Strength Training", "Discipline", "Gym"],
              },
              {
                period: "2013 – 2023",
                title: "Competitive Youth Football",
                desc: "Trained in a football academy from age 6 to 16 (10 years). Won 2 championships and finished runner-up once in school tournaments.",
                color: "var(--crimson)",
                tags: ["Football", "Academy", "Team Sport", "Championships"],
              },
              {
                period: "2015 – 2019",
                title: "Painting & Fine Arts",
                desc: "Attended a painting club for 3 years. Paintings exhibited at both middle school and high school exhibitions.",
                color: "var(--teal)",
                tags: ["Fine Arts", "Painting", "Sketching"],
              },
              {
                period: "Primary School",
                title: "Gymnastics, LEGO Technic & Kangaroo Mathematics Competition",
                desc: "Practiced gymnastics, built LEGO Technic sets obsessively, and competed in the international Kangaroo Mathematics Competition.",
                color: "var(--amber)",
                tags: ["Gymnastics", "LEGO Technic", "Kangaroo Mathematics Competition", "Mathematical Foundations"],
              },
            ].map(({ period, title, desc, color, tags }) => {
              const isSelected = activeInterest === title;
              return (
                <div
                  key={title}
                  onClick={() => setActiveInterest((prev) => (prev === title ? null : title))}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: isSelected ? `1.5px solid ${color}` : "1px solid var(--border)",
                    borderRadius: 16,
                    padding: isSelected ? "24px 26px" : "22px 24px",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    transform: isSelected ? "scale(1.015)" : "scale(1)",
                    boxShadow: isSelected
                      ? `0 14px 32px -6px rgba(0,0,0,0.12), 0 0 16px ${color}20`
                      : "none",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: color }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color }}>{period}</span>
                    {isSelected && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color, padding: "1px 7px", borderRadius: 999, backgroundColor: "var(--tag-bg)", border: `1px solid ${color}40` }}>
                        Focused
                      </span>
                    )}
                  </div>
                  <h3 style={{ marginTop: 8, fontSize: isSelected ? 16 : 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.35 }}>{title}</h3>
                  <p style={{ marginTop: 8, fontSize: isSelected ? 14 : 13.5, lineHeight: 1.75, color: "var(--text-secondary)" }}>{desc}</p>
                  <TagRow tags={tags} />
                </div>
              );
            })}
          </div>

          {/* World Atlas */}
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <WorldAtlas />
          </div>
        </section>

        {/* ══════ 07 — CONTACT ══════ */}
        <section id="contact" style={{ marginBottom: 56, scrollMarginTop: 72 }}>
          <EyebrowLabel color="var(--amber)">07 — Contact</EyebrowLabel>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)", marginBottom: 32 }}>
            Let&apos;s connect
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {/* Direct contact */}
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--amber-bg)", color: "var(--amber)", fontSize: 14 }}>✉</span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)" }}>Direct Contact</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="mailto:hamzabentekaya2007@gmail.com" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--amber)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-primary)")}>
                  hamzabentekaya2007@gmail.com
                </a>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--crimson)", fontSize: 13 }}>◎</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Sousse, Tunisia</span>
                </div>
              </div>
            </div>

            {/* CV download */}
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--cobalt-border)", borderRadius: 16, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--cobalt-bg)", color: "var(--cobalt)", fontSize: 14 }}>↓</span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cobalt)" }}>Curriculum Vitae</span>
              </div>
              <a href="/cv-hamza-ben-tekaya.pdf" download="Hamza_Ben_Tekaya_CV.pdf" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, backgroundColor: "var(--cobalt)", color: "#fff", fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                ↓ Download CV · PDF
              </a>
            </div>

            {/* Photography */}
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--teal-bg)", color: "var(--teal)", fontSize: 14 }}>📷</span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal)" }}>Photography</span>
              </div>
              <a href="https://www.instagram.com/7amza_bt_photography/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600, color: "var(--teal)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                @7amza_bt_photography
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 2.5h7v7M2.5 9.5 9.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </a>
              <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>Canon EOS 250D · Adobe Lightroom</p>
            </div>

            {/* F1 Sahel */}
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--crimson-bg)", color: "var(--crimson)", fontSize: 14 }}>🏎</span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--crimson)" }}>F1 Sahel Community</span>
              </div>
              <a href="https://www.instagram.com/f1sahel/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600, color: "var(--crimson)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                @f1sahel
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 2.5h7v7M2.5 9.5 9.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </a>
              <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>Motorsport Community · Sahel, Tunisia</p>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "22px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12.5, color: "var(--text-muted)" }}>
          <span>© 2026 Hamza Ben Tekaya</span>
          <span style={{ color: "var(--cobalt)" }}>Sousse, Tunisia · Engineering Student</span>
        </div>
      </footer>
    </>
  );
}
