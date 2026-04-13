import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { html, instruction } = await request.json();

    if (!html || !instruction) {
      return NextResponse.json({ error: "Missing html or instruction" }, { status: 400 });
    }

    const truncated = html.length > 25000 ? html.substring(0, 25000) + "<!-- truncated -->" : html;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROK_API_KEY || "dummy"}`,
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Grok API Error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const rawText = data.choices[0]?.message?.content || "";

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
