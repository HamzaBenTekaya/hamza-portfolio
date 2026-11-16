"use client";

import { useEffect, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────
type NavLink = { label: string; href: string };

// ─── Constants ─────────────────────────────────────────────────────────────
const NAV_LINKS: NavLink[] = [
  { label: "Academic", href: "#academic" },
  { label: "Active",   href: "#active" },
  { label: "Past",     href: "#past" },
  { label: "Skills",   href: "#skills" },
  { label: "Contact",  href: "#contact" },
];

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

// ─── Cohesive Topic-Based Color System ─────────────────────────────────────
// 1. ⚡ ENGINEERING & SILICON (Cyan): Electrical, Semiconductors, Microchips, Mechatronics, IoT, Hardware, Python, CAD
// 2. 🏆 ACADEMIC EXCELLENCE (Gold): Baccalauréat 17.05, Mention Très Bien, Lycée Pilote, Concours, Prep Cycle
// 3. 🏁 MOTORSPORT, VENTURES & MEDIA (Coral): F1 Sahel, Ell-Misterio, Photography, Football Championships
// 4. 🌿 DISCIPLINE & WELLNESS (Emerald): Fitness, Strength Training, Active Status
function getTagStyles(label: string): React.CSSProperties {
  // 🏆 1. Academic Honors & Elite Schooling — Prestige Gold
  if (
    /Mention|Baccalauréat|Concours|Kangourou|Très Bien|Pilote|Élites|Preparatoire|Préparatoire|IPEIM|Orientation|Scholarship/i.test(label)
  ) {
    return {
      backgroundColor: "var(--gold-bg)",
      color: "var(--gold)",
      border: "1px solid var(--gold-border)",
    };
  }

  // ⚡ 2. Engineering, Semiconductors, Hardware & Software — Electric Cyan
  if (
    /Electrical|Electronic|Semiconductor|Microchip|Mechatronic|IoT|Embedded|Arduino|Sensor|Bluetooth|PCB|Logic|Network|Maintenance|R&D|Hardware|Repair|Console|Diagnostics|Python|CAD|SolidWorks|G-Code|Mechanical|Programming|Game Development|Mobile App|GoMyCode/i.test(label)
  ) {
    return {
      backgroundColor: "var(--cyan-bg)",
      color: "var(--cyan)",
      border: "1px solid var(--cyan-border)",
    };
  }

  // 🏁 3. Motorsport, Ventures, Creative Media & Sports — Motorsport Coral
  if (
    /Formula 1|F1|Community|Founder|Leadership|Event|Misterio|E-commerce|Brand|Photo|Lightroom|Canon|Commercial|Visual|Football|Academy|Team Sport|Championship|Paint|Art|Sketch|Exhibition|Gymnastic/i.test(label)
  ) {
    return {
      backgroundColor: "var(--rose-bg)",
      color: "var(--rose)",
      border: "1px solid var(--rose-border)",
    };
  }

  // 🌿 4. Fitness & Discipline — Vibrant Emerald
  if (
    /Fitness|Strength|Training|Discipline|Gym/i.test(label)
  ) {
    return {
      backgroundColor: "var(--emerald-bg)",
      color: "var(--emerald)",
      border: "1px solid var(--emerald-border)",
    };
  }

  // Fallback neutral
  return {
    backgroundColor: "var(--tag-bg)",
    color: "var(--tag-text)",
    border: "1px solid var(--border)",
  };
}

function Tag({ label }: { label: string }) {
  const dynamicStyle = getTagStyles(label);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 11px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        ...dynamicStyle,
      }}
    >
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

function SectionLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      {color && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
            display: "inline-block",
          }}
        />
      )}
      <p style={{
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: color ?? "var(--text-muted)",
        margin: 0,
      }}>
        {children}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  accentColor,
  liveBadge,
}: {
  title: string;
  subtitle?: string;
  accentColor?: string;
  liveBadge?: string;
}) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <SectionLabel color={accentColor}>{title}</SectionLabel>
        {liveBadge && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "2px 9px",
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            backgroundColor: "var(--emerald-bg)",
            color: "var(--emerald)",
            border: "1px solid var(--emerald-border)",
          }}>
            <span style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: "var(--emerald)",
              boxShadow: "0 0 6px var(--emerald)",
            }} />
            {liveBadge}
          </span>
        )}
      </div>
      {subtitle && (
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function TimelineCard({
  period, title, institution, description, tags, link, linkLabel, highlight, accentColor,
}: {
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
  const dotColor = accentColor ?? "var(--text-primary)";

  return (
    <div style={{ position: "relative", paddingLeft: 28, paddingBottom: 36 }}>
      {/* Dot on the spine */}
      <span style={{
        position: "absolute",
        left: -5,
        top: 4,
        width: 10,
        height: 10,
        borderRadius: "50%",
        border: `2px solid ${dotColor}`,
        backgroundColor: "var(--bg)",
        boxShadow: `0 0 10px ${dotColor}50`,
        outline: "3px solid var(--bg)",
        display: "block",
        flexShrink: 0,
      }} />

      <div style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "20px 22px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}>
        {/* Period badge */}
        <span style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: accentColor ?? "var(--text-muted)",
        }}>
          {period}
        </span>

        <h3 style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
          {title}
        </h3>

        {institution && (
          <p style={{ marginTop: 2, fontSize: 13.5, fontWeight: 500, color: "var(--text-secondary)" }}>
            {institution}
          </p>
        )}

        {highlight && (
          <div style={{
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            backgroundColor: "var(--gold-bg)",
            color: "var(--gold)",
            border: "1px solid var(--gold-border)",
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}>
            <span style={{ color: "var(--gold)", fontSize: 14 }}>★</span> {highlight}
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
          {description}
        </div>

        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" style={{
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            fontWeight: 600,
            color: accentColor ?? "var(--cyan)",
            textDecoration: "none",
            opacity: 1,
            transition: "opacity 0.15s, transform 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {linkLabel ?? link}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 2.5h7v7M2.5 9.5 9.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
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
        {dotColor && (
          <span style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: dotColor,
            boxShadow: `0 0 6px ${dotColor}`,
          }} />
        )}
        <h3 style={{
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          margin: 0,
        }}>
          {category}
        </h3>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {items.map((s) => <Tag key={s} label={s} />)}
      </div>
    </div>
  );
}

function IconLink() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M2.5 2.5h7v7M2.5 9.5 9.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NavBar() {
  const { dark, toggle } = useDarkMode();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: scrolled ? "var(--bg)" : "transparent",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      transition: "background-color 0.2s, border-color 0.2s",
    }}>
      <nav style={{
        maxWidth: 896,
        margin: "0 auto",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo with Cyan engineering accent */}
        <a href="#" style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "var(--text-primary)",
          textDecoration: "none",
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "var(--cyan)",
            boxShadow: "0 0 10px var(--cyan)",
          }} />
          HBT
        </a>

        {/* Desktop nav links */}
        {!isMobile && (
          <ul style={{ display: "flex", alignItems: "center", gap: 26, listStyle: "none", margin: 0, padding: 0 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cyan)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Right: dark toggle + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={toggle} aria-label="Toggle dark mode" style={{
            width: 38, height: 38, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "var(--tag-bg)", color: "var(--gold)",
            border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s",
          }}>
            {dark ? (
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11 3.05 3.05" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13.5 10.5A7 7 0 0 1 5.5 2.5a5.5 5.5 0 1 0 8 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" style={{
              width: 38, height: 38, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "var(--tag-bg)", color: "var(--text-secondary)",
              border: "1px solid var(--border)", cursor: "pointer",
            }}>
              {menuOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          backgroundColor: "var(--bg)",
          borderTop: "1px solid var(--border)",
          padding: "12px 24px 20px",
        }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} onClick={() => setMenuOpen(false)} style={{
                  fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none",
                }}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Page() {
  const containerStyle: React.CSSProperties = {
    maxWidth: 896,
    margin: "0 auto",
    padding: "0 24px",
  };

  return (
    <>
      <NavBar />

      <main style={{ ...containerStyle, paddingTop: 112, paddingBottom: 96 }}>

        {/* ══════ HERO ══════ */}
        <section style={{ marginBottom: 88 }}>
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 36,
            flexWrap: "wrap-reverse",
          }}>
            <div style={{ flex: "1 1 480px" }}>
              {/* Engineering Identity Pill */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "3px 11px",
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.04em",
                backgroundColor: "var(--cyan-bg)",
                color: "var(--cyan)",
                border: "1px solid var(--cyan-border)",
                marginBottom: 16,
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "var(--cyan)",
                  boxShadow: "0 0 8px var(--cyan)",
                }} />
                ELECTRICAL &amp; ELECTRONIC ENGINEERING
              </div>

              <h1 style={{
                fontSize: "clamp(2.2rem, 5.5vw, 3rem)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.15,
                color: "var(--text-primary)",
              }}>
                Hamza Ben Tekaya
              </h1>

              <p style={{
                marginTop: 18,
                maxWidth: 620,
                fontSize: 15.5,
                lineHeight: 1.75,
                color: "var(--text-secondary)",
              }}>
                Prospective{" "}
                <strong style={{ color: "var(--cyan)" }}>Electrical &amp; Electronic Engineering</strong>{" "}
                student specializing in Semiconductors, Microchips &amp; Mechatronics. Tunisian Baccalauréat Technique graduate,{" "}
                <strong style={{ color: "var(--gold)" }}>Mention Très Bien (17.05 / 20)</strong>.
              </p>

              {/* Specialization tags (Core Engineering — Cyan) */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                {["Electrical & Electronic Engineering", "Semiconductors", "Microchips", "Mechatronics"].map(s => (
                  <Tag key={s} label={s} />
                ))}
              </div>
            </div>

            {/* Profile Portrait with Gold Distinction Rim */}
            <div style={{ flexShrink: 0 }}>
              <div style={{
                position: "relative",
                width: 140,
                height: 165,
                borderRadius: 22,
                overflow: "hidden",
                border: "2px solid var(--gold-border)",
                backgroundColor: "var(--bg-card)",
                boxShadow: "0 16px 36px -10px rgba(0, 0, 0, 0.25), 0 0 20px var(--gold-bg)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photos/profile.jpg"
                  alt="Hamza Ben Tekaya"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 18%",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Connected Topic Key Bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 32,
            padding: "10px 16px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Topic Pillars:
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--cyan)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--cyan)", boxShadow: "0 0 6px var(--cyan)" }} />
              Engineering &amp; Hardware
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--gold)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--gold)", boxShadow: "0 0 6px var(--gold)" }} />
              Academic Distinctions
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--rose)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--rose)", boxShadow: "0 0 6px var(--rose)" }} />
              Motorsport &amp; Ventures
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--emerald)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--emerald)", boxShadow: "0 0 6px var(--emerald)" }} />
              Discipline &amp; Fitness
            </span>
          </div>

          {/* Quick stat grid — Grouped by topic */}
          <div style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}>
            {[
              {
                value: "17.05",
                label: "Bac Score / 20",
                category: "Academic Distinction",
                color: "var(--gold)",
              },
              {
                value: "Très Bien",
                label: "Bac Mention",
                category: "Academic Distinction",
                color: "var(--gold)",
              },
              {
                value: "C1",
                label: "English (TOEFL iBT)",
                category: "Global Engineering",
                color: "var(--cyan)",
              },
              {
                value: "Sousse",
                label: "Tunisia",
                category: "Regional Roots",
                color: "var(--rose)",
              },
            ].map(({ value, label, category, color }) => (
              <div
                key={label}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "18px 20px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Top color indicator matching topic */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  backgroundColor: color,
                }} />
                <p style={{ fontSize: 22, fontWeight: 800, color: color, margin: 0, letterSpacing: "-0.02em" }}>
                  {value}
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>
                  {label}
                </p>
                <p style={{ fontSize: 10.5, fontWeight: 500, color: "var(--text-muted)", marginTop: 2 }}>
                  {category}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ 1. ACADEMIC CYCLE (All Gold Theme) ══════ */}
        <section id="academic" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <SectionHeader
            title="01 — Academic Cycle"
            subtitle="Complete academic journey from primary concours through elite pilot lycée and preparatory cycle."
            accentColor="var(--gold)"
          />
          <div style={{ borderLeft: "1.5px solid var(--gold-border)", marginLeft: 5, paddingLeft: 0 }}>
            <TimelineCard
              period="2007 – 2022"
              title="Primary & Preparatory Middle School"
              institution="Private Schooling & Les Élites Private Preparatory School"
              accentColor="var(--gold)"
              description={<>
                Completed primary and preparatory middle school in the private sector. In 2022, was{" "}
                <strong style={{ color: "var(--gold)" }}>admitted to the national Concours Pilote</strong> — a highly competitive national
                entrance examination for elite lycées pilotes — with a score of{" "}
                <strong style={{ color: "var(--gold)" }}>15.71 / 20</strong>, earning a place at Lycée Pilote de Sousse.
              </>}
              highlight="Concours Pilote — 15.71 / 20"
              tags={["Concours Pilote", "Private Schooling", "Les Élites"]}
            />
            <TimelineCard
              period="September 2022 – June 2026"
              title="Lycée Pilote de Sousse"
              institution="Secondary School — Baccalauréat Technique"
              accentColor="var(--gold)"
              description={<>
                Four-year programme at one of Tunisia&apos;s national elite pilot high schools. Graduated
                with the <strong>Tunisian Baccalauréat Technique</strong>, achieving a final grade of{" "}
                <strong style={{ color: "var(--gold)" }}>17.05 / 20</strong> — the distinction of{" "}
                <strong style={{ color: "var(--gold)" }}>Mention Très Bien</strong> (the highest honour).
              </>}
              highlight="Baccalauréat Technique — 17.05 / 20 — Mention Très Bien"
              tags={["Baccalauréat Technique", "Mention Très Bien", "Lycée Pilote"]}
            />
            <TimelineCard
              period="September 2026"
              title="Post-Baccalaureate Orientation — IPEIM Monastir"
              institution="Institut Préparatoire aux Études d'Ingénieurs de Monastir"
              accentColor="var(--gold)"
              description={<>
                Following graduation, was officially oriented to the{" "}
                <strong style={{ color: "var(--gold)" }}>Technology-Track Engineering Preparatory Cycle</strong> at IPEIM Monastir — a
                selective two-year preparatory programme for engineering schools. Attended initial classes
                before <strong>withdrawing registration</strong> to pursue international engineering studies
                in Electrical &amp; Electronic Engineering and Mechatronics abroad.
              </>}
              tags={["IPEIM Monastir", "Classe Préparatoire", "Technology Track", "Orientation"]}
            />
          </div>
        </section>

        {/* ══════ 2. ACTIVE NON-ACADEMIC (Topic-Color-Coded Cards) ══════ */}
        <section id="active" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <SectionHeader
            title="02 — Active R&D, Leadership & Ventures"
            subtitle="Current technical research, motorsport community leadership, and entrepreneurial ventures."
            accentColor="var(--cyan)"
            liveBadge="Live / Active"
          />
          <div style={{ borderLeft: "1.5px solid var(--timeline-line)", marginLeft: 5 }}>
            {/* Engineering Topic: Cyan */}
            <TimelineCard
              period="2026 – Present"
              title="Industrial IoT & Predictive Maintenance System"
              institution="Family Brick Factory — R&D"
              accentColor="var(--cyan)"
              description={<>
                Conducting technical research and system architecture to equip brick transport wagons with{" "}
                <strong style={{ color: "var(--cyan)" }}>embedded electronic cards</strong> and strategically placed factory sensors. The
                system tracks start timestamps, cycle counts, operating duration, and wagon references over
                a <strong style={{ color: "var(--cyan)" }}>local network</strong> connected to a central laptop — allowing technicians to look
                up any wagon reference directly from a <strong style={{ color: "var(--text-primary)" }}>mobile phone</strong> to streamline
                maintenance scheduling and reduce unplanned downtime.
              </>}
              tags={["IoT", "Embedded Systems", "Predictive Maintenance", "Arduino", "Local Network", "R&D"]}
            />

            {/* Motorsport & Leadership Topic: Rose */}
            <TimelineCard
              period="March 2024 – Present"
              title="Head & Founder — F1 Sahel Community"
              institution="Regional Formula 1 Motorsport Community"
              accentColor="var(--rose)"
              description={<>
                Founded and lead a regional Formula 1 motorsport community, organising race weekend watch
                parties and fan events across the Sahel region of Tunisia. Currently completing the legal
                registration and administrative procedures to establish it as an{" "}
                <strong style={{ color: "var(--rose)" }}>official registered club</strong>.
              </>}
              link="https://www.instagram.com/f1sahel/"
              linkLabel="@f1sahel on Instagram"
              tags={["Founder", "Leadership", "Formula 1", "Community", "Event Organisation"]}
            />

            {/* Ventures & Brand Topic: Rose */}
            <TimelineCard
              period="2026 – Present"
              title="Ell-Misterio"
              institution="Online Curated Mystery Football Jersey Brand — Tunisia"
              accentColor="var(--rose)"
              description={<>
                Founder &amp; operator of an online curated mystery football jersey brand targeting the
                Tunisian market. Oversees product curation, brand identity, and customer-facing operations.
              </>}
              tags={["E-commerce", "Founder", "Brand", "Football"]}
            />

            {/* Creative Media Topic: Rose */}
            <TimelineCard
              period="2024 – Present"
              title="Photography & Brand Visuals"
              institution="Freelance — Canon EOS 250D"
              accentColor="var(--rose)"
              description={<>
                Active photographer shooting with a <strong style={{ color: "var(--rose)" }}>Canon EOS 250D</strong>, editing in Adobe
                Lightroom. Covered major events at Lycée Pilote de Sousse and currently producing{" "}
                <strong style={{ color: "var(--text-primary)" }}>commercial shoots for clothing brands</strong>. Photography portfolio at{" "}
                <a
                  href="https://www.instagram.com/7amza_bt_photography/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--rose)", fontWeight: 600, textDecoration: "underline" }}
                >
                  @7amza_bt_photography
                </a>.{" "}
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Photo gallery coming soon.</span>
              </>}
              link="https://www.instagram.com/7amza_bt_photography/"
              linkLabel="@7amza_bt_photography"
              tags={["Photography", "Adobe Lightroom", "Canon EOS 250D", "Commercial", "Events"]}
            />

            {/* Electronics & Hardware Topic: Cyan */}
            <TimelineCard
              period="Ongoing"
              title="PC Hardware Building, Electronics & Console Refurbishment"
              accentColor="var(--cyan)"
              description={<>
                Custom-built and maintains a personal desktop workstation. Performs basic smartphone
                diagnostics and repairs. Sources <strong style={{ color: "var(--cyan)" }}>faulty gaming consoles and electronics</strong> to
                troubleshoot, repair (collaborating with specialist technicians where needed), and resell at
                a profit.
              </>}
              tags={["PC Hardware", "Electronics Repair", "Console Refurbishment", "Diagnostics"]}
            />

            {/* Fitness & Wellness Topic: Emerald */}
            <TimelineCard
              period="2024 – Present"
              title="Strength Training & Fitness"
              accentColor="var(--emerald)"
              description="Consistent gym and strength training since age 17. Training has been a core discipline since 2024."
              tags={["Fitness", "Strength Training", "Discipline"]}
            />
          </div>
        </section>

        {/* ══════ 3. PAST NON-ACADEMIC (Topic-Color-Coded Cards) ══════ */}
        <section id="past" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <SectionHeader
            title="03 — Past Projects, Training & Achievements"
            subtitle="Completed engineering projects, software training, athletic competitions, and fine arts."
            accentColor="var(--cyan)"
          />
          <div style={{ borderLeft: "1.5px solid var(--timeline-line)", marginLeft: 5 }}>
            {/* Engineering Topic: Cyan */}
            <TimelineCard
              period="2024"
              title="Automated Smart Irrigation System — Arrosoir Automatique"
              institution="High School Engineering Project"
              accentColor="var(--cyan)"
              description={<>
                Designed and built a smart irrigation system using an{" "}
                <strong style={{ color: "var(--cyan)" }}>Arduino microcontroller</strong>, temperature and humidity sensors, and a{" "}
                <strong style={{ color: "var(--cyan)" }}>Bluetooth module</strong> for remote smartphone control. Implemented automated
                watering logic based on live sensor readings.
              </>}
              tags={["Arduino", "IoT", "Sensors", "Bluetooth", "Embedded C", "Engineering Project"]}
            />

            {/* Software Engineering Topic: Cyan */}
            <TimelineCard
              period="GoMyCode Training"
              title="Software & Game Development Training"
              institution="GoMyCode"
              accentColor="var(--cyan)"
              description={<>
                Completed hands-on coding training, building a{" "}
                <strong style={{ color: "var(--cyan)" }}>Flappy Bird-style game</strong> and a{" "}
                <strong style={{ color: "var(--cyan)" }}>mobile application</strong> from scratch, covering core programming logic, UI
                design, and project structure.
              </>}
              tags={["Game Development", "Mobile App", "Programming", "GoMyCode"]}
            />

            {/* Athletics & Competitions Topic: Rose */}
            <TimelineCard
              period="2013 – 2023"
              title="Competitive Youth Football"
              institution="Football Academy — 10 Years"
              accentColor="var(--rose)"
              description={<>
                Trained in a football academy from age 6 to 16 (10 years). Competed in middle school and
                high school tournaments, winning <strong style={{ color: "var(--gold)" }}>2 championships</strong> and finishing{" "}
                <strong style={{ color: "var(--text-primary)" }}>runner-up</strong> once.
              </>}
              highlight="2× Champion + 1× Runner-Up"
              tags={["Football", "Academy", "Team Sport", "Championships"]}
            />

            {/* Creative Arts Topic: Rose */}
            <TimelineCard
              period="2015 – 2019 & School Exhibitions"
              title="Painting & Fine Arts"
              accentColor="var(--rose)"
              description={<>
                Attended a painting club for 3 years during childhood (2015–2019), continued sketching in
                sketchbooks, and had paintings{" "}
                <strong style={{ color: "var(--rose)" }}>exhibited at both middle school and lycée</strong> exhibitions.
              </>}
              tags={["Fine Arts", "Painting", "Sketching", "Exhibitions"]}
            />

            {/* Math Competition & Gymnastics: Gold / Rose */}
            <TimelineCard
              period="Primary School"
              title="Youth Gymnastics & Mathematics Competition"
              accentColor="var(--gold)"
              description={<>
                Practiced <strong>gymnastics</strong> during primary school years. Participated in the{" "}
                <strong style={{ color: "var(--gold)" }}>Kangaroo Mathematics Competition</strong> (Concours Kangourou) — an international
                problem-solving contest.
              </>}
              tags={["Gymnastics", "Mathematics", "Concours Kangourou"]}
            />
          </div>
        </section>

        {/* ══════ 4. SKILLS & LANGUAGES ══════ */}
        <section id="skills" style={{ marginBottom: 88, scrollMarginTop: 72 }}>
          <SectionHeader
            title="04 — Skills & Languages"
            subtitle="Technical proficiencies, engineering tools, and certified language competencies."
            accentColor="var(--cyan)"
          />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 28,
          }}>
            {/* Technical Groups: All Cyan (Related to Engineering & Hardware) */}
            <SkillGroup
              category="Engineering & Technical"
              items={["Digital Logic Design", "CNC G-Code Programming", "3D CAD (SolidWorks)", "Arduino Prototyping", "Mechanical Engineering", "Embedded Systems", "PCB Concepts"]}
              dotColor="var(--cyan)"
            />
            <SkillGroup
              category="Software & Programming"
              items={["Python"]}
              dotColor="var(--cyan)"
            />
            <SkillGroup
              category="Hardware & Repair"
              items={["PC Hardware Assembly", "PC Diagnostics", "Electronics Repair", "Console Refurbishment", "Smartphone Diagnostics"]}
              dotColor="var(--cyan)"
            />

            {/* Creative Media: Rose (Related to Photography & Visuals) */}
            <SkillGroup
              category="Creative & Media"
              items={["Adobe Lightroom", "Photography", "Brand Visuals"]}
              dotColor="var(--rose)"
            />
          </div>

          {/* Languages & Certifications */}
          <div style={{
            marginTop: 36,
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "24px 26px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                backgroundColor: "var(--emerald)", boxShadow: "0 0 6px var(--emerald)",
              }} />
              <h3 style={{
                fontSize: 11.5, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0,
              }}>
                Languages &amp; Certifications
              </h3>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}>
              {[
                { lang: "Arabic",  level: "Native",           cert: undefined,               badgeColor: "var(--emerald)" },
                { lang: "French",  level: "Fluent",           cert: undefined,               badgeColor: "var(--emerald)" },
                { lang: "English", level: "C1",               cert: "TOEFL iBT — 2026",      badgeColor: "var(--cyan)" },
                { lang: "German",  level: "A2 → studying B1", cert: "ÖSD Certified — 2026",  badgeColor: "var(--gold)" },
              ].map(({ lang, level, cert, badgeColor }) => (
                <div key={lang} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    marginTop: 6, width: 7, height: 7, borderRadius: "50%",
                    backgroundColor: badgeColor, boxShadow: `0 0 6px ${badgeColor}`, flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 14 }}>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{lang}</span>
                      {" "}
                      <span style={{ color: badgeColor, fontWeight: 700 }}>{level}</span>
                    </p>
                    {cert && (
                      <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: "var(--text-muted)" }}>{cert}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ 5. CONTACT & LINKS ══════ */}
        <section id="contact" style={{ marginBottom: 56, scrollMarginTop: 72 }}>
          <SectionHeader
            title="05 — Contact & Links"
            subtitle="Reach out directly or explore connected platforms and initiatives."
            accentColor="var(--gold)"
          />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}>
            {/* Direct Contact: Gold */}
            <div style={{
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "20px 22px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: "var(--gold-bg)", color: "var(--gold)", fontSize: 12,
                }}>
                  ✉
                </span>
                <SectionLabel color="var(--gold)">Direct Contact</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                <a href="mailto:hamzabentekaya2007@gmail.com" style={{
                  fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-primary)")}
                >
                  hamzabentekaya2007@gmail.com
                </a>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--rose)", fontSize: 13 }}>◎</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Sousse, Tunisia</span>
                </div>
              </div>
            </div>

            {/* Engineering Domains: Cyan */}
            <div style={{
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "20px 22px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: "var(--cyan-bg)", color: "var(--cyan)", fontSize: 12,
                }}>
                  🌐
                </span>
                <SectionLabel color="var(--cyan)">Domains</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {["hamzabentekaya.tn", "bentekaya.tn"].map(d => (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--cyan)", fontSize: 12 }}>→</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Creative Media: Rose */}
            <div style={{
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "20px 22px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: "var(--rose-bg)", color: "var(--rose)", fontSize: 12,
                }}>
                  📷
                </span>
                <SectionLabel color="var(--rose)">Photography</SectionLabel>
              </div>
              <a
                href="https://www.instagram.com/7amza_bt_photography/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontSize: 13.5, fontWeight: 600, color: "var(--rose)", textDecoration: "none",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                @7amza_bt_photography <IconLink />
              </a>
              <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
                Canon EOS 250D · Adobe Lightroom
              </p>
            </div>

            {/* Motorsport Community: Rose */}
            <div style={{
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "20px 22px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: "var(--rose-bg)", color: "var(--rose)", fontSize: 12,
                }}>
                  🏎️
                </span>
                <SectionLabel color="var(--rose)">F1 Sahel Community</SectionLabel>
              </div>
              <a
                href="https://www.instagram.com/f1sahel/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontSize: 13.5, fontWeight: 600, color: "var(--rose)", textDecoration: "none",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                @f1sahel <IconLink />
              </a>
              <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
                Motorsport Community · Sahel, Tunisia
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{
          ...containerStyle,
          paddingTop: 22,
          paddingBottom: 22,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          fontSize: 12.5,
          color: "var(--text-muted)",
        }}>
          <span>© 2026 Hamza Ben Tekaya</span>
          <span style={{ color: "var(--cyan)" }}>Sousse, Tunisia · hamzabentekaya.tn</span>
        </div>
      </footer>
    </>
  );
}
