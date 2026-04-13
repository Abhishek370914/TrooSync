import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";
import type { PersonalizationResult, CROChange } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function fetchPageHtml(url: string): Promise<{ html: string; title: string; description: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TrooSync/1.0; +https://troosync.app)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove scripts & tracking to keep HTML cleaner
    $("script[src*='analytics'], script[src*='gtm'], script[src*='facebook']").remove();

    const title = $("title").text().trim() || $("h1").first().text().trim() || "Landing Page";
    const description = $("meta[name='description']").attr("content") || 
                       $("meta[property='og:description']").attr("content") || "";

    return { html: $.html(), title, description };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to fetch page: ${msg}`);
  }
}

function buildSystemPrompt(): string {
  return `You are TrooSync, an elite CRO (Conversion Rate Optimization) AI that transforms landing pages to perfectly match ad creatives.

Your job:
1. Analyze the ad creative (from the user's description/image)  
2. Understand the original landing page's purpose and content
3. Produce a MODIFIED version of the same landing page that:
   - Uses personalized copy matching the ad's tone, emotion, and messaging
   - Has CRO-optimized headlines (clear value prop, above the fold)
   - Adds urgency signals, trust indicators, and social proof
   - Has a strong, matching CTA that mirrors the ad's CTA style
   - Feels like the ORIGINAL page "upgraded" — same structure, better copy
   - Uses inline styles for colors/fonts (no external CSS dependencies except what was there)

Return a JSON object with this exact shape:
{
  "enhancedHtml": "<full modified HTML of the page>",
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
    "keyVisuals": ["product screenshot", "person smiling"]
  },
  "summary": "AI-generated summary of what was improved",
  "variants": ["<html variant 2>", "<html variant 3>"]
}

CRITICAL: 
- enhancedHtml must be the FULL modified HTML document 
- Make variants[0] and variants[1] slightly different versions of enhancedHtml
- croScore should be 65-95 based on real improvements made
- upliftPrediction should be 15-55 (realistic CRO lift)
- changes array should have 5-10 specific improvements
- impact can be "high", "medium", or "low"`;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const formData = await request.formData();
        const landingPageUrl = formData.get("landingPageUrl") as string;
        const adUrl = formData.get("adUrl") as string | null;
        const adBase64 = formData.get("adBase64") as string | null;
        const adMimeType = (formData.get("adMimeType") as string) || "image/jpeg";
        const temperature = parseFloat((formData.get("temperature") as string) || "0.7");
        const adFile = formData.get("adFile") as File | null;

        if (!landingPageUrl) {
          send({ type: "error", error: "Missing landing page URL" });
          controller.close();
          return;
        }

        // Step 1: Analyze ad creative
        send({ type: "progress", step: "analyzing-ad", message: "Analyzing ad creative with Claude Vision…" });

        let adImageBase64 = adBase64;
        let adImageMime = adMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

        if (adFile) {
          const bytes = await adFile.arrayBuffer();
          adImageBase64 = Buffer.from(bytes).toString("base64");
          adImageMime = (adFile.type as typeof adImageMime) || "image/jpeg";
        }

        // Step 2: Fetch landing page
        send({ type: "progress", step: "fetching-page", message: "Fetching original landing page HTML…" });

        let pageData: { html: string; title: string; description: string };
        try {
          pageData = await fetchPageHtml(landingPageUrl);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to fetch page";
          send({ type: "error", error: msg });
          controller.close();
          return;
        }

        // Truncate HTML to avoid context window overflow
        const truncatedHtml = pageData.html.length > 40000
          ? pageData.html.substring(0, 40000) + "\n<!-- ... HTML truncated for context window ... -->"
          : pageData.html;

        // Step 3: CRO Audit
        send({ type: "progress", step: "auditing-cro", message: "Running CRO audit against ad messaging…" });

        // Step 4: Generate enhanced page
        send({ type: "progress", step: "generating", message: "Generating personalized, CRO-optimized page…" });

        // Build content array for Claude
        const userContent: Anthropic.MessageParam["content"] = [];

        if (adImageBase64) {
          userContent.push({
            type: "image",
            source: {
              type: "base64",
              media_type: adImageMime,
              data: adImageBase64,
            },
          });
          userContent.push({
            type: "text",
            text: `Above is the ad creative image.`,
          });
        } else if (adUrl) {
          userContent.push({
            type: "text",
            text: `Ad creative URL/reference: ${adUrl}

Please analyze what this ad likely contains based on the URL domain and context.`,
          });
        }

        userContent.push({
          type: "text",
          text: `
Landing Page URL: ${landingPageUrl}
Page Title: ${pageData.title}
Page Meta Description: ${pageData.description}

Original HTML:
\`\`\`html
${truncatedHtml}
\`\`\`

Please analyze the ad creative and original page, then produce a fully personalized, CRO-optimized version.
Return ONLY the JSON object as described in the system prompt. No markdown, no explanation outside the JSON.`,
        });

        const claudeResponse = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 8192,
          temperature,
          system: buildSystemPrompt(),
          messages: [{ role: "user", content: userContent }],
        });

        const rawContent = claudeResponse.content[0];
        if (rawContent.type !== "text") {
          throw new Error("Unexpected Claude response type");
        }

        let parsed: PersonalizationResult;
        try {
          // Extract JSON from response (Claude might wrap in markdown)
          let jsonStr = rawContent.text.trim();
          const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) jsonStr = jsonMatch[1].trim();

          // Find JSON object
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
            summary: raw.summary || "Page has been personalized with AI-driven CRO improvements.",
            variants: raw.variants || [],
          };
        } catch (parseErr) {
          console.error("JSON parse error:", parseErr, "\nRaw:", rawContent.text.substring(0, 500));

          // Graceful fallback: still send original page with minimal enhancements
          parsed = {
            enhancedHtml: pageData.html,
            originalHtml: pageData.html,
            Changes: [
              {
                element: "headline",
                original: pageData.title,
                enhanced: "Enhanced for better conversion",
                reason: "AI could not parse full response. Retry with a different page.",
                impact: "low",
              }
            ],
            croScore: 50,
            upliftPrediction: 10,
            adAnalysis: { tone: "professional", offer: "value", emotion: "trust", cta: "action", keyVisuals: [] },
            summary: "Partial personalization applied. Try regenerating for full results.",
            variants: [],
          };
        }

        send({ type: "result", result: parsed });
        send({ type: "progress", step: "complete", message: "Done!" });

      } catch (err: unknown) {
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
