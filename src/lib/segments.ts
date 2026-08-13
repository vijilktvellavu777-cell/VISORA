import type { Customer, Event } from "@prisma/client";
import { parseJson, type SegmentFilter, type SegmentRules } from "./types";

type CustomerWithEvents = Customer & { events: Event[] };

function getAttr(customer: Customer, field: string): unknown {
  if (field === "email") return customer.email;
  if (field === "phone") return customer.phone;
  if (field === "firstName") return customer.firstName;
  if (field === "lastName") return customer.lastName;
  if (field === "country") return customer.country;
  if (field === "externalId") return customer.externalId;
  const attrs = parseJson<Record<string, unknown>>(customer.attributes, {});
  return attrs[field];
}

function matchAttribute(customer: Customer, filter: Extract<SegmentFilter, { kind: "attribute" }>): boolean {
  const actual = getAttr(customer, filter.field);
  switch (filter.op) {
    case "exists":
      return actual !== undefined && actual !== null && actual !== "";
    case "eq":
      return String(actual ?? "") === String(filter.value ?? "");
    case "neq":
      return String(actual ?? "") !== String(filter.value ?? "");
    case "contains":
      return String(actual ?? "").toLowerCase().includes(String(filter.value ?? "").toLowerCase());
    case "gt":
      return Number(actual) > Number(filter.value);
    case "lt":
      return Number(actual) < Number(filter.value);
    default:
      return false;
  }
}

function matchEvent(customer: CustomerWithEvents, filter: Extract<SegmentFilter, { kind: "event" }>): boolean {
  const cutoff = filter.days
    ? new Date(Date.now() - filter.days * 24 * 60 * 60 * 1000)
    : null;
  const hits = customer.events.filter((event) => {
    if (event.name !== filter.name) return false;
    if (cutoff && event.occurredAt < cutoff) return false;
    return true;
  });
  return filter.op === "performed" ? hits.length > 0 : hits.length === 0;
}

export function customerMatchesRules(customer: CustomerWithEvents, rules: SegmentRules): boolean {
  if (!rules.filters.length) return true;
  const results = rules.filters.map((filter) =>
    filter.kind === "attribute" ? matchAttribute(customer, filter) : matchEvent(customer, filter),
  );
  return rules.op === "or" ? results.some(Boolean) : results.every(Boolean);
}

export function parseRules(raw: string): SegmentRules {
  return parseJson<SegmentRules>(raw, { op: "and", filters: [] });
}
