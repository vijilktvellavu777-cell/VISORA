import { interpolate, parseJson } from "./types";
import type { Customer } from "@prisma/client";

export function renderMessage(body: string, customer: Customer, extra: Record<string, string> = {}) {
  const attrs = parseJson<Record<string, unknown>>(customer.attributes, {});
  const attrVars = Object.fromEntries(
    Object.entries(attrs).map(([key, value]) => [`custom.${key}`, String(value ?? "")]),
  );
  return interpolate(body, {
    first_name: customer.firstName ?? "",
    last_name: customer.lastName ?? "",
    email: customer.email ?? "",
    external_id: customer.externalId,
    ...attrVars,
    ...extra,
  });
}

export function channelLabel(channel: string) {
  return { email: "Email", push: "Push", sms: "SMS", in_app: "In-app" }[channel] ?? channel;
}
