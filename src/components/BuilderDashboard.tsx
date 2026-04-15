"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Zap, ChevronDown, ChevronRight, RefreshCw, ExternalLink
} from "lucide-react";
import { useTrooSyncStore } from "@/lib/store";
import AdUpload from "./AdUpload";
import toast from "react-hot-toast";

const SAMPLE_PAGES = [
  { label: "Stripe", url: "https://stripe.com" },
  { label: "Linear", url: "https://linear.app" },
  { label: "Vercel", url: "https://vercel.com" },
];

export default function BuilderDashboard() {
  const {
    adCreative, landingPageUrl, setLandingPageUrl,
    processingStep, setProcessingStep,
    setResult, setError, resetStreaming, appendStreamingText,
    temperature, setTemperature,
  } = useTrooSyncStore();

  const [urlError, setUrlError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isValidUrl = (u: string) => { try { new URL(u); return true; } catch { return false; } };
  const isProcessing = !["idle", "complete", "error"].includes(processingStep);

  const handlePersonalize = async () => {
    if (!adCreative)  { toast.error("Upload or paste an ad creative first"); return; }
    if (!landingPageUrl.trim()) { toast.error("Enter a landing page URL"); return; }
    if (!isValidUrl(landingPageUrl.trim())) { setUrlError("Enter a valid URL (include https://)"); return; }

    setUrlError("");
    resetStreaming();
    setProcessingStep("analyzing-ad");

    try {
      const fd = new FormData();
      fd.append("landingPageUrl", landingPageUrl.trim());
      fd.append("temperature", temperature.toString());
      if (adCreative.type === "url") fd.append("adUrl", adCreative.url || "");
      else if (adCreative.file) fd.append("adFile", adCreative.file);
      else if (adCreative.base64) { fd.append("adBase64", adCreative.base64); fd.append("adMimeType", adCreative.file?.type || "image/jpeg"); }

      const res = await fetch("/api/personalize", { method: "POST", body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed"); }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      setProcessingStep("generating");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const p = JSON.parse(data);
            if (p.type === "progress") { setProcessingStep(p.step); }
            else if (p.type === "log") { appendStreamingText(p.message + "\n"); }
            else if (p.type === "result") { setResult(p.result); toast.success("Page personalized! 🚀"); }
            else if (p.type === "error") { throw new Error(p.error); }
          } catch { /* ignore */ }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <section id="builder" style={{ padding: "100px 32px", position: "relative" }}>
      {/* Background glows */}
      <div style={{
        position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
        width: 900, height: 500, borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(168,85,247,0.08) 0%,rgba(0,245,255,0.04) 50%,transparent 70%)",
        pointerEvents: "none", filter: "blur(40px)",
      }} />

      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 9999, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", marginBottom: 20 }}
          >
            <Zap size={13} color="#a855f7" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", letterSpacing: "0.06em" }}>AI BUILDER</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 14 }}
          >
            Build your <span className="gradient-text">personalized page</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 auto" }}
          >
            Two inputs. One AI. Thousands of conversions.
          </motion.p>
        </div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16,1,0.3,1] }}
          className="border-spin"
          style={{
            padding: "48px",
            position: "relative",
            background: "linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)",
          }}
        >
          {/* Top accent line */}
          <div style={{ position: "absolute", top: 0, left: 64, right: 64, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,245,255,0.5),transparent)" }} />

          {/* Two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 48, alignItems: "start" }} className="builder-grid">
            {/* Column 1: Ad Creative */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(0,245,255,0.12)", border: "1px solid rgba(0,245,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#00f5ff",
                }}>1</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Ad Creative</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Image · Video · GIF · URL</div>
                </div>
              </div>
              <AdUpload />
            </div>

            {/* Vertical divider */}
            <div style={{ background: "rgba(255,255,255,0.06)", alignSelf: "stretch" }} />

            {/* Column 2: Landing Page URL */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#a855f7",
                }}>2</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Landing Page URL</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Any live public page</div>
                </div>
              </div>

              {/* URL Input */}
              <div style={{ position: "relative", marginBottom: 12 }}>
                <Globe size={15} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type="url"
                  value={landingPageUrl}
                  onChange={e => { setLandingPageUrl(e.target.value); setUrlError(""); }}
                  placeholder="https://yoursite.com/landing-page"
                  style={{
                    width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                    borderRadius: 12, fontSize: 13,
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${urlError ? "#ff4444" : "rgba(255,255,255,0.1)"}`,
                    color: "#fff", outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.5)"; e.currentTarget.style.background = "rgba(168,85,247,0.04)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = urlError ? "#ff4444" : "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                />
              </div>
              {urlError && (
                <div style={{ color: "#ff4444", fontSize: 12, marginBottom: 10, paddingLeft: 4 }}>
                  {urlError}
                </div>
              )}

              {/* Valid URL indicator */}
              {landingPageUrl && isValidUrl(landingPageUrl) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", borderRadius: 8, marginBottom: 14,
                    background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Valid URL — ready to analyze</span>
                </motion.div>
              )}

              {/* Quick examples */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", marginBottom: 8 }}>
                  QUICK EXAMPLES
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {SAMPLE_PAGES.map(p => (
                    <button key={p.url} onClick={() => setLandingPageUrl(p.url)}
                      style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                        borderRadius: 8, fontSize: 11, fontWeight: 500,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.55)", cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      <ExternalLink size={10} /> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced settings */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, color: "rgba(255,255,255,0.3)",
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  transition: "color 0.2s",
                }}
              >
                <ChevronDown size={13} style={{ transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                Advanced settings
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: 12, overflow: "hidden" }}
                  >
                    <div style={{ padding: "16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>AI Creativity</span>
                        <span style={{ fontSize: 12, color: "#00f5ff", fontFamily: "monospace" }}>{temperature.toFixed(1)}</span>
                      </div>
                      <input type="range" min={0} max={1} step={0.1} value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))}
                        style={{ width: "100%", accentColor: "#00f5ff" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
                        <span>Deterministic</span><span>Creative</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Big CTA */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
            <motion.button
              onClick={handlePersonalize}
              disabled={!adCreative || !landingPageUrl || isProcessing}
              whileHover={adCreative && landingPageUrl && !isProcessing ? { scale: 1.04, y: -3 } : {}}
              whileTap={adCreative && landingPageUrl && !isProcessing ? { scale: 0.97 } : {}}
              style={{
                padding: "18px 52px",
                borderRadius: 9999,
                fontSize: "1.05rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                border: "none",
                cursor: adCreative && landingPageUrl && !isProcessing ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 10,
                background: adCreative && landingPageUrl && !isProcessing
                  ? "linear-gradient(135deg,#00f5ff 0%,#a855f7 50%,#ff00ff 100%)"
                  : "rgba(255,255,255,0.06)",
                color: adCreative && landingPageUrl && !isProcessing ? "#000" : "rgba(255,255,255,0.3)",
                opacity: adCreative && landingPageUrl && !isProcessing ? 1 : 0.6,
                boxShadow: adCreative && landingPageUrl && !isProcessing
                  ? "0 8px 40px rgba(0,245,255,0.35), 0 0 0 1px rgba(0,245,255,0.15)"
                  : "none",
                transition: "box-shadow 0.3s, background 0.3s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {isProcessing ? (
                <><RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} /> Processing…</>
              ) : (
                <><Zap size={18} fill="currentColor" /> Personalize with AI <ChevronRight size={18} /></>
              )}
            </motion.button>
          </div>

          {/* Helper text */}
          {(!adCreative || !landingPageUrl) && (
            <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              {!adCreative && !landingPageUrl
                ? "Upload an ad creative and enter a landing page URL to get started"
                : !adCreative
                ? "⬆ Upload your ad creative on the left"
                : "⬆ Enter a landing page URL on the right"}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @media(max-width:768px){
          .builder-grid { grid-template-columns: 1fr !important; }
          .builder-grid > div:nth-child(2) { display: none; }
        }
      `}</style>
    </section>
  );
}
