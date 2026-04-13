"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTrooSyncStore } from "@/lib/store";
import { Brain, Cpu, Sparkles, Zap, ShieldCheck, ChevronRight } from "lucide-react";

const STEPS = [
  { id: "analyzing-ad", label: "Vision Analysis", icon: Sparkles, desc: "Claude is reading your ad's tone and emotion..." },
  { id: "fetching-page", label: "Page Audit", icon: Cpu, desc: "Fetching landing page HTML and auditing CRO..." },
  { id: "generating", label: "Neural Engine", icon: Brain, desc: "Anthropic Claude 3.5 Sonnet is personalizing your page..." },
  { id: "optimizing", label: "CRO Magic", icon: Zap, desc: "Applying 2026 conversion principles and heuristics..." },
  { id: "finalizing", label: "Verification", icon: ShieldCheck, desc: "Sanitizing code and finalizing the enhanced version..." },
];

export default function ProcessingScreen() {
  const { processingStep, streamingText } = useTrooSyncStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const particles: any[] = [];
    const particleCount = 200;
    const connections: any[] = [];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            r: Math.random() * 2 + 1,
            color: i % 2 === 0 ? "#00f5ff" : "#a855f7",
            glow: i % 5 === 0,
        });
    }

    let frame = 0;
    const animate = () => {
        frame++;
        ctx.fillStyle = "rgba(4, 4, 15, 0.15)";
        ctx.fillRect(0, 0, w, h);

        const centerX = w / 2;
        const centerY = h / 2 - 100;

        particles.forEach((p, i) => {
            // Brain-like attraction to center
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Pulsing effect
            const pulse = Math.sin(frame * 0.05) * 50;
            const targetDist = 180 + pulse;

            if (dist > targetDist) {
                p.vx += dx * 0.0001;
                p.vy += dy * 0.0001;
            } else {
                p.vx -= dx * 0.0001;
                p.vy -= dy * 0.0001;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            if (p.glow) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx2 = p.x - p2.x;
                const dy2 = p.y - p2.y;
                const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                if (d2 < 60) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 245, 255, ${0.1 * (1 - d2 / 60)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    };

    const handleResize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
        window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#04040f]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60"
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center">
        {/* Animated Brain Icon Container */}
        <motion.div
            animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
            }}
            transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="w-32 h-32 rounded-full glass-strong border-cyan-500/20 flex items-center justify-center mb-12 relative"
        >
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl animate-pulse" />
            <Brain size={64} className="text-cyan-400 relative z-10" />
            
            {/* Orbiting Elements */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-20px] pointer-events-none"
                >
                    <div className="w-2 h-2 rounded-full bg-purple-500 absolute top-0 left-1/2 -translate-x-1/2 blur-[2px]" />
                </motion.div>
            ))}
        </motion.div>

        {/* Headline */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
        >
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                AI <span className="gradient-text">Neural Engine</span> active
            </h2>
            <p className="text-white/40 text-lg">
                Crafting your high-performance landing page...
            </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="w-full space-y-4 mb-12">
            {STEPS.map((step, i) => {
                const isActive = processingStep === step.id;
                const isCompleted = STEPS.findIndex(s => s.id === processingStep) > i;

                return (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-2xl border transition-all duration-500 ${
                            isActive 
                                ? "glass-cyan border-cyan-500/30 scale-[1.02] shadow-[0_0_30px_rgba(0,245,255,0.1)]" 
                                : isCompleted
                                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
                                    : "bg-white/5 border-white/5 opacity-40 grayscale"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isActive ? "bg-cyan-500/20 text-cyan-400" : isCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                            }`}>
                                <step.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm tracking-wide uppercase">{step.label}</span>
                                    {isActive && (
                                        <motion.span 
                                            animate={{ opacity: [1, 0, 1] }} 
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="text-[10px] font-bold text-cyan-400 flex items-center gap-1"
                                        >
                                            PROCESSING <div className="w-1 h-1 rounded-full bg-cyan-400" />
                                        </motion.span>
                                    )}
                                    {isCompleted && <ShieldCheck size={16} className="text-emerald-400" />}
                                </div>
                                <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                        
                        {/* Progress Bar for Active Step */}
                        {isActive && (
                            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="h-full w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                                />
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>

        {/* Live Logs / Streaming Text */}
        <div className="w-full glass rounded-xl p-4 border-white/5 font-mono text-[10px] text-white/30 h-32 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#04040f]/80 to-transparent z-10 pointer-events-none" />
            <div className="space-y-1">
                {streamingText.split("\n").map((line, i) => (
                    <div key={i} className="flex gap-3">
                        <span className="text-cyan-500/40 select-none">[{i+1024}]</span>
                        <span className="text-white/40">{line}</span>
                    </div>
                ))}
                <motion.div 
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-1.5 h-3 bg-cyan-500/40 inline-block"
                />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#04040f]/80 to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
