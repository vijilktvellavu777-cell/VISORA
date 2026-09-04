"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button, Card, PageHeader, inputClass } from "@/components/ui";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const SUGGESTIONS = [
  "Show my workspace stats",
  "How do I create an email campaign?",
  "What is Renderly?",
  "How does Save Draft work?",
];

function renderMessageText(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      return (
        <Link key={index} href={match[2]} className="font-medium text-primary underline">
          {match[1]}
        </Link>
      );
    }

    return (
      <span key={index}>
        {part.split("\n").map((line, lineIndex, lines) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </span>
    );
  });
}

function renderBoldText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{renderMessageText(part)}</span>;
  });
}

export function BubuChat() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi, I’m Bubu — your VISORA assistant. I can answer questions about campaigns, segments, Canvas, Content, Analytics, Planly, and Renderly. I can also summarize your workspace.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const nextMessages = [...messages, { role: "user" as const, text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/bubu/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(typeof json.error === "string" ? json.error : "Could not reach Bubu");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", text: json.reply ?? "I couldn’t generate a reply just now." },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PageHeader
        title="Bubu"
        subtitle="AI assistant for VISORA — campaigns, content, analytics, and more."
      />

      <div className="flex flex-1 flex-col gap-4 px-8 pb-8">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              disabled={busy}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <Card className="flex min-h-[60vh] flex-1 flex-col overflow-hidden p-0">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary text-white"
                        : "border border-border bg-background text-foreground"
                    }`}
                  >
                    {!isUser ? (
                      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
                        <Sparkles size={14} />
                        Bubu
                      </div>
                    ) : null}
                    <div>{renderBoldText(message.text)}</div>
                  </div>
                </div>
              );
            })}
            {busy ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    Bubu is thinking…
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-border px-5 py-4">
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={input}
                placeholder="Ask Bubu anything about VISORA…"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
                disabled={busy}
              />
              <Button
                onClick={() => {
                  if (!busy && input.trim()) void sendMessage(input);
                }}
              >
                {busy ? "…" : "Send"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
