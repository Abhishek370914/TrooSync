export interface AdCreative {
  type: "image" | "video" | "gif" | "url";
  file?: File;
  url?: string;
  preview?: string;
  base64?: string;
}

export interface PageAnalysis {
  url: string;
  html: string;
  screenshot?: string;
  title?: string;
  description?: string;
}

export interface CROChange {
  element: string;
  original: string;
  enhanced: string;
  reason: string;
  impact: "high" | "medium" | "low";
}

export interface PersonalizationResult {
  enhancedHtml: string;
  originalHtml: string;
  Changes: CROChange[];
  croScore: number;
  upliftPrediction: number;
  adAnalysis: {
    tone: string;
    offer: string;
    emotion: string;
    cta: string;
    keyVisuals: string[];
  };
  summary: string;
  variants?: string[];
}

export type ProcessingStep =
  | "idle"
  | "analyzing-ad"
  | "fetching-page"
  | "auditing-cro"
  | "generating"
  | "optimizing"
  | "finalizing"
  | "complete"
  | "error";
