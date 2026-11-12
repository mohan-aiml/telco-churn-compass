import { UserMinus, UserCheck, Users, TrendingDown } from "lucide-react";
import type { Kpis } from "@/lib/churn-analytics";
import { num, pct } from "@/lib/churn-analytics";

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: typeof Users;
  tone: "navy" | "churn" | "retained";
}

const TONES: Record<KpiCardProps["tone"], { chip: string; value: string }> = {
  navy: { chip: "bg-navy/10 text-navy", value: "text-foreground" },
  churn: { chip: "bg-churn/10 text-churn", value: "text-churn" },
  retained: { chip: "bg-retained/10 text-retained", value: "text-retained" },
};

function KpiCard({ label, value, sub, icon: Icon, tone }: KpiCardProps) {
  const t = TONES[tone];
  return (
    <div className="panel p-3 sm:p-3.5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${t.chip}`}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className={`kpi-value mt-1.5 text-2xl sm:text-3xl ${t.value}`}>{value}</p>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{sub}</p>
    </div>
  );
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      <KpiCard
        label="Total Customers"
        value={num(kpis.total)}
        sub={`${num(kpis.retained + kpis.churned)} records in current view`}
        icon={Users}
        tone="navy"
      />
      <KpiCard
        label="Churned Customers"
        value={num(kpis.churned)}
        sub={`${pct(kpis.churnRate)} of customers in view`}
        icon={UserMinus}
        tone="churn"
      />
      <KpiCard
        label="Retained Customers"
        value={num(kpis.retained)}
        sub={`${pct(1 - kpis.churnRate)} of customers in view`}
        icon={UserCheck}
        tone="retained"
      />
      <KpiCard
        label="Churn Rate"
        value={pct(kpis.churnRate)}
        sub={
          kpis.total > 0
            ? `${(kpis.churnRate * 100).toFixed(1)} of every 100 customers leave`
            : "No customers in current view"
        }
        icon={TrendingDown}
        tone="churn"
      />
    </div>
  );
}
