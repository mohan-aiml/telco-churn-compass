import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";

import { customers, DATASET_ROW_COUNT } from "@/data/churn";
import {
  computeInsights,
  computeKpis,
  computeRecommendations,
  DEFAULT_FILTERS,
  filterCustomers,
  type DashboardFilters,
} from "@/lib/churn-analytics";
import { Sidebar, MobileNav } from "@/components/dashboard/Sidebar";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { CustomerSearch } from "@/components/dashboard/CustomerSearch";
import { Insights } from "@/components/dashboard/Insights";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Customer Churn Analytics Dashboard" },
      {
        name: "description",
        content:
          "Interactive churn dashboard on the IBM Telco customer dataset: live KPIs, churn breakdowns by contract, payment and internet service, customer search and retention recommendations.",
      },
      { property: "og:title", content: "Customer Churn Analytics Dashboard" },
      {
        property: "og:description",
        content:
          "Live churn KPIs, risk segments by contract, payment and internet service, customer lookup and retention playbooks — computed from the IBM Telco dataset.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Customer Churn Analytics Dashboard" },
      {
        name: "twitter:description",
        content:
          "Live churn KPIs, risk segments by contract, payment and internet service, customer lookup and retention playbooks — computed from the IBM Telco dataset.",
      },
    ],
  }),
  component: DashboardPage,
});

function SectionIntro({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
      <div id={id} className="mb-1 mt-1 scroll-mt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      <h2 className="font-display mt-0.5 text-lg font-bold tracking-tight">{title}</h2>
      {children ? <p className="text-xs text-muted-foreground">{children}</p> : null}
    </div>
  );
}

function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => filterCustomers(customers, filters), [filters]);
  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const insights = useMemo(() => computeInsights(filtered, kpis), [filtered, kpis]);
  const recommendations = useMemo(() => computeRecommendations(insights, kpis), [insights, kpis]);

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <MobileNav />

      <div className="lg:pl-56">
        <main className="mx-auto max-w-[1680px] px-4 py-2 sm:px-5 lg:px-6 lg:py-3">
          <header className="mb-1 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Executive dashboard
              </p>
              <h1 className="font-display mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
                Customer Churn Analytics
              </h1>
              <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
                Live churn drivers and retention performance from the IBM Telco dataset.
              </p>
            </div>
          </header>

          <section id="overview" className="scroll-mt-24 space-y-1">
            <SectionIntro eyebrow="Overview" title="Key performance indicators">
              All figures recalculate against the filters below.
            </SectionIntro>
            <KpiCards kpis={kpis} />
            <FilterBar filters={filters} onChange={setFilters} />
            <ChartsSection customers={filtered} view="overview" />
          </section>

          <ChartsSection customers={filtered} view="analysis" />
          <CustomerSearch customers={filtered} />
          <Insights insights={insights} recommendations={recommendations} />

          <footer className="mt-12 flex flex-wrap items-center gap-2 border-t border-border py-6 text-xs text-muted-foreground">
            <Database className="size-3.5" aria-hidden />
            <span>
              Source: customer_churn_cleaned.csv · IBM Telco Customer Churn ·{" "}
              {DATASET_ROW_COUNT.toLocaleString("en-US")} records. Every KPI and chart on this page is
              computed directly from that file.
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
