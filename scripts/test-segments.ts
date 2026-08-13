import { customerMatchesRules } from "../src/lib/segments";
import type { Customer, Event } from "@prisma/client";

function customer(partial: Partial<Customer> & { events?: Event[] }): Customer & { events: Event[] } {
  return {
    id: "1",
    workspaceId: "w",
    externalId: "usr",
    email: "a@example.com",
    phone: null,
    firstName: "Ada",
    lastName: "Lovelace",
    country: "GB",
    timezone: null,
    attributes: JSON.stringify({ plan: "pro", ltv: 10 }),
    subscriptions: "{}",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSeenAt: new Date(),
    events: [],
    ...partial,
  };
}

function event(name: string, daysAgo: number): Event {
  return {
    id: name,
    workspaceId: "w",
    customerId: "1",
    name,
    properties: "{}",
    occurredAt: new Date(Date.now() - daysAgo * 86400000),
    createdAt: new Date(),
  };
}

const cases: { name: string; ok: boolean }[] = [];

function check(name: string, ok: boolean) {
  cases.push({ name, ok });
  if (!ok) console.error("FAIL", name);
}

const pro = customer({});
check(
  "attribute eq",
  customerMatchesRules(pro, {
    op: "and",
    filters: [{ kind: "attribute", field: "plan", op: "eq", value: "pro" }],
  }),
);
check(
  "attribute neq",
  !customerMatchesRules(pro, {
    op: "and",
    filters: [{ kind: "attribute", field: "plan", op: "eq", value: "free" }],
  }),
);

const buyer = customer({ events: [event("purchase", 3)] });
check(
  "event performed",
  customerMatchesRules(buyer, {
    op: "and",
    filters: [{ kind: "event", name: "purchase", op: "performed", days: 14 }],
  }),
);
check(
  "event outside window",
  !customerMatchesRules(customer({ events: [event("purchase", 40)] }), {
    op: "and",
    filters: [{ kind: "event", name: "purchase", op: "performed", days: 14 }],
  }),
);
check(
  "and combo",
  customerMatchesRules(buyer, {
    op: "and",
    filters: [
      { kind: "attribute", field: "plan", op: "eq", value: "pro" },
      { kind: "event", name: "purchase", op: "performed", days: 14 },
    ],
  }),
);

const failed = cases.filter((c) => !c.ok);
console.log(`${cases.length - failed.length}/${cases.length} passed`);
if (failed.length) process.exit(1);
