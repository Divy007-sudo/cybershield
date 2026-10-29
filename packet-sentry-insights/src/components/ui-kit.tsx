import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import excelAsset from "@/assets/cybershield_UNSW_NB15_175341.xlsx.asset.json";
import { DATASET, EMPTY_FILTERS, countBy, fmt, useDataset } from "@/lib/dataset";

export const CHART = {
  teal: "var(--primary)",
  red: "var(--destructive)",
  grid: "var(--border)",
  axis: "var(--muted-foreground)",
  palette: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"] as const,
  color: (i: number): string => ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"][i % 5] as string,
};
export const tooltipStyle = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 },
  itemStyle: { color: "var(--foreground)" },
  labelStyle: { color: "var(--muted-foreground)" },
};

const NAV = [
  { to: "/", label: "Security Overview" },
  { to: "/attacks", label: "Attack Intelligence" },
  { to: "/forensics", label: "Traffic Forensics" },
  { to: "/about", label: "About & Methodology" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow">◈</span>
            Cyber<span className="text-primary">Shield</span>
          </Link>
          <nav className="flex flex-wrap gap-1 rounded-full border border-border bg-card/60 p-1 text-sm">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-primary !text-primary-foreground font-semibold shadow-glow" }} activeOptions={{ exact: true }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <StatusPill />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        CyberShield · student project · research dataset (UNSW-NB15), not live network monitoring · web dashboard, not a Power BI report
      </footer>
    </div>
  );
}

function StatusPill() {
  const { status, rows, fetchedAt } = useDataset();
  return (
    <div className="ml-auto flex items-center gap-2 font-mono text-xs text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${status === "ready" ? "bg-primary" : status === "error" ? "bg-destructive" : "animate-pulse bg-chart-4"}`} />
      {status === "ready" ? `${fmt(rows.length)} rows · ${fetchedAt?.toLocaleTimeString()}` : status === "error" ? "load failed" : "loading…"}
    </div>
  );
}

export function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-hero px-6 py-10 text-center shadow-panel">
      <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">UNSW-NB15 · research dataset</span>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

export function ExcelDownload() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">Excel · full training dataset · 175,341 records · 13 columns · unfiltered</p>
      <Button asChild className="h-auto min-h-9 whitespace-normal text-center">
        <a href={excelAsset.url} download={excelAsset.original_filename}>
          <Download aria-hidden="true" />Download Excel (175,341 rows)
        </a>
      </Button>
    </div>
  );
}

export function Card({ title, children, action, className = "" }: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card-gradient p-5 shadow-panel ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><span className="h-3 w-1 rounded-full bg-gradient-to-b from-primary to-chart-3" />{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, hint, tone = "teal" }: { label: string; value: string; hint?: string; tone?: "teal" | "red" | "plain" }) {
  const c = tone === "teal" ? "text-primary" : tone === "red" ? "text-destructive" : "text-chart-3";
  const bar = tone === "teal" ? "from-primary to-chart-3" : tone === "red" ? "from-destructive to-chart-4" : "from-chart-3 to-chart-5";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card-gradient p-5 shadow-panel transition-shadow hover:shadow-glow">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${bar}`} />
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-mono text-3xl font-semibold ${c}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", disabled }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; disabled?: boolean }) {
  const v = variant === "primary" ? "bg-primary text-primary-foreground hover:shadow-glow" : "border border-border bg-secondary text-foreground hover:border-primary/50 hover:text-primary";
  return (
    <button disabled={disabled} onClick={onClick} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${v}`}>
      {children}
    </button>
  );
}

/** Renders loading / error states; children only render once data is ready. */
export function DataGate({ children }: { children: ReactNode }) {
  const { status, progress, error, load } = useDataset();
  if (status === "ready") return <>{children}</>;
  if (status === "error")
    return (
      <Card className="border-destructive/50">
        <h2 className="font-semibold text-destructive">Could not load the dataset</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <p className="mt-2 text-xs text-muted-foreground">Tried direct download from Hugging Face, then the server-side fallback. No figures are shown rather than showing made-up ones.</p>
        <div className="mt-4"><Btn onClick={load}>Retry</Btn></div>
      </Card>
    );
  return (
    <Card>
      <div className="text-sm">Fetching <span className="font-mono text-primary">UNSW_NB15_training-set.csv</span> (~32 MB) from Hugging Face…</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-gradient-to-r from-primary to-chart-3 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="mt-2 font-mono text-xs text-muted-foreground">{Math.round(progress * 100)}% parsed · source: {DATASET.repo}</div>
    </Card>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-input bg-secondary px-2 py-1.5 text-sm text-foreground">
        <option value="all">All</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}

export function FilterBar({ withSearch }: { withSearch?: boolean }) {
  const { rows, filters, setFilters, labelValues, filtered } = useDataset();
  const cats = countBy(rows, (r) => r.attack_cat).map((c) => ({ v: c.name, l: c.name }));
  const protos = countBy(rows, (r) => r.proto).map((c) => ({ v: c.name, l: `${c.name} (${fmt(c.value)})` }));
  const svcs = countBy(rows, (r) => r.service).map((c) => ({ v: c.name, l: `${c.name === "-" ? "- (none)" : c.name} (${fmt(c.value)})` }));
  const set = (k: keyof typeof filters) => (v: string) => setFilters({ ...filters, [k]: v });
  return (
    <Card className="mb-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Select label="Label" value={filters.label} onChange={set("label")}
          options={labelValues.map((v) => ({ v: String(v), l: v === 0 ? "0 · Normal" : v === 1 ? "1 · Attack" : String(v) }))} />
        <Select label="Attack category" value={filters.attack_cat} onChange={set("attack_cat")} options={cats} />
        <Select label="Protocol" value={filters.proto} onChange={set("proto")} options={protos} />
        <Select label="Service" value={filters.service} onChange={set("service")} options={svcs} />
        {withSearch ? (
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Search (id, state, category…)
            <input value={filters.search} onChange={(e) => set("search")(e.target.value)} placeholder="e.g. INT, 1042"
              className="rounded-md border border-input bg-secondary px-2 py-1.5 text-sm text-foreground" />
          </label>
        ) : <div />}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">{fmt(filtered.length)} of {fmt(rows.length)} rows match</span>
        <button className="text-primary hover:underline" onClick={() => setFilters(EMPTY_FILTERS)}>Reset filters</button>
      </div>
    </Card>
  );
}
