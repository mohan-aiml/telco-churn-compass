import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import type { Customer } from "@/data/churn";
import { money, num } from "@/lib/churn-analytics";

const PAGE_SIZE = 50;

function StatusBadge({ churned }: { churned: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        churned ? "bg-churn/10 text-churn" : "bg-retained/10 text-retained"
      }`}
    >
      {churned ? "Churned" : "Retained"}
    </span>
  );
}

export function CustomerSearch({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? customers.filter((c) => c.id.toLowerCase().includes(q))
      : customers;
    return matches.slice(0, PAGE_SIZE);
  }, [customers, query]);

  const totalMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? customers.filter((c) => c.id.toLowerCase().includes(q)).length : customers.length;
  }, [customers, query]);

  return (
    <section id="customers" className="scroll-mt-24">
      <div className="mb-4 mt-10">
        <h2 className="font-display text-xl font-bold tracking-tight">Customer Search</h2>
        <p className="text-sm text-muted-foreground">
          Look up any customer in the current view by ID. Results respect the active filters.
        </p>
      </div>

      <div className="panel">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer ID — e.g. 7590-VHVEG"
              className="w-full rounded-lg border border-input bg-card py-2 pr-3 pl-9 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              aria-label="Search customers by ID"
            />
          </div>
          <p className="text-xs whitespace-nowrap text-muted-foreground">
            {num(Math.min(results.length, PAGE_SIZE))} of {num(totalMatches)} shown
            {totalMatches > PAGE_SIZE ? ` · first ${PAGE_SIZE}` : ""}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <SearchX className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">No customers found</p>
            <p className="text-xs text-muted-foreground">
              {query
                ? `No customer ID in the current view matches “${query}”.`
                : "The current filters exclude every customer — try resetting them."}
            </p>
          </div>
        ) : (
          <div className="quiet-scroll overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Customer ID</th>
                  <th className="px-4 py-3 font-semibold">Gender</th>
                  <th className="px-4 py-3 font-semibold">Tenure</th>
                  <th className="px-4 py-3 font-semibold">Contract</th>
                  <th className="px-4 py-3 font-semibold">Internet</th>
                  <th className="px-4 py-3 font-semibold">Payment Method</th>
                  <th className="px-4 py-3 text-right font-semibold">Monthly</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Billed</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-2.5 font-medium tabular-nums">{c.id}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.gender}</td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{c.tenure} mo</td>
                    <td className="px-4 py-2.5">{c.contract}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.internet}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.payment}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{money(c.monthly)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{money(c.total)}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge churned={c.churned} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
