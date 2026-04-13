import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import * as cheerio from "cheerio";
import type { PersonalizationResult, CROChange } from "@/lib/types";

// ── HTML Minifier ─────────────────────────────────────────────────────────────
function minifyHtml(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, link[rel='stylesheet'], noscript, iframe, svg, canvas").remove();
  $("[class*='analytics'], [id*='analytics'], [class*='tracking']").remove();
  $("*").each((_, el) => {
    if (el.type !== "tag") return;
    const keep = ["href", "src", "alt", "placeholder", "type", "name", "id", "class", "action", "method"];
    Object.keys((el as any).attribs || {}).forEach(attr => {
      if (!keep.includes(attr)) delete (el as any).attribs[attr];
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
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrooSync/1.0)", "Accept": "text/html" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rawHtml = await res.text();
    const $ = cheerio.load(rawHtml);
    const title = $("title").text().trim() || $("h1").first().text().trim() || "Landing Page";
    const description = $("meta[name='description']").attr("content") || "";
    return { html: minifyHtml(rawHtml), title, description };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function buildSystemPrompt(): string {
  return `You are TrooSync, an elite CRO AI powered by Grok. Return a JSON object for landing page personalization based on the ad creative and original HTML. Return ONLY raw JSON.`;
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
        const adMimeType = (formData.get("adMimeType") as string) || "image/jpeg";
        const adFile = formData.get("adFile") as File | null;

        if (!landingPageUrl) {
          send({ type: "error", error: "Missing landing page URL" });
          controller.close();
          return;
        }

        send({ type: "progress", step: "analyzing-ad", message: "Analyzing ad creative..." });
        
        let imageBase64 = adBase64;
        let imageMime = adMimeType;

        if (adFile) {
          const bytes = await adFile.arrayBuffer();
          imageBase64 = Buffer.from(bytes).toString("base64");
          imageMime = adFile.type || "image/jpeg";
        }

        send({ type: "progress", step: "fetching-page", message: "Fetching landing page..." });
        const pageData = await fetchPageHtml(landingPageUrl);
        const finalHtml = pageData.html.length > 25000 ? pageData.html.substring(0, 25000) : pageData.html;

        send({ type: "progress", step: "generating", message: "Grok is personalizing your page..." });

        const messages: any[] = [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: [
            { type: "text", text: `Landing Page URL: ${landingPageUrl}\nOriginal HTML: ${finalHtml}\n\nTask: Personalize this page to match the ad.` },
          ]}
        ];

        if (imageBase64) {
          (messages[1].content as any[]).push({
            type: "image_url",
            image_url: { url: `data:${imageMime};base64,${imageBase64}` }
          });
        } else if (adUrl) {
          (messages[1].content as any[]).push({ type: "text", text: `Ad Image URL: ${adUrl}` });
        }

        heartbeat = setInterval(() => {
          send({ type: "log", message: "Grok is deep-thinking..." });
        }, 3000);

        const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROK_API_KEY || "dummy"}`,
          },
          body: JSON.stringify({
            model: "grok-3-beta",
            messages,
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        if (heartbeat) clearInterval(heartbeat);

        if (!grokResponse.ok) {
          const errText = await grokResponse.text();
          throw new Error(`Grok Error: ${grokResponse.status} - ${errText}`);
        }

        const data = await grokResponse.json();
        const rawJson = data.choices[0]?.message?.content || "{}";
        
        // Parse and clean
        let raw = JSON.parse(rawJson);
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
          croScore: raw.croScore || 85,
          upliftPrediction: raw.upliftPrediction || 25,
          adAnalysis: raw.adAnalysis || { tone: "pro", offer: "pro", emotion: "trust", cta: "action", keyVisuals: [] },
          summary: raw.summary || "Personalized with Grok.",
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
