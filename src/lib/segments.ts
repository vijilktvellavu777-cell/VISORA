import type { Customer, Event } from "@prisma/client";
import { getPrebuiltFilter, type TargetingFilterGroup } from "./campaign-targeting";
import { parseJson, type SegmentFilter, type SegmentRules } from "./types";

type CustomerWithEvents = Customer & { events: Event[] };

function getAttr(customer: Customer, field: string): unknown {
  if (field === "email") return customer.email;
  if (field === "phone") return customer.phone;
  if (field === "firstName") return customer.firstName;
  if (field === "lastName") return customer.lastName;
  if (field === "country") return customer.country;
  if (field === "externalId") return customer.externalId;
  if (field === "emailSubscribed") {
    const subscriptions = parseJson<Record<string, unknown>>(customer.subscriptions, {});
    return subscriptions.email === true ? "true" : "false";
  }
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

export function customerMatchesRules(
  customer: CustomerWithEvents,
  rules: SegmentRules,
  listMembers?: Map<string, Set<string>>,
): boolean {
  if (!rules.filters.length) return true;
  const results = rules.filters.map((filter) => {
    if (filter.kind === "attribute") return matchAttribute(customer, filter);
    if (filter.kind === "event") return matchEvent(customer, filter);
    const members = listMembers?.get(filter.listId);
    if (!members) return false;
    const email = customer.email?.toLowerCase();
    const externalId = customer.externalId.toLowerCase();
    return (email ? members.has(email) : false) || members.has(externalId);
  });
  return rules.op === "or" ? results.some(Boolean) : results.every(Boolean);
}

export function listIdsInRules(rules: SegmentRules) {
  return rules.filters.filter((filter) => filter.kind === "list").map((filter) => filter.listId);
}

function filterItemMatches(
  customer: CustomerWithEvents,
  filterId: string,
  listMembers?: Map<string, Set<string>>,
) {
  if (filterId.startsWith("list_extension:")) {
    return customerMatchesRules(
      customer,
      { op: "and", filters: [{ kind: "list", listId: filterId.slice("list_extension:".length) }] },
      listMembers,
    );
  }

  const prebuilt = getPrebuiltFilter(filterId);
  if (!prebuilt || prebuilt.rules.filters.length === 0) return false;
  return customerMatchesRules(customer, prebuilt.rules, listMembers);
}

function groupMatches(
  customer: CustomerWithEvents,
  group: TargetingFilterGroup,
  listMembers?: Map<string, Set<string>>,
) {
  if (group.filters.length === 0) return false;
  const results = group.filters.map((filter) => filterItemMatches(customer, filter.filterId, listMembers));
  return group.logic === "or" ? results.some(Boolean) : results.every(Boolean);
}

export function customerMatchesSegmentGroups(
  customer: CustomerWithEvents,
  filterGroups: TargetingFilterGroup[],
  exclusionGroups: TargetingFilterGroup[],
  listMembers?: Map<string, Set<string>>,
) {
  const included = filterGroups.some((group) => groupMatches(customer, group, listMembers));
  if (!included) return false;
  return !exclusionGroups.some((group) => groupMatches(customer, group, listMembers));
}

export function segmentGroupsAreListOnly(
  filterGroups: TargetingFilterGroup[],
  exclusionGroups: TargetingFilterGroup[],
) {
  const groups = [...filterGroups, ...exclusionGroups].filter((group) => group.filters.length > 0);
  return (
    groups.length > 0 &&
    groups.every((group) => group.filters.every((filter) => filter.filterId.startsWith("list_extension:")))
  );
}

export function countListRuleGroups(
  filterGroups: TargetingFilterGroup[],
  exclusionGroups: TargetingFilterGroup[],
  entryIdsByList: Map<string, string[]>,
) {
  function keysFor(listId: string) {
    return new Set(entryIdsByList.get(listId) ?? []);
  }

  function combine(group: TargetingFilterGroup) {
    const sets = group.filters.map((filter) =>
      keysFor(filter.filterId.slice("list_extension:".length)),
    );
    if (sets.length === 0) return new Set<string>();
    if (group.logic === "and") {
      return sets.reduce((combined, set) => new Set([...combined].filter((id) => set.has(id))));
    }
    const union = new Set<string>();
    for (const set of sets) {
      for (const id of set) union.add(id);
    }
    return union;
  }

  const included = new Set<string>();
  for (const group of filterGroups) {
    if (group.filters.length === 0) continue;
    for (const id of combine(group)) included.add(id);
  }
  for (const group of exclusionGroups) {
    if (group.filters.length === 0) continue;
    for (const id of combine(group)) included.delete(id);
  }
  return included.size;
}

export function listIdsInGroups(groups: TargetingFilterGroup[]) {
  const ids = new Set<string>();
  for (const group of groups) {
    for (const filter of group.filters) {
      if (filter.filterId.startsWith("list_extension:")) {
        ids.add(filter.filterId.slice("list_extension:".length));
      }
    }
  }
  return Array.from(ids);
}

export function parseRules(raw: string): SegmentRules {
  return parseJson<SegmentRules>(raw, { op: "and", filters: [] });
}
