import Papa from "papaparse";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const DATASET = {
  name: "UNSW-NB15 — official training split (UNSW_NB15_training-set.csv)",
  repo: "https://huggingface.co/datasets/Mouwiya/UNSW-NB15",
  url: "https://huggingface.co/datasets/Mouwiya/UNSW-NB15/resolve/main/UNSW_NB15_training-set.csv",
  proxy: "/api/public/dataset",
  expectedRows: 175341,
  citation:
    "Moustafa, N. & Slay, J. (2015). UNSW-NB15: a comprehensive data set for network intrusion detection systems. MilCIS 2015.",
};

export type Row = {
  id: number;
  dur: number;
  proto: string;
  service: string;
  state: string;
  spkts: number;
  dpkts: number;
  sbytes: number;
  dbytes: number;
  rate: number;
  sttl: number;
  attack_cat: string;
  label: number;
};

export const COLUMNS: (keyof Row)[] = [
  "id", "dur", "proto", "service", "state", "spkts", "dpkts", "sbytes", "dbytes", "rate", "sttl", "attack_cat", "label",
];
const NUMERIC = new Set(["id", "dur", "spkts", "dpkts", "sbytes", "dbytes", "rate", "sttl", "label"]);

export type Filters = { label: string; attack_cat: string; proto: string; service: string; search: string };
export const EMPTY_FILTERS: Filters = { label: "all", attack_cat: "all", proto: "all", service: "all", search: "" };

type Status = "idle" | "loading" | "ready" | "error";
type Ctx = {
  status: Status;
  progress: number;
  error: string | null;
  rows: Row[];
  schema: string[];
  labelValues: number[];
  fetchedAt: Date | null;
  via: "direct" | "proxy" | null;
  load: () => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  filtered: Row[];
};

const DatasetCtx = createContext<Ctx | null>(null);

function parse(url: string, onProgress: (p: number) => void): Promise<{ rows: Row[]; schema: string[] }> {
  return new Promise((resolve, reject) => {
    const rows: Row[] = [];
    let schema: string[] = [];
    Papa.parse<Record<string, string>>(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      worker: false,
      transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
      chunkSize: 1024 * 1024 * 2,
      chunk: (res) => {
        if (!schema.length) schema = res.meta.fields ?? [];
        for (const r of res.data) {
          const o: Record<string, unknown> = {};
          for (const c of COLUMNS) {
            const v = (r[c] ?? "").toString().trim();
            o[c] = NUMERIC.has(c) ? Number(v) : v;
          }
          rows.push(o as Row);
        }
        const cursor = (res.meta as { cursor?: number }).cursor ?? 0;
        onProgress(Math.min(0.99, cursor / 32293018));
      },
      complete: () => resolve({ rows, schema }),
      error: (err: Error) => reject(err),
    });
  });
}

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [schema, setSchema] = useState<string[]>([]);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [via, setVia] = useState<"direct" | "proxy" | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setProgress(0);
    try {
      let res;
      let mode: "direct" | "proxy" = "direct";
      try {
        res = await parse(DATASET.url, setProgress);
      } catch {
        mode = "proxy";
        res = await parse(DATASET.proxy, setProgress);
      }
      const missing = COLUMNS.filter((c) => !res.schema.includes(c));
      if (missing.length) throw new Error(`Schema check failed — missing columns: ${missing.join(", ")}`);
      if (res.rows.length < 80000) throw new Error(`Only ${res.rows.length} rows loaded (expected ≥ 80,000).`);
      setRows(res.rows);
      setSchema(res.schema);
      setVia(mode);
      setFetchedAt(new Date());
      setProgress(1);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const labelValues = useMemo(() => [...new Set(rows.map((r) => r.label))].sort(), [rows]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filters.label === "all" || String(r.label) === filters.label) &&
        (filters.attack_cat === "all" || r.attack_cat === filters.attack_cat) &&
        (filters.proto === "all" || r.proto === filters.proto) &&
        (filters.service === "all" || r.service === filters.service) &&
        (!q || String(r.id) === q || r.state.toLowerCase().includes(q) || r.attack_cat.toLowerCase().includes(q) || r.proto.includes(q) || r.service.includes(q)),
    );
  }, [rows, filters]);

  return (
    <DatasetCtx.Provider value={{ status, progress, error, rows, schema, labelValues, fetchedAt, via, load, filters, setFilters, filtered }}>
      {children}
    </DatasetCtx.Provider>
  );
}

export function useDataset() {
  const c = useContext(DatasetCtx);
  if (!c) throw new Error("useDataset outside provider");
  return c;
}

// ---------- aggregation helpers ----------
export function countBy<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function statsBy(rows: Row[], key: (r: Row) => string) {
  const m = new Map<string, { n: number; sbytes: number; dbytes: number; dur: number; attacks: number }>();
  for (const r of rows) {
    const k = key(r);
    const s = m.get(k) ?? { n: 0, sbytes: 0, dbytes: 0, dur: 0, attacks: 0 };
    s.n++; s.sbytes += r.sbytes; s.dbytes += r.dbytes; s.dur += r.dur; s.attacks += r.label === 1 ? 1 : 0;
    m.set(k, s);
  }
  return [...m.entries()]
    .map(([name, s]) => ({
      name, count: s.n,
      avgSbytes: s.sbytes / s.n, avgDbytes: s.dbytes / s.n, avgDur: s.dur / s.n,
      totalBytes: s.sbytes + s.dbytes, attackRate: s.attacks / s.n,
    }))
    .sort((a, b) => b.count - a.count);
}

export function toCSV(data: Record<string, unknown>[]) {
  return Papa.unparse(data);
}

export function downloadCSV(name: string, data: Record<string, unknown>[]) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
export const fmtBytes = (b: number) => {
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(i ? 1 : 0)} ${u[i]}`;
};
