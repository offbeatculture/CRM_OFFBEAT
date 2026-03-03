import { useMemo, useState } from "react";
import {
  Search,
  Download,
  RefreshCcw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Users,
  CreditCard,
} from "lucide-react";

type Source = "FB" | "GA" | "Unknown";

type LeadRow = {
  id: string; // stable key (email or row_number)
  name: string;
  email: string;
  phone: string;
  timestamp: string; // keep as string
  source: Source;

  // optional marketing fields
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  fbclid?: string;

  paymentStatus: "Paid" | "Not Paid";
};

type ApiShape = {
  total_leads?: number;
  total_payments?: number;
  paid_count?: number;
  failed_count?: number;
  paid_leads?: any[];
  failed_leads?: any[];
  all_leads?: any[]; // if you add later
};

const LEADS_WEBHOOK_URL = "https://offbeatn8n.coachswastik.com/webhook/leads-crm";

const REMINDER_WEBHOOK_URL =
  "https://offbeatn8n.coachswastik.com/webhook-test/reminder-failed";

function safeEmail(v: any) {
  return String(v ?? "").trim().toLowerCase();
}

function normalizeSource(v: any): Source {
  const s = String(v ?? "").toLowerCase().trim();
  if (s === "fb" || s === "facebook") return "FB";
  if (s === "ga" || s === "google" || s === "googleads" || s === "adwords") return "GA";

  // in your screenshot you have "utm source": "ig"
  if (s === "ig" || s === "instagram") return "FB";

  return "Unknown";
}

// Try to read a date out of dd/mm/yyyy ... OR ISO ... and return Date or null
function parseAnyDate(s: string): Date | null {
  const str = String(s ?? "").trim();
  if (!str) return null;

  // dd/mm/yyyy ...
  const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d.getTime()) ? null : d;
  }

  // ISO or anything Date can parse
  const d2 = new Date(str);
  return isNaN(d2.getTime()) ? null : d2;
}

function inDateRange(rowTs: string, from?: string, to?: string) {
  const d = parseAnyDate(rowTs);
  if (!d) return true; // if timestamp missing/unparseable, don't block it

  const fromD = from ? new Date(from + "T00:00:00") : null;
  const toD = to ? new Date(to + "T23:59:59") : null;

  if (fromD && d < fromD) return false;
  if (toD && d > toD) return false;
  return true;
}

function dedupeByEmail(rows: LeadRow[]) {
  const seen = new Set<string>();
  const out: LeadRow[] = [];
  for (const r of rows) {
    const em = safeEmail(r.email);
    if (!em) continue;
    if (seen.has(em)) continue;
    seen.add(em);
    out.push(r);
  }
  return out;
}

function mapRawToLeadRow(r: any, paymentStatus: "Paid" | "Not Paid"): LeadRow {
  const name = r.name ?? r.Name ?? "";
  const email = r.email ?? r.Email ?? "";
  const phone = r.phone ?? r.Phone ?? "";
  const timestamp = r.timestamp ?? r.Timestamp ?? "";

  // You may have "utm source" (with space) in your output
  const utm_source = r.utm_source ?? r["utm source"] ?? r.utmSource ?? "";
  const utm_campaign = r.utm_campaign ?? r["utm campaign"] ?? r.utmCampaign ?? "";
  const utm_medium = r.utm_medium ?? r["utm medium"] ?? r.utmMedium ?? "";
  const utm_content = r.utm_content ?? r["utm content"] ?? r.utmContent ?? "";
  const fbclid = r.fbclid ?? r.fbClid ?? "";

  const source = normalizeSource(r.source ?? r.Source ?? utm_source);

  const rowNumber = r.row_number ?? r["row_number"] ?? r["row number"] ?? r["Row Number"];
  const id = safeEmail(email) || String(rowNumber ?? Math.random());

  return {
    id,
    name: String(name ?? ""),
    email: String(email ?? ""),
    phone: String(phone ?? ""),
    timestamp: String(timestamp ?? ""),
    source,
    utm_source: String(utm_source ?? ""),
    utm_campaign: String(utm_campaign ?? ""),
    utm_medium: String(utm_medium ?? ""),
    utm_content: String(utm_content ?? ""),
    fbclid: String(fbclid ?? ""),
    paymentStatus,
  };
}

function exportToCSV(rows: LeadRow[], filename: string) {
  if (!rows.length) return;

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Timestamp",
    "Source",
    "Payment Status",
    "utm_source",
    "utm_campaign",
    "utm_medium",
    "utm_content",
    "fbclid",
  ];

  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        esc(r.name),
        esc(r.email),
        esc(r.phone),
        esc(r.timestamp),
        esc(r.source),
        esc(r.paymentStatus),
        esc(r.utm_source),
        esc(r.utm_campaign),
        esc(r.utm_medium),
        esc(r.utm_content),
        esc(r.fbclid),
      ].join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function TableBlock({
  rows,
  showAction,
  onRemind,
  rowLoading,
}: {
  rows: LeadRow[];
  showAction?: boolean;
  onRemind?: (lead: LeadRow) => void;
  rowLoading?: Record<string, boolean>;
}) {
  return (
    <div className="bg-card rounded-xl card-shadow border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {["S.No", "Name", "Email", "Phone", "Timestamp", "Source", "Payment"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
              {showAction ? (
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-sm text-muted-foreground" colSpan={showAction ? 8 : 7}>
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.timestamp}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.source}</td>
                  <td className="px-4 py-3 text-sm">
                    {r.paymentStatus === "Paid" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-success/10 text-success">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-warning/10 text-warning">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Not Paid
                      </span>
                    )}
                  </td>

                  {showAction ? (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onRemind?.(r)}
                        disabled={!!rowLoading?.[r.id]}
                        className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-60"
                      >
                        {rowLoading?.[r.id] ? "Sending..." : "Remind Payment"}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Leads() {
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "failed" | "analysis">("all");

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"All" | "FB" | "GA" | "Unknown">("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});

  const [allLeads, setAllLeads] = useState<LeadRow[]>([]);
  const [paidLeads, setPaidLeads] = useState<LeadRow[]>([]);
  const [failedLeads, setFailedLeads] = useState<LeadRow[]>([]);

  const [totals, setTotals] = useState({
    total_leads: 0,
    total_payments: 0,
    paid_count: 0,
    failed_count: 0,
  });

  async function loadLeads() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(LEADS_WEBHOOK_URL, { method: "GET" });

      const text = await res.text();
      console.log("[Leads] status:", res.status, "ok:", res.ok, "textLen:", text.length);
      console.log("[Leads] raw preview:", text.slice(0, 300));

      if (!res.ok) throw new Error(text || "Failed to load leads");

      const parsed = text ? JSON.parse(text) : null;

      // ✅ IMPORTANT FIX: n8n can return [ { ... } ] if "All Incoming Items"
      const payload: ApiShape | null = Array.isArray(parsed) ? parsed[0] : parsed;

      console.log("[Leads] parsed type:", Array.isArray(parsed) ? "array" : typeof parsed);
      console.log("[Leads] payload keys:", payload ? Object.keys(payload as any) : "null");

      if (!payload) throw new Error("Empty response from n8n");

      const paidRaw = Array.isArray(payload.paid_leads) ? payload.paid_leads : [];
      const failedRaw = Array.isArray(payload.failed_leads) ? payload.failed_leads : [];
      const allRaw =
        Array.isArray(payload.all_leads) && payload.all_leads.length
          ? payload.all_leads
          : []; // if you later add all_leads in n8n

      const paidMapped = dedupeByEmail(paidRaw.map((r) => mapRawToLeadRow(r, "Paid")));

      // If n8n doesn't return all_leads, we build "all" as paid + failedRaw (or just leads sheet later)
      // For now: if allRaw missing, we approximate:
      // - all = paid + (failedRaw mapped as Not Paid)
      // - failed = either failedRaw OR (all - paid)
      const failedMappedFromNode = dedupeByEmail(failedRaw.map((r) => mapRawToLeadRow(r, "Not Paid")));

      let allMapped: LeadRow[] = [];
      if (allRaw.length) {
        // You provide it
        allMapped = dedupeByEmail(
          allRaw.map((r) => {
            // if it is in paid list by email => Paid else Not Paid
            const em = safeEmail(r.email ?? r.Email);
            const isPaid = paidMapped.some((p) => safeEmail(p.email) === em);
            return mapRawToLeadRow(r, isPaid ? "Paid" : "Not Paid");
          })
        );
      } else {
        // fallback: union(paid + failedRaw)
        allMapped = dedupeByEmail([...paidMapped, ...failedMappedFromNode]);
      }

      // Final failed = (all - paid) by email (most reliable)
      const paidSet = new Set(paidMapped.map((p) => safeEmail(p.email)));
      const failedComputed = dedupeByEmail(
        allMapped
          .filter((r) => {
            const em = safeEmail(r.email);
            return em && !paidSet.has(em);
          })
          .map((r) => ({ ...r, paymentStatus: "Not Paid" as const }))
      );

      setAllLeads(allMapped);
      setPaidLeads(paidMapped);
      setFailedLeads(failedComputed);

      setTotals({
        total_leads: Number(payload.total_leads ?? allMapped.length ?? 0),
        total_payments: Number(payload.total_payments ?? 0),
        paid_count: Number(payload.paid_count ?? paidMapped.length ?? 0),
        failed_count: Number(payload.failed_count ?? failedComputed.length ?? 0),
      });

      console.log("[Leads] counts:", {
        all: allMapped.length,
        paid: paidMapped.length,
        failed: failedComputed.length,
      });
    } catch (e: any) {
      console.error("[Leads] error:", e);
      setError(e?.message || "Failed to load leads");
      setAllLeads([]);
      setPaidLeads([]);
      setFailedLeads([]);
      setTotals({ total_leads: 0, total_payments: 0, paid_count: 0, failed_count: 0 });
    } finally {
      setLoading(false);
    }
  }

async function remindPayment(lead: LeadRow) {
  setRowLoading((s) => ({ ...s, [lead.id]: true }));

  try {
    const payload = {
      name: lead.name,
      phone: lead.phone,
    };

    const res = await fetch(REMINDER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("[Reminder] status:", res.status, "ok:", res.ok, "resp:", text);

    if (!res.ok) throw new Error(text || `Reminder webhook failed (${res.status})`);

    alert(`Reminder sent to ${lead.name || lead.phone}`);
  } catch (e: any) {
    console.error("[Reminder] error:", e);
    alert(e?.message || "Failed to send reminder");
  } finally {
    setRowLoading((s) => ({ ...s, [lead.id]: false }));
  }
}

  const filteredAll = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base =
      activeTab === "paid"
        ? paidLeads
        : activeTab === "failed"
        ? failedLeads
        : allLeads;

    return base.filter((l) => {
      const matchSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q);

      const matchSource = sourceFilter === "All" ? true : l.source === sourceFilter;

      const matchDate = inDateRange(l.timestamp, fromDate || undefined, toDate || undefined);

      return matchSearch && matchSource && matchDate;
    });
  }, [activeTab, search, sourceFilter, fromDate, toDate, allLeads, paidLeads, failedLeads]);

  const paidPercent = useMemo(() => {
    const denom = Math.max(1, allLeads.length);
    return Math.round((paidLeads.length / denom) * 100);
  }, [allLeads.length, paidLeads.length]);

  const failedPercent = useMemo(() => {
    const denom = Math.max(1, allLeads.length);
    return Math.round((failedLeads.length / denom) * 100);
  }, [allLeads.length, failedLeads.length]);

  function exportActive() {
    const name =
      activeTab === "paid"
        ? "paid_leads"
        : activeTab === "failed"
        ? "failed_payments"
        : "all_leads";
    exportToCSV(filteredAll, `${name}.csv`);
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Click refresh to load data
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl card-shadow p-2 flex items-center gap-2">
          <button
            onClick={loadLeads}
            disabled={loading}
            className="h-9 px-3 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60"
            title="Refresh"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            Refresh
          </button>

          <button
            onClick={exportActive}
            disabled={loading || activeTab === "analysis" || filteredAll.length === 0}
            className="h-9 px-3 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : null}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border/50 rounded-xl card-shadow p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/50">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Leads</div>
            <div className="text-lg font-semibold">{allLeads.length}</div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl card-shadow p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/50">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Paid Leads</div>
            <div className="text-lg font-semibold">{paidLeads.length}</div>
            <div className="text-xs text-muted-foreground">{paidPercent}% paid</div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl card-shadow p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/50">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Failed Payments</div>
            <div className="text-lg font-semibold">{failedLeads.length}</div>
            <div className="text-xs text-muted-foreground">{failedPercent}% failed</div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl card-shadow p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/50">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Payments Rows</div>
            <div className="text-lg font-semibold">{totals.total_payments}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border/50 rounded-xl card-shadow p-2 flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All Leads", count: allLeads.length },
          { key: "paid", label: "Paid Leads", count: paidLeads.length },
          { key: "failed", label: "Failed Payments", count: failedLeads.length },
          { key: "analysis", label: "Analysis", count: null },
        ].map((t) => {
          const isActive = activeTab === (t.key as any);
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={[
                "h-9 px-3 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/40 text-foreground hover:bg-secondary/60",
              ].join(" ")}
            >
              {t.label}
              {t.count !== null ? (
                <span
                  className={[
                    "text-xs px-2 py-0.5 rounded-full",
                    isActive ? "bg-primary-foreground/20" : "bg-secondary/70",
                  ].join(" ")}
                >
                  {t.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Filters (hide on analysis) */}
      {activeTab !== "analysis" ? (
        <div className="bg-card border border-border/50 rounded-xl card-shadow p-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-[420px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / email / phone"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm"
            />
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="All">All Sources</option>
            <option value="FB">FB</option>
            <option value="GA">GA</option>
            <option value="Unknown">Unknown</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            />
          </div>
        </div>
      ) : null}

      {/* Content */}
      {activeTab === "analysis" ? (
        <div className="bg-card border border-border/50 rounded-xl card-shadow p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-lg font-semibold text-foreground">Payment Funnel</div>
              <div className="text-sm text-muted-foreground">
                Paid vs Failed based on unique emails
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Total: <span className="text-foreground font-medium">{allLeads.length}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-medium text-foreground">
                {paidLeads.length} ({paidPercent}%)
              </span>
            </div>
            <div className="h-3 rounded-full bg-secondary/50 overflow-hidden">
              <div className="h-full bg-success/60" style={{ width: `${paidPercent}%` }} />
            </div>

            <div className="flex items-center justify-between text-sm mt-3">
              <span className="text-muted-foreground">Failed / Not Paid</span>
              <span className="font-medium text-foreground">
                {failedLeads.length} ({failedPercent}%)
              </span>
            </div>
            <div className="h-3 rounded-full bg-secondary/50 overflow-hidden">
              <div className="h-full bg-warning/70" style={{ width: `${failedPercent}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <TableBlock
          rows={filteredAll}
          showAction={activeTab === "failed"}
          onRemind={remindPayment}
          rowLoading={rowLoading}
        />
      )}

      {/* Full-page loader overlay while fetching */}
      {loading ? (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <div className="bg-card border border-border/50 rounded-xl card-shadow px-5 py-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <div className="text-sm text-foreground font-medium">Loading leads…</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}