"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Demo", href: "#builder" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        height: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background 0.4s, border-color 0.4s",
        background: scrolled ? "rgba(4,4,15,0.88)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
      }}
    >
      {/* Logo */}
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "linear-gradient(135deg,#00f5ff,#a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 20px rgba(0,245,255,0.4)",
        }}>
          <Zap size={16} color="#000" fill="#000" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.03em" }} className="gradient-text">
          TrooSync
        </span>
      </a>

      {/* Desktop links */}
      <div className="nav-links" style={{ display: "flex", gap: 36, alignItems: "center" }}>
        {links.map(l => (
          <a key={l.label} href={l.href} style={{
            fontSize: 14, fontWeight: 500, letterSpacing: "0.01em",
            color: "rgba(255,255,255,0.58)",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.58)")}
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* CTA */}
      <a href="#builder" className="btn-primary" style={{ fontSize: 13, padding: "10px 22px" }}>
        Try Free <ArrowUpRight size={14} />
      </a>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="mob-menu"
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 4 }}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: "absolute", top: 68, left: 0, right: 0,
              background: "rgba(4,4,15,0.97)", borderBottom: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(24px)",
              padding: "16px 24px 24px",
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {l.label}
              </a>
            ))}
            <a href="#builder" className="btn-primary" onClick={() => setOpen(false)} style={{ textAlign: "center", marginTop: 8 }}>
              Try Free
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(min-width:768px){ .mob-menu{display:none!important} }
        @media(max-width:767px){ .nav-links{display:none!important} .btn-primary{display:none!important} .mob-menu{display:block!important} }
      `}</style>
    </motion.nav>
  );
}
