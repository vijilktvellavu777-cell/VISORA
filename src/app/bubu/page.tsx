"use client";

import { useState } from "react";
import { Button, Card, PageHeader, inputClass } from "@/components/ui";

type ChatMessage = { role: "user" | "assistant"; text: string };

export default function BubuPage() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi, I am Bubu. Ask me about Content, Analytics, Planly, campaigns, segments, or Canvas.",
    },
  ]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", text }]);
    setBusy(true);
    const response = await fetch("/api/bubu/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const json = await response.json();
    setMessages((current) => [...current, { role: "assistant", text: json.reply ?? json.error }]);
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Bubu" subtitle="AI assistant for VISORA." />
      <div className="flex flex-1 flex-col gap-4 p-8">
        <Card className="flex flex-1 flex-col p-5">
          <ul className="flex-1 space-y-3">
            {messages.map((message, index) => (
              <li
                key={index}
                className={`max-w-2xl rounded-xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-white"
                    : "bg-background text-foreground"
                }`}
              >
                {message.text}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input
              className={inputClass}
              value={input}
              placeholder="Ask Bubu…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <Button onClick={send}>{busy ? "…" : "Send"}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
