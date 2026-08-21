import { prisma } from "./db";
import { addLocalDays, formatIsoDateLocal, parseIsoDateLocal, startOfLocalDay } from "./dates";
import { parseJson } from "./types";
import { getDefaultWorkspace } from "./workspace";

export type HomeGrain = "daily" | "weekly";

export type HomePoint = { date: string; label: string; value: number };

export type HomeActivity = {
  id: string;
  title: string;
  detail: string;
  at: string;
  kind: "user" | "invoice" | "ticket" | "campaign";
};

function startOfDay(date: Date) {
  return startOfLocalDay(date);
}

function addDays(date: Date, days: number) {
  return addLocalDays(date, days);
}

export function defaultRange() {
  const to = startOfDay(new Date());
  const from = new Date(to.getFullYear(), to.getMonth(), 1);
  return { from, to: addDays(to, 1) };
}

export function parseRange(fromParam?: string, toParam?: string) {
  const fallback = defaultRange();
  const from = fromParam ? parseIsoDateLocal(fromParam) : fallback.from;
  const toExclusive = toParam ? addDays(parseIsoDateLocal(toParam), 1) : fallback.to;
  return { from, to: toExclusive };
}

function previousRange(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime();
  return { from: new Date(from.getTime() - ms), to: from };
}

function purchaseAmount(properties: string) {
  const payload = parseJson<Record<string, unknown>>(properties, {});
  const amount = payload.amount ?? payload.revenue ?? payload.value;
  const n = Number(amount);
  return Number.isFinite(n) ? n : 0;
}

function isoDay(date: Date) {
  return formatIsoDateLocal(date);
}

function formatAxis(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function series(from: Date, to: Date, grain: HomeGrain, totals: Map<string, number>): HomePoint[] {
  const points: HomePoint[] = [];
  const cursor = new Date(from);
  const step = grain === "weekly" ? 7 : 1;
  while (cursor < to) {
    const key = isoDay(cursor);
    let value = 0;
    for (let i = 0; i < step; i += 1) {
      const day = addDays(cursor, i);
      if (day >= to) break;
      value += totals.get(isoDay(day)) ?? 0;
    }
    points.push({ date: key, label: formatAxis(cursor), value });
    cursor.setDate(cursor.getDate() + step);
  }
  return points;
}

function pct(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export async function getHomeDashboard(fromParam?: string, toParam?: string, grainParam?: string) {
  const workspace = await getDefaultWorkspace();
  const grain: HomeGrain = grainParam === "weekly" ? "weekly" : "daily";
  const range = parseRange(fromParam, toParam);
  const prior = previousRange(range.from, range.to);

  const [customers, events, sends] = await Promise.all([
    prisma.customer.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, createdAt: true, lastSeenAt: true, email: true, firstName: true, lastName: true, externalId: true },
    }),
    prisma.event.findMany({
      where: { workspaceId: workspace.id, occurredAt: { gte: prior.from, lt: range.to } },
      include: { customer: true },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.campaignSend.findMany({
      where: { campaign: { workspaceId: workspace.id }, createdAt: { gte: prior.from, lt: range.to } },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const inRange = (date: Date | null, from: Date, to: Date) => !!date && date >= from && date < to;

  const revenueNow = events
    .filter((event) => event.name === "purchase" && inRange(event.occurredAt, range.from, range.to))
    .reduce((sum, event) => sum + purchaseAmount(event.properties), 0);
  const revenuePrev = events
    .filter((event) => event.name === "purchase" && inRange(event.occurredAt, prior.from, prior.to))
    .reduce((sum, event) => sum + purchaseAmount(event.properties), 0);

  const activeNow = customers.filter((c) => inRange(c.lastSeenAt, range.from, range.to)).length;
  const activePrev = customers.filter((c) => inRange(c.lastSeenAt, prior.from, prior.to)).length;
  const newNow = customers.filter((c) => inRange(c.createdAt, range.from, range.to)).length;
  const newPrev = customers.filter((c) => inRange(c.createdAt, prior.from, prior.to)).length;

  const revenueByDay = new Map<string, number>();
  for (const event of events) {
    if (event.name !== "purchase" || !inRange(event.occurredAt, range.from, range.to)) continue;
    const key = isoDay(event.occurredAt);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + purchaseAmount(event.properties));
  }

  const spark = (kind: "revenue" | "active" | "new") => {
    const totals = new Map<string, number>();
    if (kind === "revenue") return series(range.from, range.to, "daily", revenueByDay).map((p) => p.value);
    const cursor = new Date(range.from);
    while (cursor < range.to) {
      const key = isoDay(cursor);
      const next = addDays(cursor, 1);
      if (kind === "active") {
        totals.set(
          key,
          customers.filter((c) => inRange(c.lastSeenAt, cursor, next)).length,
        );
      } else {
        totals.set(
          key,
          customers.filter((c) => inRange(c.createdAt, cursor, next)).length,
        );
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return series(range.from, range.to, "daily", totals).map((p) => p.value);
  };

  const activity: HomeActivity[] = [];
  for (const customer of customers.filter((c) => inRange(c.createdAt, range.from, range.to))) {
    activity.push({
      id: `user-${customer.id}`,
      title: "New User Registered",
      detail: customer.email || customer.externalId,
      at: customer.createdAt.toISOString(),
      kind: "user",
    });
  }
  for (const event of events.filter((e) => inRange(e.occurredAt, range.from, range.to))) {
    if (event.name === "purchase") {
      activity.push({
        id: `inv-${event.id}`,
        title: "Invoice Paid",
        detail: `Amount: $${purchaseAmount(event.properties).toLocaleString()}`,
        at: event.occurredAt.toISOString(),
        kind: "invoice",
      });
    }
  }
  for (const send of sends.filter((s) => inRange(s.createdAt, range.from, range.to))) {
    activity.push({
      id: `send-${send.id}`,
      title: "Campaign Sent",
      detail: send.campaign.name,
      at: send.createdAt.toISOString(),
      kind: "campaign",
    });
  }

  activity.sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return {
    from: isoDay(range.from),
    to: isoDay(addDays(range.to, -1)),
    priorFrom: isoDay(prior.from),
    priorTo: isoDay(addDays(prior.to, -1)),
    grain,
    metrics: {
      revenue: { value: revenueNow, change: pct(revenueNow, revenuePrev), spark: spark("revenue") },
      active: { value: activeNow, change: pct(activeNow, activePrev), spark: spark("active") },
      users: { value: newNow, change: pct(newNow, newPrev), spark: spark("new") },
    },
    chart: series(range.from, range.to, grain, revenueByDay),
    activity: activity.slice(0, 4),
  };
}
