"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTrooSyncStore } from "@/lib/store";
import { Sparkles, Globe, Zap, ShieldCheck, Brain, CheckCircle2 } from "lucide-react";

const STEPS = [
  { id: "analyzing-ad",  icon: Sparkles,    label: "Vision Analysis",  desc: "Grok reads your ad tone, emotion, offer & CTA style" },
  { id: "fetching-page", icon: Globe,        label: "Page Audit",       desc: "Fetching live HTML and running full CRO analysis" },
  { id: "generating",    icon: Brain,        label: "Neural Engine",    desc: "Grok is personalizing your landing page" },
  { id: "optimizing",   icon: Zap,          label: "CRO Magic",        desc: "Applying 2026 conversion principles & heuristics" },
  { id: "finalizing",   icon: ShieldCheck,  label: "Verification",     desc: "Sanitizing code & finalizing the enhanced version" },
];

const STEP_IDS = STEPS.map(s => s.id);

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let frame = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Nodes
    const N = 80;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 1.5 + 0.5,
      hue: Math.random() > 0.5 ? 185 : 280, // cyan vs purple
    }));

    const tick = () => {
      frame++;
      ctx.fillStyle = "rgba(4,4,15,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const puls = Math.sin(frame * 0.03) * 0.5 + 0.5;

      // Central glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180 + puls * 40);
      g.addColorStop(0, `rgba(0,245,255,${0.06 + puls * 0.04})`);
      g.addColorStop(0.4, `rgba(168,85,247,${0.04 + puls * 0.02})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((n, i) => {
        // Gentle attraction toward center
        const dx = cx - n.x, dy = cy - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const target = 120 + Math.sin(frame * 0.02 + i) * 60;
        if (dist > target) { n.vx += dx * 0.00008; n.vy += dy * 0.00008; }
        else { n.vx -= dx * 0.00006; n.vy -= dy * 0.00006; }

        n.vx *= 0.98; n.vy *= 0.98;
        n.x += n.vx; n.y += n.vy;

        // Clamp to canvas
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        // Draw node
        const alpha = 0.6 + Math.sin(frame * 0.05 + i) * 0.3;
        ctx.shadowBlur = 8;
        ctx.shadowColor = n.hue === 185 ? "#00f5ff" : "#a855f7";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.hue === 185 ? `rgba(0,245,255,${alpha})` : `rgba(168,85,247,${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connections
        for (let j = i + 1; j < nodes.length; j++) {
          const p = nodes[j];
          const d = Math.hypot(n.x - p.x, n.y - p.y);
          if (d < 80) {
            const a = (1 - d / 80) * 0.25;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(0,245,255,${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}
    />
  );
}

export default function ProcessingScreen() {
  const { processingStep, streamingText } = useTrooSyncStore();

  const currentIdx = STEP_IDS.indexOf(processingStep);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "#04040f",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Neural canvas background */}
      <NeuralCanvas />

      {/* Top + bottom gradient vignettes */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, background: "linear-gradient(to bottom,#04040f,transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(to top,#04040f,transparent)", pointerEvents: "none" }} />

      {/* Main content */}
      <div style={{
        position: "relative", zIndex: 2,
        width: "100%", maxWidth: 680,
        padding: "0 32px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 40,
      }}>

        {/* ── Pulsing Brain Orb ── */}
        <motion.div
          animate={{ 
            scale: processingStep === "generating" ? [1, 1.15, 1] : [1, 1.08, 1],
            rotate: processingStep === "generating" ? [0, 8, -8, 0] : [0, 3, -3, 0]
          }}
          transition={{ 
            duration: processingStep === "generating" ? 0.8 : 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ position: "relative" }}
        >
          {/* Outer ring */}
          {[1, 2, 3].map(i => (
            <motion.div key={i}
              animate={{ 
                opacity: [0.4, 0, 0.4], 
                scale: processingStep === "generating" ? [1, 1.8 + i * 0.4, 1] : [1, 1.5 + i * 0.3, 1] 
              }}
              transition={{ 
                duration: processingStep === "generating" ? 0.6 : 3, 
                repeat: Infinity, 
                delay: i * (processingStep === "generating" ? 0.2 : 0.6), 
                ease: "easeOut" 
              }}
              style={{
                position: "absolute", inset: -(i * (processingStep === "generating" ? 24 : 18)),
                borderRadius: "50%",
                border: `1px solid rgba(0,245,255,${0.3 - i * 0.08})`,
              }}
            />
          ))}

          <div style={{
            width: 112, height: 112, borderRadius: "50%",
            background: "radial-gradient(circle at 40% 40%, rgba(0,245,255,0.25), rgba(168,85,247,0.15), rgba(4,4,15,0.9))",
            border: "1.5px solid rgba(0,245,255,0.45)",
            boxShadow: "0 0 60px rgba(0,245,255,0.25), 0 0 30px rgba(168,85,247,0.2), inset 0 0 30px rgba(0,245,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Brain size={48} color="#00f5ff" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* ── Headline ── */}
        <div style={{ textAlign: "center" }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900,
              letterSpacing: "-0.04em", lineHeight: 1.1,
              margin: "0 0 12px",
            }}
          >
            AI{" "}
            <span style={{
              background: "linear-gradient(120deg,#00f5ff 0%,#a855f7 60%,#ff00ff 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Neural Engine
            </span>{" "}active
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", letterSpacing: "0.01em" }}
          >
            Crafting your high-performance landing page…
          </motion.p>
        </div>

        {/* ── Step Track ── */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          {STEPS.map((step, i) => {
            const isComplete = currentIdx > i;
            const isActive   = currentIdx === i;
            const isPending  = currentIdx < i;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "14px 20px", borderRadius: 16,
                  transition: "all 0.4s ease",
                  background: isActive
                    ? "rgba(0,245,255,0.07)"
                    : isComplete
                      ? "rgba(16,185,129,0.05)"
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isActive ? "rgba(0,245,255,0.25)" : isComplete ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: isActive ? "0 0 24px rgba(0,245,255,0.08)" : "none",
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isComplete
                    ? "rgba(16,185,129,0.15)"
                    : isActive
                      ? "rgba(0,245,255,0.15)"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isComplete ? "rgba(16,185,129,0.4)" : isActive ? "rgba(0,245,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                }}>
                  {isComplete
                    ? <CheckCircle2 size={20} color="#10b981" />
                    : <step.icon size={20} color={isActive ? "#00f5ff" : "rgba(255,255,255,0.3)"} strokeWidth={1.8} />
                  }
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, marginBottom: 3,
                    color: isComplete ? "#10b981" : isActive ? "#ffffff" : "rgba(255,255,255,0.3)",
                    letterSpacing: "-0.01em",
                  }}>
                    {step.label}
                  </div>
                  <div style={{
                    fontSize: 12, lineHeight: 1.5,
                    color: isActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)",
                  }}>
                    {isActive && streamingText ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={streamingText.split("\n").filter(Boolean).pop()}
                        style={{ color: "#00f5ff", fontWeight: 500 }}
                      >
                        {streamingText.split("\n").filter(Boolean).pop()}
                      </motion.span>
                    ) : (
                      step.desc
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ flexShrink: 0 }}>
                  {isComplete && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
                      padding: "3px 10px", borderRadius: 6,
                      background: "rgba(16,185,129,0.15)", color: "#10b981",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}>DONE</span>
                  )}
                  {isActive && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
                        padding: "3px 10px", borderRadius: 6,
                        background: "rgba(0,245,255,0.12)", color: "#00f5ff",
                        border: "1px solid rgba(0,245,255,0.3)",
                        display: "inline-block",
                      }}
                    >
                      RUNNING
                    </motion.span>
                  )}
                </div>

                {/* Progress shimmer for active step */}
                {isActive && (
                  <motion.div
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute", bottom: 0, left: 20, right: 20, height: 1,
                      background: "linear-gradient(90deg,transparent,#00f5ff,transparent)",
                      transformOrigin: "left",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Live Log Terminal ── */}
        {streamingText && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              width: "100%", borderRadius: 14,
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Terminal header */}
            <div style={{
              padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {["#ef4444","#f59e0b","#10b981"].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
              ))}
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginLeft: 4, fontFamily: "monospace" }}>
                troosync — neural-engine
              </span>
            </div>

            {/* Log lines */}
            <div style={{ padding: "12px 16px", maxHeight: 100, overflowY: "auto" }}>
              {streamingText.split("\n").filter(Boolean).map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 4, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, color: "rgba(0,245,255,0.35)", fontFamily: "monospace", flexShrink: 0, paddingTop: 1 }}>
                    [{1024 + i}]
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", lineHeight: 1.6 }}>
                    {line}
                  </span>
                </div>
              ))}
              {/* Cursor */}
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ width: 6, height: 12, background: "#00f5ff", borderRadius: 1, marginTop: 4, opacity: 0.6 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
