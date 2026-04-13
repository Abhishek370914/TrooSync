"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

const BADGES = [
  { icon: Sparkles,    label: "AI Vision Analysis", color: "#00f5ff", rgb: "0,245,255" },
  { icon: Zap,         label: "CRO Optimized",      color: "#a855f7", rgb: "168,85,247" },
  { icon: TrendingUp,  label: "+42% Uplift",         color: "#ff00ff", rgb: "255,0,255" },
];

const STEPS = [
  { n: "01", t: "Upload Ad Creative",    d: "Image · Video · GIF · URL" },
  { n: "02", t: "Paste Landing Page URL", d: "Any public URL" },
  { n: "03", t: "AI Personalizes",       d: "Claude vision + CRO audit" },
  { n: "04", t: "Preview & Export",      d: "Side-by-side comparison" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        paddingTop: 88,
        /* NO overflow:hidden — that's what was clipping the badges */
      }}
    >
      {/* Canvas lives in its own clipping container */}
      <div style={{
        position: "absolute", inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        <HeroCanvas />
      </div>

      {/* Top vignette */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 180,
        background: "linear-gradient(to bottom, #04040f 30%, transparent)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Main hero content */}
      <div style={{
        position: "relative", zIndex: 2,
        flex: 1,
        maxWidth: 1200, margin: "0 auto", width: "100%",
        padding: "40px 40px 0",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 48, alignItems: "center",
      }} className="hero-grid">

        {/* ── LEFT: Copy ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          {/* "Powered by" badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 18px", borderRadius: 9999, width: "fit-content",
              background: "rgba(0,245,255,0.10)",
              border: "1.5px solid rgba(0,245,255,0.40)",
              boxShadow: "0 0 18px rgba(0,245,255,0.15)",
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#00f5ff",
              boxShadow: "0 0 8px #00f5ff",
              display: "inline-block",
              animation: "glow-pulse 1.5s ease-in-out infinite alternate",
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#00f5ff", letterSpacing: "0.06em" }}>
              POWERED BY GROK
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            style={{
              fontSize: "clamp(2.8rem, 5vw, 4.4rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "#ffffff",
              margin: 0,
            }}
          >
            Turn any ad into a
            <br />
            <span style={{
              background: "linear-gradient(125deg, #00f5ff 0%, #a855f7 45%, #ff00ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              perfectly matched
            </span>
            <br />
            landing page
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            style={{
              fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
              color: "rgba(255,255,255,0.60)",
              lineHeight: 1.75,
              maxWidth: 480, margin: 0,
            }}
          >
            Upload your ad creative, paste a landing page URL — TrooSync AI analyzes
            both and delivers a{" "}
            <span style={{ color: "#00f5ff", fontWeight: 700 }}>
              CRO-optimized, personalized version
            </span>{" "}
            in seconds.
          </motion.p>

          {/* ── CTA Buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}
          >
            {/* Primary CTA */}
            <motion.a
              href="#builder"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "15px 36px",
                borderRadius: 9999,
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
                textDecoration: "none",
                cursor: "pointer",
                /* Solid vibrant gradient — text must be white for max contrast */
                background: "linear-gradient(135deg, #06b6d4 0%, #7c3aed 50%, #db2777 100%)",
                color: "#ffffff",
                border: "none",
                boxShadow: "0 0 0 1.5px rgba(255,255,255,0.15), 0 8px 32px rgba(124,58,237,0.45), 0 4px 12px rgba(6,182,212,0.3)",
              }}
            >
              Start Personalizing Free
              <ArrowRight size={17} strokeWidth={2.5} />
            </motion.a>

            {/* Secondary CTA */}
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.5)" }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px",
                borderRadius: 9999,
                fontWeight: 600,
                fontSize: "1rem",
                textDecoration: "none",
                cursor: "pointer",
                background: "rgba(255,255,255,0.07)",
                color: "#ffffff",
                border: "1.5px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(12px)",
                transition: "border-color 0.2s",
              }}
            >
              See how it works
            </motion.a>
          </motion.div>

          {/* ── Feature Badges ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            {BADGES.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.1 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 18px", borderRadius: 9999,
                  background: `rgba(${b.rgb}, 0.18)`,
                  border: `1.5px solid rgba(${b.rgb}, 0.70)`,
                  boxShadow: `0 0 18px rgba(${b.rgb}, 0.25)`,
                }}
              >
                <b.icon size={14} color={b.color} strokeWidth={2.5} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                  {b.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Floating cards ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          style={{ position: "relative", height: 480 }}
        >
          {[
            { title: "AD CREATIVE", sub: "Vision Analyzed ✦", color: "#00f5ff", rgb: "0,245,255",   top: "22%", left: "5%",   delay: 4 },
            { title: "LANDING PAGE", sub: "CRO Audited ✦",    color: "#c084fc", rgb: "168,85,247",  top: "14%", right: "2%",  delay: 5 },
            { title: "AI ENHANCED",  sub: "+42% Conversion ✦",color: "#f472b6", rgb: "255,0,255",   bottom: "20%", left: "28%", delay: 3.5 },
          ].map((card: any) => (
            <motion.div
              key={card.title}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: card.delay, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: card.top, left: card.left, right: card.right, bottom: card.bottom,
                background: `rgba(${card.rgb}, 0.14)`,
                border: `1.5px solid rgba(${card.rgb}, 0.70)`,
                borderRadius: 16,
                padding: "14px 20px",
                backdropFilter: "blur(28px)",
                boxShadow: `0 0 28px rgba(${card.rgb}, 0.25)`,
              }}
            >
              <div style={{ fontSize: 10, color: card.color, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 4 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 13, color: "#ffffff", fontWeight: 500 }}>
                {card.sub}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── How-it-works Step Strip ── (static, below content, NOT absolute) */}
      <motion.div
        id="how-it-works"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
        style={{
          position: "relative", zIndex: 2,
          marginTop: 56,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(4,4,15,0.60)",
          backdropFilter: "blur(16px)",
          padding: "28px 40px",
          display: "flex", justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 32px", textAlign: "center" }}>
                {/* Number */}
                <span style={{
                  fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em",
                  background: "linear-gradient(90deg,#00f5ff,#38bdf8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {s.n}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginTop: 5, letterSpacing: "-0.01em" }}>
                  {s.t}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", marginTop: 3 }}>
                  {s.d}
                </span>
              </div>
              {i < 3 && (
                <span style={{ color: "rgba(255,255,255,0.20)", fontSize: 20, flexShrink: 0 }}>→</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <style>{`
        @media(max-width:768px){
          .hero-grid { grid-template-columns: 1fr !important; padding: 20px 24px 0 !important; }
          .hero-grid > div:last-child { display: none; }
        }
      `}</style>
    </section>
  );
}
