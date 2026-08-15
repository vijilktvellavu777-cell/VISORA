import Link from "next/link";
import {
  DollarSign,
  User,
  UserPlus,
  FileText,
  Headphones,
  Send,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui";
import { DateRangePicker, GrainSelect } from "@/components/home-controls";
import { Sparkline } from "@/components/sparkline";
import { RevenueChart } from "@/components/revenue-chart";
import type { getHomeDashboard } from "@/lib/home";

type HomeData = Awaited<ReturnType<typeof getHomeDashboard>>;

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={up ? "text-success" : "text-error"}>
      {up ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

const activityIcon = {
  user: User,
  invoice: FileText,
  ticket: Headphones,
  campaign: Send,
};

export function HomeDashboard({ data }: { data: HomeData }) {
  const cards = [
    {
      label: "Total Revenue",
      value: money(data.metrics.revenue.value),
      change: data.metrics.revenue.change,
      spark: data.metrics.revenue.spark,
      icon: DollarSign,
    },
    {
      label: "Active Users",
      value: data.metrics.active.value.toLocaleString(),
      change: data.metrics.active.change,
      spark: data.metrics.active.spark,
      icon: User,
    },
    {
      label: "New Users",
      value: data.metrics.users.value.toLocaleString(),
      change: data.metrics.users.change,
      spark: data.metrics.users.spark,
      icon: UserPlus,
    },
  ];

  const compareLabel = `${formatShort(data.priorFrom)} - ${formatShort(data.priorTo)}`;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-surface px-8 py-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
          <p className="mt-1 text-sm text-muted">Monitor key metrics and recent activity across your platform.</p>
        </div>
        <DateRangePicker from={data.from} to={data.to} grain={data.grain} />
      </div>

      <div className="grid gap-4 p-8 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-5">
              <div className="flex items-start justify-between">
                <div className="text-xs font-medium uppercase tracking-wide text-muted">{card.label}</div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={16} />
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="text-3xl font-semibold">{card.value}</div>
                  <div className="mt-2 text-sm">
                    <Change value={card.change} />
                    <span className="ml-2 text-xs text-muted">vs {compareLabel}</span>
                  </div>
                </div>
                <Sparkline values={card.spark} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 px-8 pb-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">Revenue Growth</div>
              <div className="text-sm text-muted">Total revenue over time.</div>
            </div>
            <GrainSelect from={data.from} to={data.to} grain={data.grain} />
          </div>
          <RevenueChart points={data.chart} />
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex-1 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold">Recent Activity</div>
              <Link href="/audience" className="text-sm font-medium text-primary">
                View All
              </Link>
            </div>
            {data.activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No recent activity in this range.</p>
            ) : (
              <ul className="space-y-4">
                {data.activity.map((item) => {
                  const Icon = activityIcon[item.kind];
                  return (
                    <li key={item.id} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="truncate text-xs text-muted">{item.detail}</div>
                      </div>
                      <div className="shrink-0 text-xs text-muted">
                        {formatDistanceToNow(new Date(item.at), { addSuffix: false }).replace("about ", "")}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Link
            href="/developer"
            className="flex items-center justify-between rounded-xl bg-accent px-5 py-4 text-white shadow-sm"
          >
            <div>
              <div className="font-semibold">Upgrade to Team</div>
              <div className="text-sm text-white/80">Unlock advanced features</div>
            </div>
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatShort(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}
