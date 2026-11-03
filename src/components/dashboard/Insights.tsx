import { AlertTriangle, CircleAlert, Info, Lightbulb, MessageSquareQuote } from "lucide-react";
import type { Insight, Recommendation } from "@/lib/churn-analytics";

const SEVERITY = {
  high: { dot: "bg-churn", label: "High impact" },
  medium: { dot: "bg-chart-4", label: "Medium impact" },
  low: { dot: "bg-retained", label: "Watch" },
} as const;

function severityIcon(severity: Insight["severity"]) {
  if (severity === "high") return <AlertTriangle className="size-4 text-churn" aria-hidden />;
  if (severity === "medium") return <CircleAlert className="size-4 text-chart-4" aria-hidden />;
  return <Info className="size-4 text-retained" aria-hidden />;
}

export function Insights({
  insights,
  recommendations,
}: {
  insights: Insight[];
  recommendations: Recommendation[];
}) {
  return (
    <section id="insights" className="scroll-mt-24">
      <div className="mb-4 mt-10">
        <h2 className="font-display text-xl font-bold tracking-tight">Business Insights</h2>
        <p className="text-sm text-muted-foreground">
          Findings are computed from the current view, paired with recommended retention actions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Lightbulb className="size-4" aria-hidden />
            </span>
            <h3 className="panel-title text-sm sm:text-base">What the data shows</h3>
          </div>
          <ul className="space-y-3">
            {insights.map((insight) => {
              const sev = SEVERITY[insight.severity];
              return (
                <li key={insight.title} className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0">{severityIcon(insight.severity)}</span>
                    <div>
                      <p className="text-sm font-semibold">{insight.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{insight.body}</p>
                      <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground`}>
                        <span className={`size-1.5 rounded-full ${sev.dot}`} aria-hidden />
                        {sev.label}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="panel p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-navy/10 text-navy">
              <MessageSquareQuote className="size-4" aria-hidden />
            </span>
            <h3 className="panel-title text-sm sm:text-base">Retention recommendations</h3>
          </div>
          <ol className="space-y-3">
            {recommendations.map((rec, i) => (
              <li key={rec.title} className="flex gap-3">
                <span className="kpi-value mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-sm text-navy">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{rec.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{rec.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
