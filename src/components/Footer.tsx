"use client";

import { Zap, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12 px-6 mt-16">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-black" fill="black" />
          </div>
          <span className="font-bold text-lg gradient-text">TrooSync</span>
        </div>

        <p className="text-white/25 text-sm text-center">
          Built for the Troopod AI PM Assignment · Powered by Claude 3.5 Sonnet
        </p>

        <div className="flex items-center gap-4 text-white/30">
          <a href="https://github.com" className="hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </a>
          <a href="https://twitter.com" className="hover:text-white transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
