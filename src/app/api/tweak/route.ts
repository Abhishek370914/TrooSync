import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import OpenAI from "openai";

// xAI Grok — OpenAI-compatible API
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function POST(request: NextRequest) {
  try {
    const { html, instruction } = await request.json();

    if (!html || !instruction) {
      return NextResponse.json({ error: "Missing html or instruction" }, { status: 400 });
    }

    const truncated = html.length > 25000 ? html.substring(0, 25000) + "<!-- truncated -->" : html;

    const response = await grok.chat.completions.create({
      model: "grok-3-beta",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: "You are an expert landing page editor powered by Grok. Make ONLY the requested change to the HTML. Return ONLY the modified HTML — no explanation, no markdown fences.",
        },
        {
          role: "user",
          content: `Instruction: "${instruction}"\n\nHTML:\n${truncated}`,
        },
      ],
    });

    const rawText = response.choices[0]?.message?.content || "";

    // Strip markdown code fences if present
    let resultHtml = rawText.trim();
    const match = resultHtml.match(/```(?:html)?\s*([\s\S]*?)```/);
    if (match) resultHtml = match[1].trim();

    return NextResponse.json({ html: resultHtml });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Tweak failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
