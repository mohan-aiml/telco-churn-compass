import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import {
  CONTRACT_OPTIONS,
  DEFAULT_FILTERS,
  INTERNET_OPTIONS,
  PAYMENT_OPTIONS,
  type DashboardFilters,
} from "@/lib/churn-analytics";

interface FilterBarProps {
  filters: DashboardFilters;
  onChange: (f: DashboardFilters) => void;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const isActive = value !== "all";
  return (
    <label className="relative flex min-w-40 flex-1 flex-col gap-1.5 sm:max-w-56">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border bg-card py-2 pr-9 pl-3 text-sm font-medium shadow-xs transition-colors outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 ${
            isActive ? "border-ring/60 text-foreground" : "border-input text-foreground"
          }`}
          aria-label={label}
        >
          <option value="all">All</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    </label>
  );
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const activeCount =
    (filters.contract !== "all" ? 1 : 0) +
    (filters.internet !== "all" ? 1 : 0) +
    (filters.payment !== "all" ? 1 : 0);

  return (
    <div className="panel flex flex-wrap items-end gap-4 p-4 sm:p-5">
      <div className="flex items-center gap-2 pr-1">
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Filter className="size-4" aria-hidden />
        </span>
        <div>
          <p className="panel-title text-sm">Filters</p>
          <p className="text-xs text-muted-foreground">
            {activeCount === 0 ? "Showing all customers" : `${activeCount} active`}
          </p>
        </div>
      </div>

      <FilterSelect
        label="Contract"
        value={filters.contract}
        options={CONTRACT_OPTIONS}
        onChange={(v) => onChange({ ...filters, contract: v as DashboardFilters["contract"] })}
      />
      <FilterSelect
        label="Internet Service"
        value={filters.internet}
        options={INTERNET_OPTIONS}
        onChange={(v) => onChange({ ...filters, internet: v as DashboardFilters["internet"] })}
      />
      <FilterSelect
        label="Payment Method"
        value={filters.payment}
        options={PAYMENT_OPTIONS}
        onChange={(v) => onChange({ ...filters, payment: v })}
      />

      <button
        type="button"
        onClick={() => onChange(DEFAULT_FILTERS)}
        disabled={activeCount === 0}
        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        Reset
      </button>
    </div>
  );
}
