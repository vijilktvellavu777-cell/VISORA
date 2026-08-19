import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const reply = replyFor(message);
  return NextResponse.json({ reply });
}

function replyFor(message: string) {
  const text = message.toLowerCase();
  if (text.includes("segment")) {
    return "Use Segments to build live audiences from profile attributes and events. Open Segments → New segment, then attach that segment to a campaign.";
  }
  if (text.includes("campaign") || text.includes("push") || text.includes("email")) {
    return "Campaigns send one-shot messages. Create content in Content (push, in-app, or content cards), then send from Campaigns to a segment.";
  }
  if (text.includes("canvas") || text.includes("journey")) {
    return "Canvas is for multi-step journeys. Add message and delay steps, then launch to enroll the target segment.";
  }
  if (text.includes("planly") || text.includes("task") || text.includes("project")) {
    return "Planly is the project board. Create a project, add tasks, and move them from To do → In progress → Done.";
  }
  if (text.includes("content") || text.includes("template") || text.includes("card") || text.includes("in-app") || text.includes("inapp")) {
    return "Content holds reusable templates (Canvas, Content blocks, Email, Push) and the Media Library. Open Content in the sidebar and pick a section.";
  }
  if (text.includes("analytic") || text.includes("report")) {
    return "Analytics has Reports (Report builder, Custom event, Engagement, Revenue, Segment), Analytics (Campaign performance, Conversions), and Data build (Custom report, Designs). Open Analytics in the sidebar.";
  }
  return "I am Bubu, the VISORA assistant. I can help with Content templates, Analytics, Planly projects, campaigns, segments, and Canvas. Ask about any of those.";
}
