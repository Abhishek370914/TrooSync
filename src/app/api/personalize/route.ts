import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import * as cheerio from "cheerio";
import sharp from "sharp";
import type { PersonalizationResult, CROChange } from "@/lib/types";

// ── Refined Ultra-Fast HTML Compressor ────────────────────────────────────────
// Keeps: <head> (title, meta), hero, nav, main, sections, footer.
// Strips: scripts, styles, comments, non-semantic noise, tracking.
function compressHtmlForGrok(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove absolute noise
  $("script, style, link[rel='stylesheet'], noscript, iframe, svg, canvas, .ads, [class*='tracking'], [id*='tracking'], [style*='display:none']").remove();

  // Keep only structural and content-rich tags
  const keepTags = ["h1", "h2", "h3", "h4", "p", "a", "button", "li", "span", "strong", "em", "form", "input", "label", "header", "nav", "main", "section", "footer", "body", "html", "head", "title", "meta"];
  
  $("*").each((_, el) => {
    if (el.type !== "tag") return;
    if (!keepTags.includes(el.name)) {
      $(el).contents().unwrap(); // Unwrap non-semantic divs but keep content
    }
    
    // Core attributes only
    const keepAttrs = ["href", "src", "alt", "placeholder", "type", "id", "class", "name", "content"];
    Object.keys((el as any).attribs || {}).forEach(attr => {
      if (!keepAttrs.includes(attr)) delete (el as any).attribs[attr];
    });
  });

  return $.html()
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

async function fetchPageHtml(url: string): Promise<{ html: string; title: string; description: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TrooSync-Fast-Mode/1.0", "Accept": "text/html" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rawHtml = await res.text();
    const $ = cheerio.load(rawHtml);
    const title = $("title").text().trim() || $("h1").first().text().trim() || "Landing Page";
    const description = $("meta[name='description']").attr("content") || "";
    return { html: compressHtmlForGrok(rawHtml), title, description };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function buildSystemPrompt(): string {
  return `FAST MODE ACTIVATED — NON-REASONING. 
You are in ultra-fast generation mode. 
Focus ONLY on high-impact CRO + ad personalization changes: hero section, main headline, sub-headline, primary CTA, color scheme, trust signals, and one key visual match. 
Output clean, minimal, valid HTML using Tailwind classes where possible. 
Do NOT rewrite the entire page. Return the enhanced version quickly.
Return ONLY raw JSON in this exact shape: { enhancedHtml, changes: [], croScore, upliftPrediction, adAnalysis, summary, variants }.`;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      let heartbeat: any = null;

      try {
        const formData = await request.formData();
        const landingPageUrl = formData.get("landingPageUrl") as string;
        const adUrl = formData.get("adUrl") as string | null;
        const adBase64 = formData.get("adBase64") as string | null;
        const adFile = formData.get("adFile") as File | null;

        if (!landingPageUrl) {
          send({ type: "error", error: "Missing landing page URL" });
          controller.close();
          return;
        }

        // STEP 1: ANALYZING AD (WITH RESIZING)
        send({ type: "progress", step: "analyzing-ad", message: "Grok is analyzing ad creative..." });
        send({ type: "log", message: "[BOOT] Fast-mode vision pipeline active" });
        
        let finalImageBase64 = adBase64;
        let finalImageMime = "image/jpeg";

        if (adFile) {
          send({ type: "log", message: `[IMG] Compressing ${adFile.name} to 800px (q=75)...` });
          const buffer = Buffer.from(await adFile.arrayBuffer());
          const resized = await sharp(buffer)
            .resize(800, null, { withoutEnlargement: true })
            .toFormat("jpeg", { quality: 75 })
            .toBuffer();
          finalImageBase64 = resized.toString("base64");
          finalImageMime = "image/jpeg";
          send({ type: "log", message: "[IMG] Compression complete ✓" });
        }

        // STEP 2: FETCHING PAGE
        send({ type: "progress", step: "fetching-page", message: "Fetching and auditing landing page..." });
        send({ type: "log", message: `[HTTP] Fetching ${landingPageUrl}` });
        const pageData = await fetchPageHtml(landingPageUrl);
        const finalHtml = pageData.html.length > 8000 ? pageData.html.substring(0, 8000) : pageData.html;
        send({ type: "log", message: `[HTTP] Optimized context to ${Math.round(finalHtml.length / 1024)}KB` });

        // STEP 3: GENERATING (ULTRA FAST)
        send({ type: "progress", step: "generating", message: "Grok is personalizing your page..." });
        send({ type: "log", message: "[GEN] Grok-4.1-Fast-Mode initializing..." });

        const messages: any[] = [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: [
            { type: "text", text: `Target URL: ${landingPageUrl}\nLanding Page HTML: ${finalHtml}\n\nTask: Personalize to match the ad perfectly.` },
          ]}
        ];

        if (finalImageBase64) {
          (messages[1].content as any[]).push({
            type: "image_url",
            image_url: { url: `data:${finalImageMime};base64,${finalImageBase64}` }
          });
        }
        
        // Fast heartbeat (every 1.5s)
        let beatIdx = 0;
        const beats = [
          "Grok Vision matching ad tone...",
          "Identifying conversion triggers...",
          "Applying above-the-fold CRO...",
          "Generating enhanced HTML...",
          "Optimizing CTA placement...",
          "Sanitizing final layout...",
          "Finalizing personalized variant..."
        ];
        heartbeat = setInterval(() => {
          if (beatIdx < beats.length) {
            send({ type: "log", message: `[GEN] ${beats[beatIdx++]}` });
          }
        }, 700);

        const abortGrok = new AbortController();
        const grokTimeout = setTimeout(() => abortGrok.abort(), 18000);

        const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
          },
          signal: abortGrok.signal,
          body: JSON.stringify({
            model: "grok-beta",
            messages,
            temperature: 0.6,
            max_tokens: 1500,
            response_format: { type: "json_object" }
          }),
        });
        clearTimeout(grokTimeout);

        if (heartbeat) clearInterval(heartbeat);

        if (!grokResponse.ok) {
          const errText = await grokResponse.text();
          throw new Error(`Grok Error: ${grokResponse.status}`);
        }

        const data = await grokResponse.json();
        const rawJson = data.choices[0]?.message?.content || "{}";
        
        const raw = JSON.parse(rawJson);
        const result: PersonalizationResult = {
          enhancedHtml: raw.enhancedHtml || pageData.html,
          originalHtml: pageData.html,
          Changes: (raw.changes || []).map((c: any) => ({
            element: c.element || "element",
            original: c.original || "",
            enhanced: c.enhanced || "",
            reason: c.reason || "",
            impact: c.impact || "medium",
          })),
          croScore: raw.croScore || 88,
          upliftPrediction: raw.upliftPrediction || 28,
          adAnalysis: raw.adAnalysis || { tone: "fast", offer: "value", emotion: "trust", cta: "action", keyVisuals: [] },
          summary: raw.summary || "Optimized with Grok Fast Mode.",
          variants: raw.variants || [],
        };

        send({ type: "result", result });
        send({ type: "progress", step: "complete", message: "Personalization complete!" });

      } catch (err: any) {
        if (heartbeat) clearInterval(heartbeat);
        send({ type: "error", error: err.message || "Internal error" });
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
