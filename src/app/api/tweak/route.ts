import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { html, instruction } = await request.json();

    if (!html || !instruction) {
      return NextResponse.json({ error: "Missing html or instruction" }, { status: 400 });
    }

    const truncated = html.length > 30000 ? html.substring(0, 30000) + "<!-- truncated -->" : html;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `You are an expert landing page editor. Make ONLY the following change to this HTML page:

Instruction: "${instruction}"

Current HTML:
\`\`\`html
${truncated}
\`\`\`

Return ONLY the modified HTML document. No explanation, no markdown, just the HTML.`,
        },
      ],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "";
    
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
