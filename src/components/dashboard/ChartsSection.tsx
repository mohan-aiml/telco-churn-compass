import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Customer } from "@/data/churn";
import {
  chargeGroups,
  CONTRACT_OPTIONS,
  groupBy,
  INTERNET_OPTIONS,
  num,
  pct,
  tenureGroups,
  type ChurnGroup,
} from "@/lib/churn-analytics";

const CHURN_COLOR = "var(--color-churn)";
const RETAINED_COLOR = "var(--color-retained)";
const GRID_COLOR = "var(--color-border)";

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  fontSize: 13,
  color: "var(--color-foreground)",
  boxShadow: "0 8px 24px -12px oklch(0.2 0.04 260 / 0.25)",
};

const axisTick = { fontSize: 12, fill: "var(--color-muted-foreground)" };

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function ChartPanel({
  title,
  subtitle,
  children,
  className = "",
  compact = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`panel ${compact ? "p-2" : "p-3"} ${className}`}>
      <div className={compact ? "mb-1" : "mb-2"}>
        <h3 className={`panel-title ${compact ? "text-xs" : "text-sm"}`}>{title}</h3>
        <p className={`mt-0.5 text-muted-foreground ${compact ? "text-[10px]" : "text-[11px]"}`}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function GroupTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChurnGroup }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const g = payload[0]?.payload;
  if (!g) return null;
  return (
    <div className="rounded-lg px-3 py-2 shadow-xl" style={tooltipStyle}>
      <p className="mb-1 text-sm font-semibold">{g.name}</p>
      <p className="text-xs">Retained: {num(g.retained)}</p>
      <p className="text-xs">Churned: {num(g.churned)}</p>
      <p className="text-xs">Total: {num(g.total)}</p>
      <p className="mt-1 text-xs font-semibold" style={{ color: CHURN_COLOR }}>
        Churn rate: {pct(g.churnRate)}
      </p>
    </div>
  );
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: { name?: string; value?: number }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  if (!entry) return null;
  return (
    <div className="rounded-lg px-3 py-2 shadow-xl" style={tooltipStyle}>
      <p className="text-sm font-semibold">{entry.name}</p>
      <p className="text-xs">{num(entry.value ?? 0)} customers</p>
    </div>
  );
}

const legendStyle = { fontSize: 12, color: "var(--color-muted-foreground)", paddingTop: 8 };

function ChartSkeleton({ height = 184 }: { height?: number }) {
  return <div className="animate-pulse rounded-lg bg-muted" style={{ height }} />;
}

const compactLegendStyle = { ...legendStyle, paddingTop: 2 };
const compactAxisTick = { ...axisTick, fontSize: 10 };

function StackedBars({
  data,
  layout = "horizontal",
  height = 184,
  categoryWidth = 40,
  compact = false,
}: {
  data: ChurnGroup[];
  layout?: "horizontal" | "vertical";
  height?: number;
  categoryWidth?: number;
  compact?: boolean;
}) {
  const tick = compact ? compactAxisTick : axisTick;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 4, right: 8, left: layout === "vertical" ? 8 : -12, bottom: 0 }} barCategoryGap="24%">
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={layout === "vertical"} horizontal={layout === "horizontal"} />
        {layout === "horizontal" ? (
          <>
            <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={{ stroke: GRID_COLOR }} interval={0} />
            <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
          </>
        ) : (
          <>
            <XAxis type="number" tick={tick} tickLine={false} axisLine={{ stroke: GRID_COLOR }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={tick} tickLine={false} axisLine={false} width={categoryWidth} />
          </>
        )}
        <Tooltip content={<GroupTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
        <Legend wrapperStyle={compact ? compactLegendStyle : legendStyle} iconType="circle" iconSize={8} />
        <Bar dataKey="retained" name="Retained" stackId="churn" fill={RETAINED_COLOR} radius={layout === "horizontal" ? [0, 0, 0, 0] : [0, 0, 0, 0]} maxBarSize={48} />
        <Bar dataKey="churned" name="Churned" stackId="churn" fill={CHURN_COLOR} radius={layout === "horizontal" ? [4, 4, 0, 0] : [0, 4, 4, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RateOverBins({
  data,
  height = 184,
}: {
  data: ChurnGroup[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID_COLOR }} interval={0} />
        <YAxis yAxisId="left" tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          domain={[0, 1]}
          tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
          width={44}
        />
        <Tooltip content={<GroupTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar yAxisId="left" dataKey="retained" name="Retained" stackId="churn" fill={RETAINED_COLOR} maxBarSize={48} />
        <Bar yAxisId="left" dataKey="churned" name="Churned" stackId="churn" fill={CHURN_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="churnRate"
          name="Churn rate"
          stroke={CHURN_COLOR}
          strokeWidth={2.5}
          dot={{ r: 3, fill: CHURN_COLOR, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ChartsSection({ customers, view }: { customers: Customer[]; view: "overview" | "analysis" }) {
  const mounted = useMounted();

  const kpis = useMemo(() => {
    const churned = customers.filter((c) => c.churned).length;
    return { total: customers.length, churned, retained: customers.length - churned };
  }, [customers]);

  const contractData = useMemo(() => groupBy(customers, (c) => c.contract, CONTRACT_OPTIONS), [customers]);
  const paymentData = useMemo(() => groupBy(customers, (c) => c.payment), [customers]);
  const internetData = useMemo(() => groupBy(customers, (c) => c.internet, INTERNET_OPTIONS), [customers]);
  const tenureData = useMemo(() => tenureGroups(customers), [customers]);
  const chargeData = useMemo(() => chargeGroups(customers), [customers]);
  const genderData = useMemo(() => groupBy(customers, (c) => c.gender, ["Female", "Male"]), [customers]);

  const donutData = useMemo(
    () => [
      { name: "Retained", value: kpis.retained },
      { name: "Churned", value: kpis.churned },
    ],
    [kpis],
  );

  const empty = kpis.total === 0;

  if (view === "overview") {
    return (
      <section id="overview-charts" className="mt-1 scroll-mt-24" aria-label="Executive churn charts">
        {empty ? (
          <div className="panel p-6 text-center text-sm text-muted-foreground">
            No customers match the current filters. Reset a filter to bring the charts back.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ChartPanel title="Customer Churn Distribution" subtitle="Share of retained vs churned customers" compact>
              {mounted ? (
                <div className="relative">
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="62%"
                        outerRadius="88%"
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        <Cell fill={RETAINED_COLOR} />
                        <Cell fill={CHURN_COLOR} />
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                      <Legend wrapperStyle={compactLegendStyle} iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: 30 }}>
                    <span className="kpi-value text-2xl">{num(kpis.total)}</span>
                    <span className="text-[10px] text-muted-foreground">customers · {pct(kpis.churned / kpis.total)} churn</span>
                  </div>
                </div>
              ) : (
                <ChartSkeleton height={150} />
              )}
            </ChartPanel>

            <ChartPanel title="Churn by Contract Type" subtitle="Customer counts by contract" compact>
              {mounted ? <StackedBars data={contractData} height={150} compact /> : <ChartSkeleton height={150} />}
            </ChartPanel>

            <ChartPanel title="Churn by Payment Method" subtitle="Retained vs churned by payment method" compact>
              {mounted ? <StackedBars data={paymentData} height={150} compact /> : <ChartSkeleton height={150} />}
            </ChartPanel>

            <ChartPanel title="Churn by Internet Service" subtitle="Retained vs churned by internet service" compact>
              {mounted ? <StackedBars data={internetData} height={150} compact /> : <ChartSkeleton height={150} />}
            </ChartPanel>
          </div>
        )}
      </section>
    );
  }

  return (
    <section id="charts" className="scroll-mt-24">
      <div className="mb-2 mt-3">
        <h2 className="font-display text-lg font-bold tracking-tight">Churn Analysis</h2>
        <p className="text-xs text-muted-foreground">Every chart recomputes from the customers passing the active filters.</p>
      </div>

      {empty ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">
          No customers match the current filters. Reset a filter to bring the charts back.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
          <ChartPanel title="Churn by Gender" subtitle="Churn is broadly balanced across genders">
            {mounted ? <StackedBars data={genderData} /> : <ChartSkeleton />}
          </ChartPanel>

          <ChartPanel title="Churn by Tenure" subtitle="Months with the company — early tenure is the danger window">
            {mounted ? <RateOverBins data={tenureData} /> : <ChartSkeleton />}
          </ChartPanel>

          <ChartPanel
            title="Monthly Charges vs Churn"
            subtitle="Churn rate across monthly bill ranges"
            className="xl:col-span-2"
          >
            {mounted ? <RateOverBins data={chargeData} /> : <ChartSkeleton />}
          </ChartPanel>
        </div>
      )}
    </section>
  );
}
