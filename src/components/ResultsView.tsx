"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SplitSquareHorizontal, Code2, BarChart2, GitCompare,
  Download, RefreshCw, Send, Zap, X, ChevronDown,
  TrendingUp, ArrowUpRight, Copy, Check, Maximize2
} from "lucide-react";
import { useTrooSyncStore } from "@/lib/store";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const S = {
  section: {
    padding: "80px 32px 120px",
    position: "relative" as const,
  },
  card: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    backdropFilter: "blur(20px)",
  } as React.CSSProperties,
};

// ─── CRO Score Ring ────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
        <circle cx={70} cy={70} r={r} fill="none" stroke={color}
          strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - fill}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 12px ${color}80)` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copied!");
      }}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
        borderRadius: 10, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
        background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
        color: copied ? "#10b981" : "rgba(255,255,255,0.6)",
        transition: "all 0.2s",
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied!" : "Copy HTML"}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResultsView() {
  const {
    result, editableHtml, setEditableHtml,
    landingPageUrl, selectedVariant, setSelectedVariant,
    reset,
  } = useTrooSyncStore();

  const [tab, setTab] = useState<"preview" | "code" | "analytics">("preview");
  const [tweakInput, setTweakInput] = useState("");
  const [isTweaking, setIsTweaking] = useState(false);
  const [fullscreen, setFullscreen] = useState<"original" | "enhanced" | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleTweak = useCallback(async () => {
    if (!tweakInput.trim() || isTweaking) return;
    const instruction = tweakInput.trim();
    setTweakInput("");
    setIsTweaking(true);
    try {
      const res = await fetch("/api/tweak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: editableHtml, instruction }),
      });
      const data = await res.json();
      if (data.html) { setEditableHtml(data.html); toast.success("Page updated!"); }
      else throw new Error(data.error || "Tweak failed");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsTweaking(false);
    }
  }, [tweakInput, isTweaking, editableHtml, setEditableHtml]);

  const handleDownload = () => {
    const blob = new Blob([editableHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = "troosync-enhanced.html"; a.click();
    URL.revokeObjectURL(url);
    toast.success("HTML downloaded!");
  };

  if (!result) return null;

  const changes = result.Changes || [];
  const highImpact = changes.filter(c => c.impact === "high").length;
  const midImpact  = changes.filter(c => c.impact === "medium").length;

  // Current HTML to show (variant or main)
  const displayHtml = result.variants?.[selectedVariant] ?? editableHtml;

  const TABS = [
    { id: "preview",   icon: SplitSquareHorizontal, label: "Side-by-Side" },
    { id: "code",      icon: Code2,   label: "Code" },
    { id: "analytics", icon: BarChart2, label: "Analytics" },
  ] as const;

  return (
    <section style={S.section}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 900, height: 500, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, rgba(0,245,255,0.04) 40%, transparent 70%)",
        pointerEvents: "none", filter: "blur(60px)",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 16 }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.05em" }}>PERSONALIZATION COMPLETE</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              Your page is <span className="gradient-text">ready to convert</span>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
              {landingPageUrl && <a href={landingPageUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: "#00f5ff", display: "inline-flex", alignItems: "center", gap: 4 }}>
                {landingPageUrl.slice(0, 50)}{landingPageUrl.length > 50 ? "…" : ""} <ArrowUpRight size={13} />
              </a>}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <CopyBtn text={editableHtml} />
            <button onClick={handleDownload} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)",
              color: "#00f5ff", transition: "all 0.2s",
            }}>
              <Download size={14} /> Export HTML
            </button>
            <button onClick={reset} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", transition: "all 0.2s",
            }}>
              <RefreshCw size={14} /> New Run
            </button>
          </div>
        </motion.div>

        {/* ── Score + Summary strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 32, ...S.card, padding: "28px 36px", marginBottom: 32, alignItems: "center" }}
          className="score-strip"
        >
          <ScoreRing score={result.croScore ?? 0} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", marginBottom: 8 }}>CRO SUMMARY</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, maxWidth: 600 }}>{result.summary}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              <Chip color="#ef4444" label={`${highImpact} high-impact changes`} />
              <Chip color="#f59e0b" label={`${midImpact} medium changes`} />
              <Chip color="#10b981" label={`+${result.upliftPrediction ?? 0}% predicted uplift`} />
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "0 16px", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: "#10b981", letterSpacing: "-0.03em" }}>+{result.upliftPrediction ?? 0}%</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Est. Conversions</div>
          </div>
        </motion.div>

        {/* ── Variant Selector ── */}
        {result.variants && result.variants.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}
          >
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginRight: 4 }}>VARIANT</span>
            {result.variants.map((_, i) => (
              <button key={i} onClick={() => { setSelectedVariant(i); setEditableHtml(result.variants![i]); }}
                style={{
                  padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: selectedVariant === i ? "linear-gradient(135deg,#00f5ff,#a855f7)" : "rgba(255,255,255,0.05)",
                  border: selectedVariant === i ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: selectedVariant === i ? "#000" : "rgba(255,255,255,0.5)",
                  transition: "all 0.2s",
                }}>
                {["A", "B", "C"][i]}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Tab Bar ── */}
        <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 14,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          width: "fit-content", marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 20px",
                borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                background: tab === t.id ? "rgba(0,245,255,0.12)" : "transparent",
                color: tab === t.id ? "#00f5ff" : "rgba(255,255,255,0.35)",
                outline: tab === t.id ? "1px solid rgba(0,245,255,0.25)" : "none",
                transition: "all 0.2s",
              }}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {tab === "preview" && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Side-by-side previews */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }} className="preview-grid">
                {/* Original */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>ORIGINAL</span>
                    </div>
                  </div>
                  <div style={{ ...S.card, height: 480, overflow: "hidden", position: "relative" }}>
                    {landingPageUrl ? (
                      <iframe src={landingPageUrl} style={{ width: "100%", height: "100%", border: "none", borderRadius: 20 }}
                        sandbox="allow-scripts allow-same-origin" />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
                        Original page preview
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Enhanced */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", letterSpacing: "0.05em" }}>AI ENHANCED</span>
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Click to edit inline</span>
                  </div>
                  <div style={{ ...S.card, height: 480, overflow: "auto", position: "relative" }}>
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: displayHtml }}
                      onInput={e => setEditableHtml((e.currentTarget as HTMLElement).innerHTML)}
                      style={{ minHeight: "100%", outline: "none", padding: 16, fontSize: 12, color: "#fff", fontFamily: "monospace", lineHeight: 1.6 }}
                    />
                    <div style={{ position: "absolute", inset: 0, borderRadius: 20, border: "1px solid rgba(16,185,129,0.25)", pointerEvents: "none" }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "code" && (
            <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ ...S.card, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Enhanced HTML</span>
                  <CopyBtn text={editableHtml} />
                </div>
                <pre style={{
                  overflowX: "auto", overflowY: "auto", maxHeight: 520,
                  fontSize: 12, lineHeight: 1.65,
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 20,
                  whiteSpace: "pre-wrap", wordBreak: "break-all",
                }}>
                  {editableHtml}
                </pre>
              </div>
            </motion.div>
          )}

          {tab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="analytics-grid">
                {/* Ad Analysis */}
                <div style={{ ...S.card, padding: 28 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, color: "#00f5ff" }}>Ad Intelligence</h3>
                  {result.adAnalysis && Object.entries({
                    Tone:    result.adAnalysis.tone,
                    Offer:   result.adAnalysis.offer,
                    Emotion: result.adAnalysis.emotion,
                    CTA:     result.adAnalysis.cta,
                  }).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", width: 60, letterSpacing: "0.05em", paddingTop: 2 }}>{k.toUpperCase()}</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, flex: 1 }}>{v}</span>
                    </div>
                  ))}
                  {result.adAnalysis?.keyVisuals?.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: 10, letterSpacing: "0.05em" }}>KEY VISUALS</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {result.adAnalysis.keyVisuals.map((v, i) => (
                          <span key={i} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11,
                            background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", color: "#00f5ff" }}>
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* CRO Changes */}
                <div style={{ ...S.card, padding: 28 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, color: "#a855f7" }}>CRO Changes ({changes.length})</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 320, overflowY: "auto" }}>
                    {changes.map((c, i) => (
                      <div key={i} style={{
                        padding: "12px 14px", borderRadius: 12,
                        background: `rgba(${c.impact === "high" ? "239,68,68" : c.impact === "medium" ? "245,158,11" : "16,185,129"},0.08)`,
                        border: `1px solid rgba(${c.impact === "high" ? "239,68,68" : c.impact === "medium" ? "245,158,11" : "16,185,129"},0.2)`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{c.element}</span>
                          <ImpactBadge impact={c.impact} />
                        </div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>{c.reason}</p>
                      </div>
                    ))}
                    {changes.length === 0 && (
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 20 }}>
                        No change details available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AI Tweak Chat ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ ...S.card, padding: 24, marginTop: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={16} color="#a855f7" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>AI Tweak</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Describe a change and Grok will apply it instantly</div>
            </div>
          </div>

          {/* Quick tweaks */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              "Make the headline more urgent",
              "Add social proof section",
              "Make the CTA button bigger",
              "Add a countdown timer",
              "Improve the value proposition",
            ].map(s => (
              <button key={s} onClick={() => setTweakInput(s)}
                style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                  background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
                  color: "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 0.2s",
                }}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={tweakInput}
              onChange={e => setTweakInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTweak()}
              placeholder='e.g. "Make the headline more urgent and add a countdown timer"'
              style={{
                flex: 1, padding: "13px 18px", borderRadius: 12, fontSize: 13,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", outline: "none",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.5)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
            <button
              onClick={handleTweak}
              disabled={!tweakInput.trim() || isTweaking}
              style={{
                padding: "13px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 8,
                background: tweakInput.trim() && !isTweaking
                  ? "linear-gradient(135deg,#a855f7,#6366f1)"
                  : "rgba(255,255,255,0.06)",
                color: tweakInput.trim() && !isTweaking ? "#fff" : "rgba(255,255,255,0.3)",
                border: "none", cursor: tweakInput.trim() && !isTweaking ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {isTweaking ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
              {isTweaking ? "Tweaking…" : "Apply"}
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .score-strip { grid-template-columns: auto 1fr auto; }
        @media(max-width:900px){ .preview-grid,.analytics-grid,.score-strip { grid-template-columns:1fr!important; } }
      `}</style>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Chip({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 8,
      background: `${color}18`, border: `1px solid ${color}30`,
      fontSize: 11, fontWeight: 600, color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}

function ImpactBadge({ impact }: { impact: "high" | "medium" | "low" }) {
  const map = { high: ["#ef4444", "HIGH"], medium: ["#f59e0b", "MED"], low: ["#10b981", "LOW"] } as const;
  const [color, text] = map[impact];
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: "0.05em", padding: "3px 8px",
      borderRadius: 6, background: `${color}22`, border: `1px solid ${color}40`, color,
    }}>
      {text}
    </span>
  );
}
