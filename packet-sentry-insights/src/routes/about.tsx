import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/ui-kit";
import { DATASET, fmt, useDataset } from "@/lib/dataset";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Methodology — CyberShield" },
      { name: "description", content: "Student project methodology, data source and limitations for the CyberShield UNSW-NB15 dashboard." },
      { property: "og:title", content: "About & Methodology — CyberShield" },
      { property: "og:description", content: "How CyberShield loads and analyses the UNSW-NB15 dataset." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  const { status, rows, schema, labelValues, fetchedAt, via } = useDataset();
  return (
    <>
      <PageHeader title="About & Methodology" sub="CyberShield is a college data-visualisation project built on a public intrusion-detection research dataset." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Project">
          <p className="text-sm leading-relaxed">
            CyberShield is a browser-based dashboard that explores network-flow records from UNSW-NB15. It is a standalone web app —
            it is <strong>not</strong> Microsoft Power BI and not a PBIX file. It complements the separate report, presentation and DAX guide in the starter pack.
          </p>
        </Card>
        <Card title="Data source">
          <ul className="space-y-1 text-sm">
            <li><span className="text-muted-foreground">Dataset:</span> {DATASET.name}</li>
            <li><span className="text-muted-foreground">Hosted at:</span> <a className="text-primary hover:underline" href={DATASET.repo} target="_blank" rel="noreferrer">{DATASET.repo}</a></li>
            <li><span className="text-muted-foreground">Citation:</span> {DATASET.citation}</li>
            <li><span className="text-muted-foreground">Status:</span> <span className="font-mono">{status}{status === "ready" && ` · ${fmt(rows.length)} rows · ${fetchedAt?.toLocaleString()} · ${via}`}</span></li>
            <li><span className="text-muted-foreground">Verified label values:</span> <span className="font-mono">{labelValues.join(", ") || "—"}</span> (0 = normal, 1 = attack; cross-checked against attack_cat = "Normal")</li>
          </ul>
        </Card>
        <Card title="Methodology">
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>On page load the official training CSV (~32 MB) is downloaded directly from Hugging Face; if the browser is blocked, a server-side fallback streams the same file.</li>
            <li>The CSV is parsed in chunks; the header is checked for every required column before any chart renders.</li>
            <li>The loaded row count is checked (must be ≥ 80,000; official split is {fmt(DATASET.expectedRows)}).</li>
            <li>All KPIs and charts are computed in the browser from the loaded rows — nothing is pre-computed or invented.</li>
            <li>Filters (label, attack_cat, proto, service, search) apply to every page; CSV exports reflect the current filter.</li>
          </ol>
        </Card>
        <Card title="Limitations">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Research dataset generated in 2015 in a lab (IXIA PerfectStorm) — not live monitoring and not current threat data.</li>
            <li>Only the training split is loaded; the testing split (82,332 rows) is not included.</li>
            <li>The training split is intentionally attack-heavy (~68% attacks), so it does not reflect real-world traffic ratios.</li>
            <li>Only 13 of the {schema.length || 45} columns are kept in memory to stay responsive; others are not visualised.</li>
            <li>Data relies on a third-party Hugging Face mirror being available; if it goes offline, the dashboard shows an error instead of figures.</li>
          </ul>
        </Card>
        <Card title="Fields used" className="lg:col-span-2">
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            id · dur (s) · proto · service · state · spkts / dpkts (packets) · sbytes / dbytes (bytes) · rate · sttl · attack_cat · label
          </p>
          {schema.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Full schema detected ({schema.length} columns): {schema.join(", ")}</p>}
        </Card>
      </div>
    </>
  );
}
