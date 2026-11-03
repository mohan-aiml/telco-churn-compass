import { useEffect, useState } from "react";
import { BarChart3, Database, Search, Users, Lightbulb, LayoutDashboard } from "lucide-react";
import { DATASET_ROW_COUNT } from "@/data/churn";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "charts", label: "Churn Analysis", icon: BarChart3 },
  { id: "customers", label: "Customer Search", icon: Search },
  { id: "insights", label: "Insights", icon: Lightbulb },
];

function useActiveSection() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    for (const item of NAV_ITEMS) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}

export function Sidebar() {
  const active = useActiveSection();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-retained/90 text-primary-foreground">
          <Users className="size-5" aria-hidden />
        </div>
        <div>
          <p className="font-display text-lg font-bold tracking-tight">ChurnLens</p>
          <p className="text-xs text-sidebar-muted">Customer Churn Analytics</p>
        </div>
      </div>

      <div className="mx-4 mb-4 h-px bg-sidebar-border" />

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            data-active={active === id}
            className="sidebar-link"
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </a>
        ))}
      </nav>

      <div className="mx-4 mb-4 h-px bg-sidebar-border" />

      <div className="px-5 pb-6">
        <div className="rounded-xl bg-sidebar-accent p-4">
          <div className="mb-2 flex items-center gap-2 text-sidebar-accent-foreground">
            <Database className="size-3.5" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wider">Data source</p>
          </div>
          <p className="text-sm font-medium text-sidebar-accent-foreground">IBM Telco Customer Churn</p>
          <p className="mt-1 text-xs leading-relaxed text-sidebar-muted">
            {DATASET_ROW_COUNT.toLocaleString("en-US")} customer records · 21 fields · uploaded CSV
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-retained/90 text-primary-foreground">
          <Users className="size-4" aria-hidden />
        </div>
        <p className="font-display text-base font-bold tracking-tight">ChurnLens</p>
        <span className="ml-auto text-xs text-muted-foreground">IBM Telco · {DATASET_ROW_COUNT.toLocaleString("en-US")} records</span>
      </div>
      <nav className="quiet-scroll flex gap-1 overflow-x-auto px-3 pb-2">
        {NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
