import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Btn, CHART, Card, DataGate, ExcelDownload, FilterBar, PageHeader, tooltipStyle } from "@/components/ui-kit";
import { COLUMNS, countBy, downloadCSV, fmt, useDataset } from "@/lib/dataset";

export const Route = createFileRoute("/forensics")({
  head: () => ({
    meta: [
      { title: "Traffic Forensics — CyberShield" },
      { name: "description", content: "Filter, search and export individual UNSW-NB15 flow records." },
      { property: "og:title", content: "Traffic Forensics — CyberShield" },
      { property: "og:description", content: "Searchable, paginated UNSW-NB15 flow records with CSV export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Forensics,
});

function Forensics() {
  return (
    <>
      <PageHeader title="Traffic Forensics" sub="Drill into individual flow records. Filters here apply across all dashboard pages." />
      <ExcelDownload />
      <DataGate>
        <FilterBar withSearch />
        <Body />
      </DataGate>
    </>
  );
}

const PAGE = 25;

function Body() {
  const { filtered } = useDataset();
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [filtered]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const states = useMemo(() => countBy(filtered, (r) => r.state).slice(0, 10), [filtered]);
  const services = useMemo(() => countBy(filtered, (r) => r.service).slice(0, 10), [filtered]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Connection state (state) — top 10">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={states}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="name" stroke={CHART.axis} fontSize={11} />
              <YAxis stroke={CHART.axis} fontSize={11} />
              <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v))} cursor={{ fill: "var(--accent)" }} />
              <Bar dataKey="value" name="Records" fill={CHART.palette[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Service (service) — top 10, '-' = none detected">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={services}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="name" stroke={CHART.axis} fontSize={11} />
              <YAxis stroke={CHART.axis} fontSize={11} />
              <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v))} cursor={{ fill: "var(--accent)" }} />
              <Bar dataKey="value" name="Records" fill={CHART.teal} radius={[6, 6, 0, 0]}>{services.map((_, i) => <Cell key={i} fill={CHART.color(i)} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title={`Flow records · ${fmt(filtered.length)} match`}
        action={<Btn onClick={() => downloadCSV("cybershield_filtered_rows.csv", filtered as unknown as Record<string, unknown>[])} disabled={!filtered.length}>Export filtered rows CSV</Btn>}>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-xs">
            <thead className="text-left uppercase tracking-wider text-muted-foreground">
              <tr>{COLUMNS.map((c) => <th key={c} className="px-2 py-2 font-mono">{c}</th>)}</tr>
            </thead>
            <tbody className="font-mono">
              {slice.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-secondary/60">
                  {COLUMNS.map((c) => (
                    <td key={c} className={`px-2 py-1.5 ${c === "label" ? (r.label === 1 ? "text-destructive" : "text-primary") : ""}`}>
                      {typeof r[c] === "number" && c !== "id" && c !== "label" ? fmt(r[c] as number, c === "dur" || c === "rate" ? 3 : 0) : String(r[c])}
                    </td>
                  ))}
                </tr>
              ))}
              {!slice.length && <tr><td colSpan={COLUMNS.length} className="py-8 text-center text-muted-foreground">No rows match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">Page {fmt(page + 1)} / {fmt(pages)}</span>
          <div className="flex gap-2">
            <Btn variant="ghost" disabled={page === 0} onClick={() => setPage(0)}>First</Btn>
            <Btn variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Btn>
            <Btn variant="ghost" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Btn>
            <Btn variant="ghost" disabled={page >= pages - 1} onClick={() => setPage(pages - 1)}>Last</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}
