import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, Card, DataGate, ExcelDownload, FilterBar, Kpi, PageHeader, tooltipStyle } from "@/components/ui-kit";
import { DATASET, countBy, fmt, fmtBytes, useDataset } from "@/lib/dataset";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Security Overview — CyberShield" },
      { name: "description", content: "KPIs, attack vs normal split, attack categories and protocol mix from the UNSW-NB15 training set." },
      { property: "og:title", content: "Security Overview — CyberShield" },
      { property: "og:description", content: "UNSW-NB15 security overview dashboard (student project)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  return (
    <>
      <PageHeader title="Security Overview" sub="Summary of the UNSW-NB15 official training split, loaded live from Hugging Face. Research data — not live monitoring." />
      <ExcelDownload />
      <DataGate>
        <FilterBar />
        <OverviewBody />
      </DataGate>
    </>
  );
}

function OverviewBody() {
  const { filtered, rows, fetchedAt, via } = useDataset();
  const d = useMemo(() => {
    const attacks = filtered.filter((r) => r.label === 1).length;
    const bytes = filtered.reduce((s, r) => s + r.sbytes + r.dbytes, 0);
    const cats = countBy(filtered.filter((r) => r.label === 1), (r) => r.attack_cat);
    const protos = countBy(filtered, (r) => r.proto);
    const top = protos.slice(0, 8);
    const other = protos.slice(8).reduce((s, p) => s + p.value, 0);
    return { attacks, normal: filtered.length - attacks, bytes, cats, protos: other ? [...top, { name: `other (${protos.length - 8})`, value: other }] : top, nProto: protos.length };
  }, [filtered]);
  const n = filtered.length || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Records (filtered)" value={fmt(filtered.length)} hint={`of ${fmt(rows.length)} loaded`} tone="plain" />
        <Kpi label="Attack records (label=1)" value={fmt(d.attacks)} hint={`${fmt((d.attacks / n) * 100, 1)}% of filtered`} tone="red" />
        <Kpi label="Normal records (label=0)" value={fmt(d.normal)} hint={`${fmt((d.normal / n) * 100, 1)}% of filtered`} />
        <Kpi label="Total bytes (src+dst)" value={fmtBytes(d.bytes)} hint={`${d.nProto} distinct protocols`} tone="plain" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Attack vs normal">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={[{ name: "Normal (0)", value: d.normal }, { name: "Attack (1)", value: d.attacks }]} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={2} stroke="none">
                <Cell fill={CHART.teal} />
                <Cell fill={CHART.red} />
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />Normal</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-destructive" />Attack</span>
          </div>
        </Card>
        <Card title="Attack category distribution" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={d.cats} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke={CHART.grid} horizontal={false} />
              <XAxis type="number" stroke={CHART.axis} fontSize={11} />
              <YAxis type="category" dataKey="name" stroke={CHART.axis} fontSize={11} width={100} />
              <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v))} cursor={{ fill: "var(--accent)" }} />
              <Bar dataKey="value" name="Records" fill={CHART.red} radius={[0, 6, 6, 0]}>{d.cats.map((_, i) => <Cell key={i} fill={CHART.color(i + 1)} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="Protocol mix (top 8 + other)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={d.protos}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="name" stroke={CHART.axis} fontSize={11} />
            <YAxis stroke={CHART.axis} fontSize={11} />
            <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v))} cursor={{ fill: "var(--accent)" }} />
            <Bar dataKey="value" name="Records" fill={CHART.teal} radius={[6, 6, 0, 0]}>{d.protos.map((_, i) => <Cell key={i} fill={CHART.color(i)} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Data source">
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div><dt className="text-muted-foreground">File</dt><dd>{DATASET.name}</dd></div>
          <div><dt className="text-muted-foreground">Loaded rows (verified)</dt><dd className="font-mono">{fmt(rows.length)} {rows.length === DATASET.expectedRows ? "✓ matches official 175,341" : `(official: ${fmt(DATASET.expectedRows)})`}</dd></div>
          <div><dt className="text-muted-foreground">Host</dt><dd><a className="text-primary hover:underline" href={DATASET.repo} target="_blank" rel="noreferrer">{DATASET.repo}</a></dd></div>
          <div><dt className="text-muted-foreground">Last fetch</dt><dd className="font-mono">{fetchedAt?.toLocaleString()} · {via === "proxy" ? "via server fallback" : "direct browser download"}</dd></div>
        </dl>
      </Card>
    </div>
  );
}
