import { useMemo, useState } from "react";
import { Search, Play, Loader2, Download, BarChart3, Users, CheckCircle2, XCircle, IndianRupee } from "lucide-react";

type PersonRow = {
  name: string;
  email: string;
  phone: string;
  batchNo: string | number;
};

type N8nResponse = {
  attended: PersonRow[];
  not_attended: PersonRow[];
  paid_attended: PersonRow[];
  non_paid_attended: PersonRow[]; // computed in UI
};

type TabKey = keyof N8nResponse | "analysis";

const WEBHOOK_URL = "https://offbeatn8n.coachswastik.com/webhook/zoom-an";

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function deduplicateByEmail(rows: PersonRow[]): PersonRow[] {
  const seen = new Set<string>();
  return (rows ?? []).filter((row) => {
    const email = normEmail(row.email);
    if (!email) return false;
    if (seen.has(email)) return false;
    seen.add(email);
    return true;
  });
}

function buildEmailSet(rows: PersonRow[]) {
  const set = new Set<string>();
  for (const r of rows ?? []) {
    const e = (r.email || "").toLowerCase().trim();
    if (e) set.add(e);
  }
  return set;
}

function normEmail(v: any) {
  return String(v ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ""); // removes any hidden spaces
}

function computeNonPaidAttended(attended: PersonRow[], paidAttended: PersonRow[]) {
  const paidEmails = new Set(
    (paidAttended ?? [])
      .map((r) => normEmail(r.email))
      .filter(Boolean)
  );

  return (attended ?? []).filter((r) => {
    const e = normEmail(r.email);
    return e && !paidEmails.has(e);
  });
}


function exportToCSV(rows: PersonRow[], filename: string) {
  const safe = rows ?? [];
  if (!safe.length) return;

  const headers = ["Name", "Email", "Phone", "Batch No"];
  const csvRows = [
    headers.join(","),
    ...safe.map((r) =>
      [
        `"${String(r.name ?? "").replace(/"/g, '""')}"`,
        `"${String(r.email ?? "").replace(/"/g, '""')}"`,
        `"${String(r.phone ?? "").replace(/"/g, '""')}"`,
        `"${String(r.batchNo ?? "").replace(/"/g, '""')}"`,
      ].join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function mapRows(raw: any): PersonRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: any) => ({
    name: r.name ?? r.Name ?? "",
    email: r.email ?? r.Email ?? "",
    phone: r.phone ?? r.Phone ?? "",
    batchNo: r.batchNo ?? r["Batch No"] ?? r.batch_no ?? "",
  }));
}

/** ✅ normalize n8n response shapes */
function normalizeN8nPayload(raw: any): any {
  // n8n may return: [ { ... } ] OR [ { json: { ... } } ]
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (!first) return {};
    if (first?.json && typeof first.json === "object") return first.json;
    return first;
  }
  if (raw?.json && typeof raw.json === "object") return raw.json;
  return raw ?? {};
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl card-shadow p-4 flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-secondary/60 flex items-center justify-center">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-bold text-foreground leading-tight">{value}</div>
        {sub ? <div className="text-xs text-muted-foreground mt-1">{sub}</div> : null}
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="text-foreground font-medium">
          {value} <span className="text-muted-foreground">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
        <div className="h-2 bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TableBlock({ rows, loading }: { rows: PersonRow[]; loading: boolean }) {
  return (
    <div className="bg-card rounded-xl card-shadow border border-border/50 overflow-hidden relative">
      {loading ? (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Fetching data…
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {["S.No", "Name", "Email", "Phone", "Batch No"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={5}>
                  {loading ? " " : "No records found."}
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr
                  key={`${r.email}-${idx}`}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.batchNo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ZoomSessions() {
  const [date, setDate] = useState(todayYYYYMMDD());
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("attended");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<N8nResponse>({
    attended: [],
    not_attended: [],
    paid_attended: [],
    non_paid_attended: [],
  });

  const tabs = useMemo(
    () =>
      [
        { key: "attended", label: "Attended" },
        { key: "not_attended", label: "Not Attended" },
        { key: "paid_attended", label: "Paid Attended" },
        { key: "non_paid_attended", label: "Non-Paid Attended" },
        { key: "analysis", label: "Analysis" },
      ] as const,
    []
  );

  const activeRows =
    activeTab === "analysis" ? [] : (data[activeTab as keyof N8nResponse] ?? []);

  // ------- Analysis Metrics (computed) -------
  const totalAttended = data.attended.length;
  const totalNotAttended = data.not_attended.length;
  const totalPaid = data.paid_attended.length;
  const totalNonPaid = data.non_paid_attended.length;

  const totalLeads = totalAttended + totalNotAttended;
  const attendanceRate = totalLeads > 0 ? (totalAttended / totalLeads) * 100 : 0;
  const paidRateOnAttended = totalAttended > 0 ? (totalPaid / totalAttended) * 100 : 0;
  const dropRate = totalLeads > 0 ? (totalNotAttended / totalLeads) * 100 : 0;

  async function triggerWorkflow() {
    setError("");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Please select a valid date (yyyy-mm-dd).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, keyword }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to fetch data from n8n");

      const parsed = text ? JSON.parse(text) : {};
      const payload = normalizeN8nPayload(parsed);

      // ✅ pull from backend
      const attended = deduplicateByEmail(mapRows(payload.attended));
      const not_attended = deduplicateByEmail(mapRows(payload.not_attended));
      const paid_attended = deduplicateByEmail(mapRows(payload.paid_attended));

      // ✅ compute non paid = attended - paid
      const non_paid_attended = deduplicateByEmail(
        computeNonPaidAttended(attended, paid_attended)
      );

      const next: N8nResponse = {
        attended,
        not_attended,
        paid_attended,
        non_paid_attended,
      };

      setData(next);

      // Auto-open first non-empty tab (or analysis if everything empty)
      const firstNonEmpty =
        (tabs.find(
          (t) => t.key !== "analysis" && next[t.key as keyof N8nResponse]?.length > 0
        )?.key as TabKey) ?? "analysis";

      setActiveTab(firstNonEmpty);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function exportActive() {
    if (activeTab === "analysis") return;
    const label = tabs.find((t) => t.key === activeTab)?.label ?? String(activeTab);
    exportToCSV(activeRows, `${label.replace(/\s+/g, "_").toLowerCase()}_${date}.csv`);
  }

  return (
    <div className="space-y-6">
      {/* Header + Controls */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Zoom Sessions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Trigger your n8n report, view segments, and analyze performance
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl card-shadow p-3 flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            disabled={loading}
          />

          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="keyword"
              className="h-9 w-[220px] rounded-md border border-border bg-background pl-9 pr-3 text-sm"
              disabled={loading}
            />
          </div>

          <button
            onClick={triggerWorkflow}
            disabled={loading}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? "Running..." : "Trigger"}
          </button>

          <button
            onClick={exportActive}
            disabled={loading || activeTab === "analysis" || !activeRows.length}
            className="h-9 px-4 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-card border border-border/50 rounded-xl card-shadow p-2 flex gap-2 flex-wrap">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          const count =
            t.key === "analysis" ? "-" : (data[t.key as keyof N8nResponse]?.length ?? 0);

          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as TabKey)}
              disabled={loading}
              className={[
                "h-9 px-3 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/40 text-foreground hover:bg-secondary/60",
              ].join(" ")}
            >
              {t.key === "analysis" ? <BarChart3 className="w-4 h-4" /> : null}
              {t.label}
              <span
                className={[
                  "text-xs px-2 py-0.5 rounded-full",
                  isActive ? "bg-primary-foreground/20" : "bg-secondary/70",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "analysis" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="w-5 h-5 text-foreground" />}
              label="Total Leads (Attended + Not Attended)"
              value={String(totalLeads)}
              sub={`Attendance Rate: ${attendanceRate.toFixed(1)}%`}
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-foreground" />}
              label="Attended"
              value={String(totalAttended)}
              sub={`Non-Paid: ${totalNonPaid}`}
            />
            <StatCard
              icon={<IndianRupee className="w-5 h-5 text-foreground" />}
              label="Paid Attended"
              value={String(totalPaid)}
              sub={`Paid % of Attended: ${paidRateOnAttended.toFixed(1)}%`}
            />
            <StatCard
              icon={<XCircle className="w-5 h-5 text-foreground" />}
              label="Attendance Drop (Not Attended)"
              value={String(totalNotAttended)}
              sub={`Drop Rate: ${dropRate.toFixed(1)}%`}
            />
          </div>

          <div className="bg-card border border-border/50 rounded-xl card-shadow p-5 space-y-4">
            <div>
              <div className="text-base font-semibold text-foreground">Funnel Overview</div>
              <div className="text-sm text-muted-foreground">
                Quick view of attendance and payment conversion
              </div>
            </div>

            <div className="space-y-3">
              <FunnelBar label="Total Leads" value={totalLeads} max={totalLeads} />
              <FunnelBar label="Attended" value={totalAttended} max={totalLeads} />
              <FunnelBar label="Paid Attended" value={totalPaid} max={totalLeads} />
              <FunnelBar label="Non-Paid Attended" value={totalNonPaid} max={totalLeads} />
              <FunnelBar label="Not Attended" value={totalNotAttended} max={totalLeads} />
            </div>
          </div>
        </div>
      ) : (
        <TableBlock rows={activeRows} loading={loading} />
      )}
    </div>
  );
}