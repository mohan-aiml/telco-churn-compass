import type { ContractType, Customer, InternetServiceType } from "@/data/churn";

export type ContractFilter = ContractType | "all";
export type InternetFilter = InternetServiceType | "all";
export type PaymentFilter = string | "all";

export interface DashboardFilters {
  contract: ContractFilter;
  internet: InternetFilter;
  payment: PaymentFilter;
}

export const DEFAULT_FILTERS: DashboardFilters = {
  contract: "all",
  internet: "all",
  payment: "all",
};

export const CONTRACT_OPTIONS: ContractType[] = ["Month-to-month", "One year", "Two year"];
export const INTERNET_OPTIONS: InternetServiceType[] = ["DSL", "Fiber optic", "No"];
export const PAYMENT_OPTIONS = [
  "Electronic check",
  "Mailed check",
  "Bank transfer (automatic)",
  "Credit card (automatic)",
];

export function filterCustomers(customers: Customer[], f: DashboardFilters): Customer[] {
  return customers.filter(
    (c) =>
      (f.contract === "all" || c.contract === f.contract) &&
      (f.internet === "all" || c.internet === f.internet) &&
      (f.payment === "all" || c.payment === f.payment),
  );
}

export interface Kpis {
  total: number;
  churned: number;
  retained: number;
  churnRate: number; // fraction 0..1
}

export function computeKpis(customers: Customer[]): Kpis {
  const churned = customers.reduce((n, c) => n + (c.churned ? 1 : 0), 0);
  const total = customers.length;
  return {
    total,
    churned,
    retained: total - churned,
    churnRate: total > 0 ? churned / total : 0,
  };
}

export interface ChurnGroup {
  name: string;
  retained: number;
  churned: number;
  total: number;
  churnRate: number; // fraction
}

export function groupBy<T>(
  customers: Customer[],
  keyFn: (c: Customer) => string,
  order?: string[],
): ChurnGroup[] {
  const map = new Map<string, ChurnGroup>();
  for (const c of customers) {
    const key = keyFn(c);
    let g = map.get(key);
    if (!g) {
      g = { name: key, retained: 0, churned: 0, total: 0, churnRate: 0 };
      map.set(key, g);
    }
    g.total += 1;
    if (c.churned) g.churned += 1;
    else g.retained += 1;
  }
  const groups = [...map.values()];
  for (const g of groups) g.churnRate = g.total > 0 ? g.churned / g.total : 0;
  if (order) groups.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  else groups.sort((a, b) => b.total - a.total);
  return groups;
}

export const TENURE_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "0–6", min: 0, max: 6 },
  { label: "7–12", min: 7, max: 12 },
  { label: "13–24", min: 13, max: 24 },
  { label: "25–36", min: 25, max: 36 },
  { label: "37–48", min: 37, max: 48 },
  { label: "49–60", min: 49, max: 60 },
  { label: "61–72", min: 61, max: 72 },
];

export function tenureGroups(customers: Customer[]): ChurnGroup[] {
  const map = new Map<string, ChurnGroup>(
    TENURE_BUCKETS.map((b) => [
      b.label,
      { name: b.label, retained: 0, churned: 0, total: 0, churnRate: 0 } as ChurnGroup,
    ]),
  );
  for (const c of customers) {
    const bucket = TENURE_BUCKETS.find((b) => c.tenure >= b.min && c.tenure <= b.max) ?? TENURE_BUCKETS[TENURE_BUCKETS.length - 1];
    const g = map.get(bucket.label)!;
    g.total += 1;
    if (c.churned) g.churned += 1;
    else g.retained += 1;
  }
  for (const g of map.values()) g.churnRate = g.total > 0 ? g.churned / g.total : 0;
  return [...map.values()];
}

export const CHARGE_BINS: { label: string; min: number; max: number }[] = [
  { label: "$0–20", min: 0, max: 20 },
  { label: "$20–40", min: 20, max: 40 },
  { label: "$40–60", min: 40, max: 60 },
  { label: "$60–80", min: 60, max: 80 },
  { label: "$80–100", min: 80, max: 100 },
  { label: "$100+", min: 100, max: Number.POSITIVE_INFINITY },
];

export function chargeGroups(customers: Customer[]): ChurnGroup[] {
  const map = new Map<string, ChurnGroup>(
    CHARGE_BINS.map((b) => [
      b.label,
      { name: b.label, retained: 0, churned: 0, total: 0, churnRate: 0 } as ChurnGroup,
    ]),
  );
  for (const c of customers) {
    const bin = CHARGE_BINS.find((b) => c.monthly >= b.min && c.monthly < b.max) ?? CHARGE_BINS[CHARGE_BINS.length - 1];
    const g = map.get(bin.label)!;
    g.total += 1;
    if (c.churned) g.churned += 1;
    else g.retained += 1;
  }
  for (const g of map.values()) g.churnRate = g.total > 0 ? g.churned / g.total : 0;
  return [...map.values()];
}

export function meanBy(customers: Customer[], fn: (c: Customer) => number): number {
  if (customers.length === 0) return 0;
  return customers.reduce((s, c) => s + fn(c), 0) / customers.length;
}

export function churnRateOf(customers: Customer[]): number {
  if (customers.length === 0) return 0;
  return customers.filter((c) => c.churned).length / customers.length;
}

/* ---------- Formatting ---------- */

export function pct(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function money(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function num(value: number): string {
  return value.toLocaleString("en-US");
}

/* ---------- Business insights (computed from the active slice) ---------- */

export interface Insight {
  title: string;
  body: string;
  severity: "high" | "medium" | "low";
}

export interface Recommendation {
  title: string;
  body: string;
}

export function computeInsights(customers: Customer[], kpis: Kpis): Insight[] {
  if (kpis.total === 0) {
    return [
      {
        title: "No customers match the current filters",
        body: "Loosen a filter to bring customers back into the analysis.",
        severity: "low",
      },
    ];
  }

  const insights: Insight[] = [];
  const minSegment = Math.max(30, Math.round(kpis.total * 0.02));

  const contracts = groupBy(customers, (c) => c.contract, CONTRACT_OPTIONS).filter((g) => g.total >= minSegment);
  const worstContract = [...contracts].sort((a, b) => b.churnRate - a.churnRate)[0];
  if (worstContract && worstContract.churnRate > kpis.churnRate) {
    insights.push({
      title: `${worstContract.name} contracts churn most`,
      body: `${pct(worstContract.churnRate)} of ${num(worstContract.total)} ${worstContract.name.toLowerCase()} customers have churned — ${pct(
        worstContract.churnRate - kpis.churnRate,
      )} above the overall churn rate.`,
      severity: worstContract.churnRate >= 0.4 ? "high" : "medium",
    });
  }

  const payments = groupBy(customers, (c) => c.payment).filter((g) => g.total >= minSegment);
  const worstPayment = [...payments].sort((a, b) => b.churnRate - a.churnRate)[0];
  if (worstPayment && worstPayment.churnRate > kpis.churnRate) {
    insights.push({
      title: `${worstPayment.name} is the riskiest payment method`,
      body: `Customers paying by ${worstPayment.name.toLowerCase()} churn at ${pct(worstPayment.churnRate)}, versus ${pct(
        kpis.churnRate,
      )} across all methods in this slice.`,
      severity: worstPayment.churnRate >= 0.4 ? "high" : "medium",
    });
  }

  const internet = groupBy(customers, (c) => c.internet, INTERNET_OPTIONS).filter((g) => g.total >= minSegment);
  const worstInternet = [...internet].sort((a, b) => b.churnRate - a.churnRate)[0];
  if (worstInternet && worstInternet.churnRate > kpis.churnRate) {
    insights.push({
      title: `${worstInternet.name} service carries the highest churn risk`,
      body: `${pct(worstInternet.churnRate)} of ${worstInternet.name} customers churn, compared with ${pct(kpis.churnRate)} overall.`,
      severity: worstInternet.churnRate >= 0.4 ? "high" : "medium",
    });
  }

  const tenure = tenureGroups(customers);
  const early = tenure.slice(0, 2);
  const earlyTotal = early.reduce((s, g) => s + g.total, 0);
  const earlyChurned = early.reduce((s, g) => s + g.churned, 0);
  if (earlyTotal >= minSegment) {
    const earlyRate = earlyChurned / earlyTotal;
    insights.push({
      title: "The first year is the danger window",
      body: `${pct(earlyRate)} of customers with 0–12 months of tenure churn — ${earlyRate > kpis.churnRate ? "well above" : "at"} the ${pct(
        kpis.churnRate,
      )} overall rate. Late-tenure cohorts (61–72 months) churn at just ${pct(tenure[tenure.length - 1].churnRate)}.`,
      severity: earlyRate >= 0.35 ? "high" : "medium",
    });
  }

  const churners = customers.filter((c) => c.churned);
  if (churners.length > 0) {
    const m2mShare = churners.filter((c) => c.contract === "Month-to-month").length / churners.length;
    const fiberShare = churners.filter((c) => c.internet === "Fiber optic").length / churners.length;
    const avgChurned = meanBy(churners, (c) => c.monthly);
    const avgRetained = meanBy(customers.filter((c) => !c.churned), (c) => c.monthly);
    insights.push({
      title: "Churners look like high-value accounts",
      body: `Churned customers pay ${money(avgChurned)}/month on average versus ${money(avgRetained)} for retained ones — each departure costs roughly ${money(
        avgChurned * 12,
      )} in annual revenue. ${pct(m2mShare)} of churners are on month-to-month contracts and ${pct(fiberShare)} use fiber optic.`,
      severity: avgChurned > avgRetained ? "high" : "low",
    });
  }

  return insights;
}

export function computeRecommendations(insights: Insight[], kpis: Kpis): Recommendation[] {
  const recs: Recommendation[] = [];
  const churnRate = kpis.churnRate;

  recs.push({
    title: "Target month-to-month customers with a loyalty bridge",
    body: "Offer a discounted 12-month lock-in or a loyalty discount at renewal to convert flexible contracts into one- or two-year commitments before the next billing cycle.",
  });

  if (churnRate > 0.2) {
    recs.push({
      title: "Stand up a first-90-days onboarding program",
      body: "Churn concentrates in the first year. Assign a check-in call, a usage-review email series, and an early-billing welcome offer to every new account.",
    });
  }

  recs.push({
    title: "Bundle support with fiber optic plans",
    body: "Fiber customers churn at the highest rate among service types. Pair fiber with Tech Support and Online Security bundles, and proactively monitor speed and outage complaints.",
  });

  recs.push({
    title: "Move customers off manual payment methods",
    body: "Electronic check users churn far more than automatic bank-transfer or card payers. Incentivize autopay enrollment with a small monthly credit or a one-time discount.",
  });

  recs.push({
    title: "Flag high-bill, short-tenure accounts for retention outreach",
    body: `Churners skew toward higher monthly bills. Customers above ${money(70, 0)}/month with under 12 months of tenure deserve a proactive save-desk offer before they cancel.`,
  });

  if (insights.some((i) => i.severity === "high")) {
    recs.push({
      title: "Review pricing and perceived value quarterly",
      body: "Run win-back interviews with recent churners and a price-sensitivity survey on high-bill segments; adjust packaging where value perception lags the bill.",
    });
  }

  return recs;
}
