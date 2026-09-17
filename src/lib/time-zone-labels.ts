const LABELS: Record<string, string> = {
  "Asia/Kolkata": "(GMT+05:30) Asia/Kolkata",
  "America/New_York": "(GMT-05:00) America/New York",
  "America/Chicago": "(GMT-06:00) America/Chicago",
  "America/Los_Angeles": "(GMT-08:00) America/Los Angeles",
  UTC: "(GMT+00:00) UTC",
};

export function formatTimeZoneLabel(value: string) {
  return LABELS[value] ?? value.replace(/_/g, " ");
}
