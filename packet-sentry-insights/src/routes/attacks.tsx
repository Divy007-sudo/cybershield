import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, Cell, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Btn, CHART, Card, DataGate, FilterBar, PageHeader, tooltipStyle } from "@/components/ui-kit";
import { downloadCSV, fmt, statsBy, useDataset } from "@/lib/dataset";

export const Route = createFileRoute("/attacks")({
  head: () => ({
    meta: [
      { title: "Attack Intelligence — CyberShield" },
      { name: "description", content: "Ranked UNSW-NB15 attack categories, protocol comparisons and byte/duration analysis." },
      { property: "og:title", content: "Attack Intelligence — CyberShield" },
      { property: "og:description", content: "Attack category rankings and traffic profiles from UNSW-NB15." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Attacks,
});

function Attacks() {
  return (
    <>
      <PageHeader title="Attack Intelligence" sub="How attack categories differ in volume, protocol, bytes transferred and connection duration." />
      <DataGate>
        <FilterBar />
        <Body />
      </DataGate>
    </>
  );
}

function Body() {
  const { filtered } = useDataset();
  const cats = useMemo(() => statsBy(filtered, (r) => r.attack_cat), [filtered]);
  const protos = useMemo(() => {
    const top = statsBy(filtered, (r) => r.proto).slice(0, 10);
    return top.map((p) => {
      const a = filtered.filter((r) => r.proto === p.name && r.label === 1).length;
      return { name: p.name, Attack: a, Normal: p.count - a, rate: p.attackRate };
    });
  }, [filtered]);
  const total = filtered.length || 1;

  return (
    <div className="space-y-6">
      <Card title="Ranked categories" action={<Btn variant="ghost" onClick={() => downloadCSV("cybershield_category_summary.csv", cats.map((c, i) => ({ rank: i + 1, attack_cat: c.name, records: c.count, share_pct: +((c.count / total) * 100).toFixed(3), avg_sbytes: +c.avgSbytes.toFixed(2), avg_dbytes: +c.avgDbytes.toFixed(2), avg_dur_s: +c.avgDur.toFixed(4) })))}>Export summary CSV</Btn>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">#</th><th>Category</th><th className="text-right">Records</th><th className="w-1/4 pl-4">Share</th><th className="text-right">Avg src bytes</th><th className="text-right">Avg dst bytes</th><th className="text-right">Avg dur (s)</th></tr>
            </thead>
            <tbody className="font-mono">
              {cats.map((c, i) => (
                <tr key={c.name} className="border-t border-border">
                  <td className="py-2 text-muted-foreground">{i + 1}</td>
                  <td className={`font-sans ${c.name === "Normal" ? "text-primary" : ""}`}>{c.name}</td>
                  <td className="text-right">{fmt(c.count)}</td>
                  <td className="pl-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded bg-secondary"><div className={`h-full rounded ${c.name === "Normal" ? "bg-primary" : "bg-destructive"}`} style={{ width: `${(c.count / (cats[0]?.count || 1)) * 100}%` }} /></div>
                      <span className="w-12 text-right text-xs">{fmt((c.count / total) * 100, 1)}%</span>
                    </div>
                  </td>
                  <td className="text-right">{fmt(c.avgSbytes)}</td>
                  <td className="text-right">{fmt(c.avgDbytes)}</td>
                  <td className="text-right">{fmt(c.avgDur, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Protocol comparison — top 10 protocols, attack vs normal">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={protos}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="name" stroke={CHART.axis} fontSize={11} />
            <YAxis stroke={CHART.axis} fontSize={11} />
            <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v))} cursor={{ fill: "var(--accent)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Normal" stackId="a" fill={CHART.teal} />
            <Bar dataKey="Attack" stackId="a" fill={CHART.red} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Average bytes per record by category">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cats} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke={CHART.grid} horizontal={false} />
              <XAxis type="number" stroke={CHART.axis} fontSize={11} />
              <YAxis type="category" dataKey="name" stroke={CHART.axis} fontSize={11} width={100} />
              <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v))} cursor={{ fill: "var(--accent)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="avgSbytes" name="Avg src bytes (sbytes)" fill={CHART.palette[2]} />
              <Bar dataKey="avgDbytes" name="Avg dst bytes (dbytes)" fill={CHART.palette[4]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Average connection duration (dur, seconds)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cats} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke={CHART.grid} horizontal={false} />
              <XAxis type="number" stroke={CHART.axis} fontSize={11} />
              <YAxis type="category" dataKey="name" stroke={CHART.axis} fontSize={11} width={100} />
              <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v), 3)} cursor={{ fill: "var(--accent)" }} />
              <Bar dataKey="avgDur" name="Avg dur (s)" fill={CHART.teal} radius={[0, 6, 6, 0]}>{cats.map((_, i) => <Cell key={i} fill={CHART.color(i)} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
