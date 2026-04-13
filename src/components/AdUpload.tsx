"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Link2, Image as ImageIcon, Video, X, ChevronRight } from "lucide-react";
import { useTrooSyncStore } from "@/lib/store";

const SAMPLES = [
  { label: "🍎 Apple Vision Pro", url: "https://www.apple.com/apple-vision-pro/" },
  { label: "✓ Nike Run Club",    url: "https://www.nike.com/running" },
  { label: "◆ Notion AI",        url: "https://www.notion.so/product/ai" },
];

export default function AdUpload() {
  const { adCreative, setAdCreative } = useTrooSyncStore();
  const [mode, setMode] = useState<"drop" | "url">("drop");
  const [urlInput, setUrlInput] = useState("");

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(",")[1];
      const type = file.type.startsWith("video") ? "video" : file.type.includes("gif") ? "gif" : "image";
      setAdCreative({ type, file, preview: result, base64 });
    };
    reader.readAsDataURL(file);
  }, [setAdCreative]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUrl = () => {
    if (!urlInput.trim()) return;
    setAdCreative({ type: "url", url: urlInput.trim() });
  };

  const clear = () => { setAdCreative(null); setUrlInput(""); };

  if (adCreative) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            borderRadius: 16, overflow: "hidden",
            border: "1px solid rgba(0,245,255,0.25)",
            background: "rgba(0,245,255,0.04)",
          }}
        >
          {adCreative.type === "image" && adCreative.preview && (
            <img src={adCreative.preview} alt="ad" style={{ width: "100%", height: 180, objectFit: "cover" }} />
          )}
          {adCreative.type === "video" && adCreative.preview && (
            <video src={adCreative.preview} style={{ width: "100%", height: 180, objectFit: "cover" }} muted loop autoPlay />
          )}
          {(adCreative.type === "url" || !adCreative.preview || adCreative.preview.length > 10) && adCreative.type !== "image" && adCreative.type !== "video" && (
            <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <Link2 size={24} color="#00f5ff" />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginLeft: 10, wordBreak: "break-all" }}>
                {adCreative.url}
              </span>
            </div>
          )}
          <div style={{
            padding: "10px 16px", display: "flex", alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00f5ff", boxShadow: "0 0 6px #00f5ff" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "capitalize" }}>
                {adCreative.type} ready
              </span>
            </div>
            <button onClick={clear} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 2 }}>
              <X size={14} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Mode tabs */}
      <div style={{
        display: "flex", gap: 4, padding: 4, borderRadius: 12,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        width: "fit-content",
      }}>
        {(["drop", "url"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: "pointer", border: "none",
            transition: "all 0.2s",
            background: mode === m ? "rgba(0,245,255,0.12)" : "transparent",
            color: mode === m ? "#00f5ff" : "rgba(255,255,255,0.35)",
            outline: mode === m ? "1px solid rgba(0,245,255,0.25)" : "none",
          }}>
            {m === "drop" ? <><Upload size={11} style={{ display: "inline", marginRight: 5 }} />Upload</> : <><Link2 size={11} style={{ display: "inline", marginRight: 5 }} />URL</>}
          </button>
        ))}
      </div>

      {mode === "drop" ? (
        <div
          {...getRootProps()}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 14, padding: "36px 24px", borderRadius: 16,
            border: isDragActive ? "2px dashed #00f5ff" : "2px dashed rgba(255,255,255,0.1)",
            background: isDragActive ? "rgba(0,245,255,0.05)" : "rgba(255,255,255,0.02)",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <input {...getInputProps()} />
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg,rgba(0,245,255,0.15),rgba(168,85,247,0.1))",
            border: "1px solid rgba(0,245,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Upload size={22} color="#00f5ff" />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 4 }}>
              {isDragActive ? "Drop it here!" : "Drag & drop ad creative"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>JPG · PNG · GIF · MP4 · Max 10MB</div>
          </div>
          <button style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: "pointer", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)",
            transition: "all 0.2s",
          }}>
            Browse files
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="url" value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUrl()}
            placeholder="https://example.com/ad-creative"
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 12, fontSize: 13,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", outline: "none",
            }}
          />
          <button onClick={handleUrl} style={{
            padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: "linear-gradient(135deg,#00f5ff,#a855f7)", color: "#000",
            border: "none", cursor: "pointer",
          }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Quick demos */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", marginBottom: 8 }}>
          QUICK DEMOS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SAMPLES.map(s => (
            <button key={s.url} onClick={() => setAdCreative({ type: "url", url: s.url })}
              style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.55)", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
