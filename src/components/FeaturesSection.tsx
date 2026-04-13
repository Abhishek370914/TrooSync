"use client";

import { motion } from "framer-motion";
import {
  Eye, Globe, Zap, Layers, BarChart2, MessageSquare,
  Code2, RefreshCw, Shield, TrendingUp
} from "lucide-react";

const FEATURES = [
  { icon: Eye,          title: "Grok Vision Analysis",  desc: "AI reads your ad — tone, emotion, offer, CTA style — extracting everything that makes it convert.", color: "#00f5ff" },
  { icon: Globe,        title: "Live Page Fetching",       desc: "Paste any URL. We fetch the real HTML and audit every CRO element: headlines, CTAs, trust signals.", color: "#a855f7" },
  { icon: Zap,          title: "Personalized Copy",        desc: "Every headline, subheadline, and CTA is rewritten to match your ad's messaging and emotional tone.", color: "#f59e0b" },
  { icon: Layers,       title: "Side-by-Side Preview",     desc: "Compare original vs enhanced in real-time. Edit the enhanced version live with contenteditable.", color: "#10b981" },
  { icon: BarChart2,    title: "CRO Score & Analytics",    desc: "CRO score out of 100, predicted conversion lift %, and A/B test simulation with impact breakdown.", color: "#ff00ff" },
  { icon: MessageSquare,title: "AI Tweak Chat",            desc: '"Make the headline more urgent" — AI applies changes to the live preview instantly.', color: "#06b6d4" },
  { icon: Code2,        title: "Export Clean HTML",        desc: "Download the fully enhanced page as production-ready HTML for Webflow, Framer, or any CMS.", color: "#ec4899" },
  { icon: RefreshCw,    title: "3 AI Variants",            desc: "Grok generates 3 unique personalized versions. Pick the best or mix elements between them.", color: "#8b5cf6" },
  { icon: Shield,       title: "Edge Case Handling",       desc: "Broken URLs, blocked scrapers — handled gracefully with helpful error states and one-click retry.", color: "#6366f1" },
];

export default function FeaturesSection() {
  return (
    <section id="features" style={{ padding: "120px 32px", position: "relative" }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 1000, height: 600, borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(168,85,247,0.07) 0%,rgba(0,245,255,0.03) 50%,transparent 70%)",
        pointerEvents: "none", filter: "blur(60px)",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 9999, background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.18)", marginBottom: 20 }}
          >
            <TrendingUp size={13} color="#00f5ff" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#00f5ff", letterSpacing: "0.06em" }}>FULL FEATURE SET</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}
          >
            Everything you need to <span className="gradient-text">convert more</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto" }}
          >
            TrooSync combines AI vision, CRO science, and live editing into one seamless workflow.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -5, scale: 1.01 }}
              style={{
                padding: "28px 24px", borderRadius: 20,
                background: "linear-gradient(135deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "default", position: "relative", overflow: "hidden",
                transition: "box-shadow 0.3s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${f.color}18, 0 4px 24px rgba(0,0,0,0.3)`; (e.currentTarget as HTMLElement).style.borderColor = `${f.color}22`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                background: `linear-gradient(135deg,${f.color}18,${f.color}08)`,
                border: `1px solid ${f.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <f.icon size={20} color={f.color} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>{f.desc}</div>
              {/* Subtle bottom accent */}
              <div style={{
                position: "absolute", bottom: 0, left: 20, right: 20, height: 1,
                background: `linear-gradient(90deg,transparent,${f.color}30,transparent)`,
                opacity: 0, transition: "opacity 0.3s",
              }} className="feature-accent" />
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media(max-width:900px){ .features-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:600px){ .features-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
