"use client";

import { create } from "zustand";
import type { AdCreative, PageAnalysis, PersonalizationResult, ProcessingStep } from "./types";

interface TrooSyncStore {
  // Input state
  adCreative: AdCreative | null;
  landingPageUrl: string;

  // Processing state
  processingStep: ProcessingStep;
  streamingText: string;
  error: string | null;

  // Results state
  result: PersonalizationResult | null;
  selectedVariant: number;
  activeTab: "preview" | "code" | "diff" | "analytics";
  showHeatmap: boolean;
  showDiff: boolean;
  temperature: number;
  editableHtml: string;

  // Actions
  setAdCreative: (ad: AdCreative | null) => void;
  setLandingPageUrl: (url: string) => void;
  setProcessingStep: (step: ProcessingStep) => void;
  appendStreamingText: (text: string) => void;
  resetStreaming: () => void;
  setResult: (result: PersonalizationResult) => void;
  setError: (error: string | null) => void;
  setSelectedVariant: (idx: number) => void;
  setActiveTab: (tab: "preview" | "code" | "diff" | "analytics") => void;
  setShowHeatmap: (val: boolean) => void;
  setShowDiff: (val: boolean) => void;
  setTemperature: (val: number) => void;
  setEditableHtml: (html: string) => void;
  reset: () => void;
}

export const useTrooSyncStore = create<TrooSyncStore>((set) => ({
  adCreative: null,
  landingPageUrl: "",
  processingStep: "idle",
  streamingText: "",
  error: null,
  result: null,
  selectedVariant: 0,
  activeTab: "preview",
  showHeatmap: false,
  showDiff: false,
  temperature: 0.7,
  editableHtml: "",

  setAdCreative: (ad) => set({ adCreative: ad }),
  setLandingPageUrl: (url) => set({ landingPageUrl: url }),
  setProcessingStep: (step) => set({ processingStep: step }),
  appendStreamingText: (text) =>
    set((state) => ({ streamingText: state.streamingText + text })),
  resetStreaming: () => set({ streamingText: "" }),
  setResult: (result) =>
    set({ result, editableHtml: result.enhancedHtml, processingStep: "complete" }),
  setError: (error) => set({ error, processingStep: "error" }),
  setSelectedVariant: (idx) => set({ selectedVariant: idx }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowHeatmap: (val) => set({ showHeatmap: val }),
  setShowDiff: (val) => set({ showDiff: val }),
  setTemperature: (val) => set({ temperature: val }),
  setEditableHtml: (html) => set({ editableHtml: html }),
  reset: () =>
    set({
      processingStep: "idle",
      streamingText: "",
      error: null,
      result: null,
      selectedVariant: 0,
      activeTab: "preview",
      showHeatmap: false,
      showDiff: false,
      editableHtml: "",
    }),
}));
