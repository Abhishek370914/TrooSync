import { NextRequest } from "next/server";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import type { PersonalizationResult, CROChange } from "@/lib/types";

// xAI Grok — OpenAI-compatible API
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

// ── HTML Minifier ─────────────────────────────────────────────────────────────
// Strips bloat before sending to Grok to reduce token usage and speed up inference
function minifyHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, link[rel='stylesheet'], noscript, iframe, svg, canvas").remove();
  $("[class*='analytics'], [id*='analytics'], [class*='tracking']").remove();
  $("*").each((_, el) => {
    if (el.type !== "tag") return;
    const keep = ["href", "src", "alt", "placeholder", "type", "name", "id", "class", "action", "method"];
    Object.keys((el as any).attribs || {}).forEach(attr => {
      if (!keep.includes(attr)) delete (el as any).attribs[attr];
    });
  });

  const minified = $.html()
    .replace(/<!--[\s\S]*?-->/g, "")        // HTML comments
    .replace(/\s{2,}/g, " ")                 // Multiple spaces
    .replace(/>\s+</g, "><")                  // Whitespace between tags
    .trim();

  return minified;
}

async function fetchPageHtml(url: string): Promise<{ html: string; title: string; description: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TrooSync/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rawHtml = await res.text();
    const $ = cheerio.load(rawHtml);

    const title = $("title").text().trim() || $("h1").first().text().trim() || "Landing Page";
    const description = $("meta[name='description']").attr("content") ||
                       $("meta[property='og:description']").attr("content") || "";

    return { html: minifyHtml(rawHtml), title, description };
  } catch (err: unknown) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to fetch page: ${msg}`);
  }
}

function buildSystemPrompt(): string {
  return `You are TrooSync, an elite CRO AI powered by Grok. You transform landing pages to perfectly match ad creatives.

Your job:
1. Analyze the ad creative (image/URL/description)
2. Understand the original landing page's purpose
3. Produce a MODIFIED version that:
   - Uses personalized copy matching the ad's tone, emotion, and messaging
   - Has CRO-optimized headlines (clear value prop, above the fold)
   - Adds urgency signals, trust indicators, and social proof
   - Has a strong CTA that mirrors the ad's CTA style
   - Feels like the ORIGINAL page "upgraded" — same structure, better copy
   - Uses only inline styles (no external CSS dependencies)

Return a JSON object with this exact shape (no markdown, no explanation):
{
  "enhancedHtml": "<full modified HTML>",
  "changes": [
    { "element": "headline", "original": "...", "enhanced": "...", "reason": "...", "impact": "high" }
  ],
  "croScore": 82,
  "upliftPrediction": 34,
  "adAnalysis": {
    "tone": "confident",
    "offer": "free trial",
    "emotion": "excitement",
    "cta": "action-oriented",
    "keyVisuals": ["product screenshot"]
  },
  "summary": "Summary of improvements",
  "variants": ["<html variant 2>", "<html variant 3>"]
}

RULES:
- enhancedHtml must be the FULL modified HTML document
- croScore: 65-95, upliftPrediction: 15-55
- changes array: 5-10 specific improvements
- impact: "high" | "medium" | "low"
- Return ONLY the raw JSON. No markdown fences.`;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let heartbeat: ReturnType<typeof setInterval> | null = null;

      try {
        const formData = await request.formData();
        const landingPageUrl = formData.get("landingPageUrl") as string;
        const adUrl = formData.get("adUrl") as string | null;
        const adBase64 = formData.get("adBase64") as string | null;
        const adMimeType = (formData.get("adMimeType") as string) || "image/jpeg";
        const adFile = formData.get("adFile") as File | null;

        if (!landingPageUrl) {
          send({ type: "error", error: "Missing landing page URL" });
          controller.close();
          return;
        }

        // ── Step 1: Ad analysis ───────────────────────────────────────────────
        send({ type: "progress", step: "analyzing-ad", message: "Grok vision pipeline initializing…" });
        send({ type: "log", message: "Initializing Grok vision pipeline…" });

        let adImageBase64 = adBase64;
        let adImageMime = adMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

        if (adFile) {
          send({ type: "log", message: `Processing file: ${adFile.name} (${(adFile.size / 1024).toFixed(1)}kb)` });
          const bytes = await adFile.arrayBuffer();
          adImageBase64 = Buffer.from(bytes).toString("base64");
          adImageMime = (adFile.type as typeof adImageMime) || "image/jpeg";
        } else if (adUrl) {
          send({ type: "log", message: `Ad URL detected: ${adUrl}` });
        }
        send({ type: "log", message: "Ad creative ready ✓" });

        // ── Step 2: Fetch page ────────────────────────────────────────────────
        send({ type: "progress", step: "fetching-page", message: "Fetching and minifying landing page…" });
        send({ type: "log", message: `Fetching ${landingPageUrl}…` });

        let pageData: { html: string; title: string; description: string };
        try {
          pageData = await fetchPageHtml(landingPageUrl);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to fetch page";
          send({ type: "error", error: msg });
          controller.close();
          return;
        }

        send({ type: "log", message: `✓ Fetched "${pageData.title}" — minified to ${(pageData.html.length / 1024).toFixed(0)}kb` });

        // Truncate if still too large (Grok context window)
        const finalHtml = pageData.html.length > 30000
          ? pageData.html.substring(0, 30000) + "<!-- truncated -->"
          : pageData.html;

        // ── Step 3: Generate with Grok ────────────────────────────────────────
        send({ type: "progress", step: "generating", message: "Grok is personalizing your landing page…" });
        send({ type: "log", message: `Context: ${Math.round((finalHtml.length + 1000) / 4)} tokens → sending to Grok…` });

        // Build messages for Grok
        const userMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

        // Vision content array
        const contentParts: OpenAI.Chat.ChatCompletionContentPart[] = [];

        if (adImageBase64) {
          contentParts.push({
            type: "image_url",
            image_url: { url: `data:${adImageMime};base64,${adImageBase64}` },
          });
          contentParts.push({ type: "text", text: "Above is the ad creative image." });
        } else if (adUrl) {
          contentParts.push({
            type: "text",
            text: `Ad creative URL: ${adUrl}\nAnalyze what this ad likely contains based on the URL domain and context.`,
          });
        }

        contentParts.push({
          type: "text",
          text: `Landing Page: ${landingPageUrl}
Title: ${pageData.title}
Description: ${pageData.description}

HTML:
${finalHtml}

Produce the personalized CRO-optimized version. Return ONLY raw JSON.`,
        });

        userMessages.push({ role: "user", content: contentParts });

        // ── Heartbeat: keep UI alive during Grok inference ───────────────────
        let beat = 0;
        const BEATS = [
          "Parsing ad tone, emotion, and offer…",
          "Mapping ad messaging to page copy…",
          "Applying above-the-fold CRO heuristics…",
          "Rewriting headlines for maximum relevance…",
          "Optimizing CTA and urgency signals…",
          "Adding trust indicators and social proof…",
          "Generating A/B variants…",
          "Finalizing personalized HTML…",
        ];
        heartbeat = setInterval(() => {
          if (beat < BEATS.length) send({ type: "log", message: BEATS[beat++] });
          if (beat === 3) send({ type: "progress", step: "optimizing", message: "Applying CRO heuristics…" });
          if (beat === 6) send({ type: "progress", step: "finalizing", message: "Finalizing enhanced page…" });
        }, 3000);

        const grokResponse = await grok.chat.completions.create({
          model: "grok-3-beta",
          max_tokens: 8192,
          temperature: 0.7,
          system: buildSystemPrompt(),
          messages: userMessages,
        } as any);

        clearInterval(heartbeat);
        heartbeat = null;

        send({ type: "log", message: "✓ Grok response received — parsing…" });

        const rawText = grokResponse.choices[0]?.message?.content || "";

        let parsed: PersonalizationResult;
        try {
          let jsonStr = rawText.trim();
          const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) jsonStr = jsonMatch[1].trim();

          const firstBrace = jsonStr.indexOf("{");
          const lastBrace = jsonStr.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
          }

          const raw = JSON.parse(jsonStr);

          parsed = {
            enhancedHtml: raw.enhancedHtml || pageData.html,
            originalHtml: pageData.html,
            Changes: (raw.changes || []).map((c: CROChange) => ({
              element: c.element || "element",
              original: c.original || "",
              enhanced: c.enhanced || "",
              reason: c.reason || "",
              impact: (c.impact as "high" | "medium" | "low") || "medium",
            })),
            croScore: Math.min(100, Math.max(0, parseInt(raw.croScore) || 75)),
            upliftPrediction: Math.min(80, Math.max(5, parseInt(raw.upliftPrediction) || 30)),
            adAnalysis: {
              tone: raw.adAnalysis?.tone || "professional",
              offer: raw.adAnalysis?.offer || "value proposition",
              emotion: raw.adAnalysis?.emotion || "trust",
              cta: raw.adAnalysis?.cta || "action-oriented",
              keyVisuals: raw.adAnalysis?.keyVisuals || [],
            },
            summary: raw.summary || "Page personalized with Grok-driven CRO improvements.",
            variants: raw.variants || [],
          };
        } catch (parseErr) {
          console.error("JSON parse error:", parseErr);
          parsed = {
            enhancedHtml: pageData.html,
            originalHtml: pageData.html,
            Changes: [{ element: "headline", original: pageData.title, enhanced: "Enhanced for better conversion", reason: "Retry for full results.", impact: "low" }],
            croScore: 50,
            upliftPrediction: 10,
            adAnalysis: { tone: "professional", offer: "value", emotion: "trust", cta: "action", keyVisuals: [] },
            summary: "Partial personalization. Try regenerating.",
            variants: [],
          };
        }

        send({ type: "result", result: parsed });
        send({ type: "progress", step: "complete", message: "Done!" });

      } catch (err: unknown) {
        if (heartbeat) clearInterval(heartbeat);
        const message = err instanceof Error ? err.message : "Internal server error";
        console.error("Personalize API error:", err);
        send({ type: "error", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
