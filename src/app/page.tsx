"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { useTrooSyncStore } from "@/lib/store";

const Hero = dynamic(() => import("@/components/Hero"), { ssr: false });
const BuilderDashboard = dynamic(() => import("@/components/BuilderDashboard"), { ssr: false });
const ProcessingScreen = dynamic(() => import("@/components/ProcessingScreen"), { ssr: false });
const ResultsView = dynamic(() => import("@/components/ResultsView"), { ssr: false });

export default function Home() {
  const { processingStep } = useTrooSyncStore();
  const isProcessing = !["idle", "complete", "error"].includes(processingStep);
  const isComplete = processingStep === "complete";
  const isError = processingStep === "error";

  return (
    <main className="relative min-h-screen bg-[#020208] overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <Hero />

      {/* How it works */}
      <section id="how-it-works" className="relative py-2" />

      {/* Features */}
      <FeaturesSection />

      {/* Builder section */}
      <AnimatePresence mode="wait">
        {!isProcessing && !isComplete && !isError && (
          <motion.div key="builder" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
            <BuilderDashboard />
          </motion.div>
        )}

        {isProcessing && (
          <motion.div key="processing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ProcessingScreen />
          </motion.div>
        )}

        {isComplete && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ResultsView />
          </motion.div>
        )}

        {isError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-6"
          >
            <div className="text-6xl">⚠️</div>
            <h3 className="text-2xl font-bold text-white">Something went wrong</h3>
            <p className="text-white/40 text-center max-w-md">
              The URL might be blocking scrapers, or the AI encountered an issue.
              Try a different URL or reload and try a demo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => useTrooSyncStore.getState().reset()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-semibold hover:scale-105 transition-transform"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  const store = useTrooSyncStore.getState();
                  store.reset();
                  store.setLandingPageUrl("https://stripe.com");
                  store.setAdCreative({ type: "url", url: "https://stripe.com", preview: "💳" });
                }}
                className="px-6 py-3 rounded-xl glass-card border border-white/15 text-white/70 hover:text-white hover:border-cyan-500/30 transition-all"
              >
                Load Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
