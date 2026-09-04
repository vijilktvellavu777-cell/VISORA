import type { BubuWorkspaceContext } from "@/lib/bubu-context";
import { formatBubuContextForPrompt } from "@/lib/bubu-context";

export type BubuChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const VISORA_KNOWLEDGE = `
VISORA is a customer engagement platform. Key areas:
- Home (/): dashboard and activity overview
- Campaigns (/campaigns): one-shot messages across email, push, in-app, and WhatsApp. Use Save Draft to list campaigns.
- Audience (/audience): segments and user profiles
- Canvas (/canvas): multi-step journeys with delays and messages
- Content (/content): email templates, push, content blocks, media library
- Analytics (/analytics): reports and campaign performance
- Developer (/developer): API keys and integrations
- Planly (/planly): project and task board
- Renderly (/renderly): preview rendering for all emails
- Bubu (/bubu): this AI assistant

Campaign wizard steps: Compose → Target → Summary → Schedule.
Email can use drag-and-drop editor, HTML editor, or templates.
`;

function buildSystemPrompt(context: BubuWorkspaceContext) {
  return `You are Bubu, the friendly AI assistant for VISORA Engagement Platform.
Answer clearly and concisely. Prefer short paragraphs and bullet lists when helpful.
When relevant, mention specific VISORA pages using markdown links like [Campaigns](/campaigns).
Use the live workspace snapshot below when answering questions about the user's data.
If you don't know something, say so and suggest where in VISORA to look.

${VISORA_KNOWLEDGE}

Live workspace snapshot:
${formatBubuContextForPrompt(context)}`;
}

function wantsWorkspaceStats(message: string) {
  const text = message.toLowerCase();
  return (
    text.includes("how many") ||
    text.includes("workspace stat") ||
    text.includes("show my") ||
    text.includes("what do i have") ||
    text.includes("summary of my") ||
    (text.includes("campaign") && (text.includes("count") || text.includes("how many"))) ||
    (text.includes("segment") && (text.includes("count") || text.includes("how many")))
  );
}

function workspaceStatsReply(context: BubuWorkspaceContext) {
  const channels = Object.entries(context.campaigns.byChannel)
    .map(([channel, count]) => `- **${channel}**: ${count}`)
    .join("\n");

  const recentCampaigns =
    context.campaigns.recent.length > 0
      ? context.campaigns.recent
          .map((item) => `- ${item.name} (${item.channel}, ${item.status})`)
          .join("\n")
      : "- No campaigns yet";

  return `Here’s a snapshot of your workspace:

**Campaigns** (${context.campaigns.total} total)
- ${context.campaigns.drafts} draft · ${context.campaigns.scheduled} scheduled · ${context.campaigns.sent} sent
${channels || "- No campaigns by channel yet"}

**Recent campaigns**
${recentCampaigns}

**Segments:** ${context.segments.total}
**Canvas journeys:** ${context.canvas.total}
**Content:** ${context.content.emailTemplates} email templates · ${context.content.pushTemplates} push · ${context.content.contentBlocks} content blocks

Need help creating something? Ask me about [campaigns](/campaigns), [segments](/audience/segments), or [Renderly](/renderly) for email previews.`;
}

function keywordReply(message: string, context: BubuWorkspaceContext) {
  const text = message.toLowerCase();

  if (wantsWorkspaceStats(message)) {
    return workspaceStatsReply(context);
  }

  if (text.includes("renderly") || text.includes("render") || text.includes("preview email")) {
    return "Open [Renderly](/renderly) to preview how all your email campaigns and templates render. You can filter by campaigns or templates and switch between desktop and mobile views.";
  }

  if (text.includes("whatsapp")) {
    return "Create a WhatsApp campaign from [Campaigns](/campaigns) → **Create campaign** → **WhatsApp**. Compose your message, target an audience, review, and schedule delivery.";
  }

  if (text.includes("segment")) {
    return `You have **${context.segments.total}** segment(s). Build audiences from profile attributes and events under [Audience](/audience/segments), then attach a segment when targeting a campaign.`;
  }

  if (text.includes("campaign") || text.includes("push") || text.includes("email")) {
    return `You have **${context.campaigns.total}** campaign(s) (${context.campaigns.drafts} drafts). Create one from [Campaigns](/campaigns) → **Create campaign** — choose Email, Push, In-app, or WhatsApp. Remember to click **Save Draft** to add it to your list.`;
  }

  if (text.includes("canvas") || text.includes("journey")) {
    return `You have **${context.canvas.total}** Canvas journey(s). Canvas is for multi-step flows — open [Canvas](/canvas), create a journey, add message and delay steps, then launch to your audience.`;
  }

  if (text.includes("planly") || text.includes("task") || text.includes("project")) {
    return "Planly is your project board. Open [Planly](/planly) to create projects, add tasks, and move them from To do → In progress → Done.";
  }

  if (text.includes("content") || text.includes("template") || text.includes("media")) {
    return `Content holds reusable assets: **${context.content.emailTemplates}** email templates, **${context.content.pushTemplates}** push templates, and **${context.content.contentBlocks}** content blocks. Open [Content](/content) in the sidebar.`;
  }

  if (text.includes("analytic") || text.includes("report") || text.includes("performance")) {
    return "Analytics includes campaign performance, engagement reports, and custom reports. Open [Analytics](/analytics) from the sidebar.";
  }

  if (text.includes("save draft") || text.includes("draft")) {
    return "In the campaign wizard, click **Save Draft** to save your campaign and show it in the [Campaigns](/campaigns) list. Until you save, it stays hidden while you work.";
  }

  if (text.includes("hello") || text.includes("hi ") || text === "hi" || text.includes("hey")) {
    return `Hi! I’m Bubu. You currently have **${context.campaigns.total}** campaigns and **${context.segments.total}** segments. What would you like help with?`;
  }

  return `I’m Bubu, your VISORA assistant. I can help with campaigns (${context.campaigns.total}), segments (${context.segments.total}), Canvas, Content, Analytics, Planly, and Renderly.

Try asking:
- “Show my workspace stats”
- “How do I create an email campaign?”
- “What is Renderly?”`;
}

async function callOpenAi(messages: BubuChatMessage[], systemPrompt: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "OpenAI request failed");
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return json.choices?.[0]?.message?.content?.trim() ?? null;
}

export async function generateBubuReply(
  message: string,
  history: BubuChatMessage[],
  context: BubuWorkspaceContext,
) {
  const systemPrompt = buildSystemPrompt(context);
  const conversation: BubuChatMessage[] = [
    ...history.filter((item) => item.content.trim()),
    { role: "user", content: message },
  ];

  try {
    const llmReply = await callOpenAi(conversation, systemPrompt);
    if (llmReply) {
      return { reply: llmReply, mode: "ai" as const };
    }
  } catch {
    // Fall back to local assistant when the LLM is unavailable.
  }

  return { reply: keywordReply(message, context), mode: "local" as const };
}
