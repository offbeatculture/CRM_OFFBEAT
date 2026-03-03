import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import KpiCard from "@/components/KpiCard";
import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  RefreshCcw,
  Loader2,
  Download,
  Calendar,
  Filter,
  Wand2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Platform = "Meta" | "Google" | "Combined";
type MetaAccount = "Acc1" | "Acc2" | "Both";
type TabKey = "dashboard" | "prediction";

type RawRow = Record<string, any>;

type DailyRow = {
  date: string;
  day: string;

  metaSpendAcc1: number; // Meta
  metaSpendAcc2: number;
  metaLeads: number; // ✅ NOTE: this is already total meta leads across both accounts (sheet provides one leads column)
  metaSales: number;
  metaOrderbumpPct: number;
  metaCPA: number;
  metaROAS: number;

  googleSpend: number; // Google
  googleLeads: number;
  googleSales: number;
  googleCPA: number;
  googleROAS: number;

  combinedSpend: number; // Combined
  dashboardLeads: number;
  dashboardCPL: number;
};

const ADS_WEBHOOK_URL = "https://offbeatn8n.coachswastik.com/webhook/ads-spend-data";

const PIE_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
];

// IMPORTANT: do NOT send invalid header names like "" (empty) — causes “Header name must be a valid HTTP token”
async function safeFetchJson(url: string) {
  const res = await fetch(url, { method: "GET" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Request failed");
  return text ? JSON.parse(text) : null;
}

function num(v: any): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return isFinite(v) ? v : 0;

  const s = String(v).replace(/,/g, "").trim();
  if (!s) return 0;
  if (s.includes("#DIV/0")) return 0;

  const n = Number(s);
  return isFinite(n) ? n : 0;
}

function parseAnyDate(str: string): Date | null {
  const s = String(str ?? "").trim();
  if (!s) return null;

  // dd-MMM-yyyy (16-Feb-2026)
  const m1 = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (m1) {
    const dd = Number(m1[1]);
    const mon = m1[2].toLowerCase();
    const yyyy = Number(m1[3]);
    const map: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const mm = map[mon];
    if (mm === undefined) return null;
    const d = new Date(yyyy, mm, dd);
    return isNaN(d.getTime()) ? null : d;
  }

  // dd/mm/yyyy
  const m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m2) {
    const dd = Number(m2[1]);
    const mm = Number(m2[2]);
    const yyyy = Number(m2[3]);
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d.getTime()) ? null : d;
  }

  const d2 = new Date(s);
  return isNaN(d2.getTime()) ? null : d2;
}

function inRange(dateStr: string, from?: string, to?: string) {
  const d = parseAnyDate(dateStr);
  if (!d) return true;

  const fromD = from ? new Date(from + "T00:00:00") : null;
  const toD = to ? new Date(to + "T23:59:59") : null;

  if (fromD && d < fromD) return false;
  if (toD && d > toD) return false;
  return true;
}

function exportCSV(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0] ?? {});
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
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

function mapRow(r: RawRow): DailyRow | null {
  const date = String(r.col_1 ?? "").trim();
  const day = String(r.col_2 ?? "").trim();

  // Skip header row and month-total row
  if (!date || date.toLowerCase() === "month") return null;

  // Monthly total row: col_1 = "February"
  const isMonthTotal = /^[A-Za-z]+$/.test(date);
  if (isMonthTotal) return null;

  return {
    date,
    day,

    // Meta
    metaSpendAcc1: num(r.Meta),
    metaSpendAcc2: num(r.col_4),
    metaLeads: num(r.col_5),
    metaSales: num(r.col_6),
    metaOrderbumpPct: num(r.col_7),
    metaCPA: num(r.col_8),
    metaROAS: num(r.col_9),

    // Google
    googleSpend: num(r.Google),
    googleLeads: num(r.col_11),
    googleSales: num(r.col_12),
    googleCPA: num(r.col_13),
    googleROAS: num(r.col_14),

    // Combined
    combinedSpend: num(r.Combined),
    dashboardLeads: num(r.col_16),
    dashboardCPL: num(r.col_17),
  };
}

function TabButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "h-9 px-3 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary/40 text-foreground hover:bg-secondary/60",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

function Pagination({
  page,
  pageSize,
  total,
  onPrev,
  onNext,
  onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSize: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-secondary/20">
      <div className="text-xs text-muted-foreground">
        Showing <span className="text-foreground font-medium">{from}</span>–{" "}
        <span className="text-foreground font-medium">{to}</span> of{" "}
        <span className="text-foreground font-medium">{total}</span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs"
          title="Rows per page"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>

        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="h-8 px-2 rounded-md bg-secondary text-foreground disabled:opacity-60"
          title="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-xs text-muted-foreground">
          Page <span className="text-foreground font-medium">{page}</span> /{" "}
          <span className="text-foreground font-medium">{totalPages}</span>
        </div>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="h-8 px-2 rounded-md bg-secondary text-foreground disabled:opacity-60"
          title="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdsRoas() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [rows, setRows] = useState<DailyRow[]>([]);

  const [platform, setPlatform] = useState<Platform>("Combined");
  const [metaAccount, setMetaAccount] = useState<MetaAccount>("Both");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // table pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  function getMetaSpend(r: DailyRow) {
    if (metaAccount === "Acc1") return r.metaSpendAcc1;
    if (metaAccount === "Acc2") return r.metaSpendAcc2;
    return r.metaSpendAcc1 + r.metaSpendAcc2;
  }

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const parsed = await safeFetchJson(ADS_WEBHOOK_URL);

      const arr = Array.isArray(parsed) ? parsed : [];
      const mapped = arr.map(mapRow).filter(Boolean) as DailyRow[];

      mapped.sort((a, b) => {
        const da = parseAnyDate(a.date)?.getTime() ?? 0;
        const db = parseAnyDate(b.date)?.getTime() ?? 0;
        return da - db;
      });

      setRows(mapped);
      setPage(1);
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    // reset pagination when filters change (safe UX)
    return rows.filter((r) => inRange(r.date, fromDate || undefined, toDate || undefined));
  }, [rows, fromDate, toDate]);

  // keep page valid
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, safePage, pageSize]);

  const chartData = useMemo(() => {
    return filtered.map((r) => {
      if (platform === "Meta") {
        const spend = getMetaSpend(r);
        return {
          date: r.date,
          spend,
          leads: r.metaLeads, // ✅ leads are total meta leads (sheet is combined)
          roas: r.metaROAS,
          cpa: r.metaCPA,
        };
      }
      if (platform === "Google") {
        return {
          date: r.date,
          spend: r.googleSpend,
          leads: r.googleLeads,
          roas: r.googleROAS,
          cpa: r.googleCPA,
        };
      }
      return {
        date: r.date,
        spend: r.combinedSpend,
        leads: r.dashboardLeads,
        roas: r.metaROAS, // proxy
        cpa: r.dashboardCPL,
      };
    });
  }, [filtered, platform, metaAccount]);

  const totals = useMemo(() => {
    const metaSpendSelected = filtered.reduce((s, r) => s + getMetaSpend(r), 0);
    const metaSpendAll = filtered.reduce((s, r) => s + (r.metaSpendAcc1 + r.metaSpendAcc2), 0);
    const googleSpend = filtered.reduce((s, r) => s + r.googleSpend, 0);
    const combinedSpend = filtered.reduce((s, r) => s + r.combinedSpend, 0);

    const combinedLeads = filtered.reduce((s, r) => s + r.dashboardLeads, 0);
    const metaLeads = filtered.reduce((s, r) => s + r.metaLeads, 0);
    const googleLeads = filtered.reduce((s, r) => s + r.googleLeads, 0);

    const avgMetaRoas =
      filtered.length > 0 ? filtered.reduce((s, r) => s + r.metaROAS, 0) / Math.max(1, filtered.length) : 0;

    const avgGoogleRoas =
      filtered.length > 0 ? filtered.reduce((s, r) => s + r.googleROAS, 0) / Math.max(1, filtered.length) : 0;

    const avgCpl = combinedLeads > 0 ? combinedSpend / combinedLeads : 0;

    // simple trend calc (last 3 vs previous 3)
    const last = filtered.slice(-3);
    const prev = filtered.slice(-6, -3);

    const sum = (arr: DailyRow[], fn: (r: DailyRow) => number) => arr.reduce((s, r) => s + fn(r), 0);

    const lastSpend = sum(last, (r) => (platform === "Meta" ? getMetaSpend(r) : platform === "Google" ? r.googleSpend : r.combinedSpend));
    const prevSpend = sum(prev, (r) => (platform === "Meta" ? getMetaSpend(r) : platform === "Google" ? r.googleSpend : r.combinedSpend));
    const spendTrendPct = prevSpend > 0 ? ((lastSpend - prevSpend) / prevSpend) * 100 : 0;

    const lastLeads = sum(last, (r) => (platform === "Meta" ? r.metaLeads : platform === "Google" ? r.googleLeads : r.dashboardLeads));
    const prevLeads = sum(prev, (r) => (platform === "Meta" ? r.metaLeads : platform === "Google" ? r.googleLeads : r.dashboardLeads));
    const leadsTrendPct = prevLeads > 0 ? ((lastLeads - prevLeads) / prevLeads) * 100 : 0;

    return {
      metaSpendSelected,
      metaSpendAll,
      googleSpend,
      combinedSpend,
      metaLeads,
      googleLeads,
      combinedLeads,
      avgMetaRoas,
      avgGoogleRoas,
      avgCpl,
      spendTrendPct,
      leadsTrendPct,
    };
  }, [filtered, metaAccount, platform]);

  const spendPie = useMemo(
    () => [
      { name: "Meta", value: totals.metaSpendAll },
      { name: "Google", value: totals.googleSpend },
    ],
    [totals.metaSpendAll, totals.googleSpend]
  );

  const spendKpi =
    platform === "Meta"
      ? totals.metaSpendSelected
      : platform === "Google"
      ? totals.googleSpend
      : totals.combinedSpend;

  // ✅ "Total Leads" should include meta accounts 1+2 automatically.
  // In sheet: metaLeads already the combined value; so we use totals.metaLeads.
  const leadsKpi =
    platform === "Meta"
      ? totals.metaLeads
      : platform === "Google"
      ? totals.googleLeads
      : totals.combinedLeads;

  const roasKpi = platform === "Google" ? totals.avgGoogleRoas : totals.avgMetaRoas;

  function exportActive() {
    exportCSV(
      filtered.map((r) => ({
        date: r.date,
        day: r.day,
        meta_spend_acc1: r.metaSpendAcc1,
        meta_spend_acc2: r.metaSpendAcc2,
        meta_leads: r.metaLeads,
        meta_sales: r.metaSales,
        meta_roas: r.metaROAS,
        google_spend: r.googleSpend,
        google_leads: r.googleLeads,
        combined_spend: r.combinedSpend,
        dashboard_leads: r.dashboardLeads,
        dashboard_cpl: r.dashboardCPL,
      })),
      `ads_dashboard_${platform.toLowerCase()}_${platform === "Meta" ? metaAccount.toLowerCase() : "all"}.csv`
    );
  }

  // prediction (simple MVP): moving average of spend/leads and implied CPL
  const prediction = useMemo(() => {
    if (filtered.length < 3) return null;

    const last3 = filtered.slice(-3);
    const avgSpendMeta =
      last3.reduce((s, r) => s + (r.metaSpendAcc1 + r.metaSpendAcc2), 0) / 3;

    const avgSpendGoogle = last3.reduce((s, r) => s + r.googleSpend, 0) / 3;
    const avgSpendCombined = last3.reduce((s, r) => s + r.combinedSpend, 0) / 3;

    const avgLeadsMeta = last3.reduce((s, r) => s + r.metaLeads, 0) / 3;
    const avgLeadsGoogle = last3.reduce((s, r) => s + r.googleLeads, 0) / 3;
    const avgLeadsCombined = last3.reduce((s, r) => s + r.dashboardLeads, 0) / 3;

    const nextMetaCpl = avgLeadsMeta > 0 ? avgSpendMeta / avgLeadsMeta : 0;
    const nextGoogleCpl = avgLeadsGoogle > 0 ? avgSpendGoogle / avgLeadsGoogle : 0;
    const nextCombinedCpl = avgLeadsCombined > 0 ? avgSpendCombined / avgLeadsCombined : 0;

    return {
      avgSpendMeta,
      avgSpendGoogle,
      avgSpendCombined,
      avgLeadsMeta,
      avgLeadsGoogle,
      avgLeadsCombined,
      nextMetaCpl,
      nextGoogleCpl,
      nextCombinedCpl,
    };
  }, [filtered]);

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ads & ROAS</h2>
          <p className="text-sm text-muted-foreground mt-1">Refresh to load latest data from n8n</p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl card-shadow p-2 flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="h-9 px-3 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            Refresh
          </button>

          <button
            onClick={exportActive}
            disabled={loading || filtered.length === 0}
            className="h-9 px-3 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border/50 rounded-xl card-shadow p-2 flex gap-2 flex-wrap">
        <TabButton
          active={activeTab === "dashboard"}
          label="Dashboard"
          icon={<BarChart3 className="w-4 h-4" />}
          onClick={() => setActiveTab("dashboard")}
        />
        <TabButton
          active={activeTab === "prediction"}
          label="Prediction"
          icon={<Wand2 className="w-4 h-4" />}
          onClick={() => setActiveTab("prediction")}
        />
      </div>

      {error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : null}

      {/* Filters */}
      <div className="bg-card border border-border/50 rounded-xl card-shadow p-3 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value as Platform);
              setPage(1);
            }}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="Combined">Combined</option>
            <option value="Meta">Meta</option>
            <option value="Google">Google</option>
          </select>

          {platform === "Meta" ? (
            <select
              value={metaAccount}
              onChange={(e) => setMetaAccount(e.target.value as MetaAccount)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              title="Meta Account Spend Filter"
            >
              <option value="Both">Meta (Acc1 + Acc2)</option>
              <option value="Acc1">Meta Account 1</option>
              <option value="Acc2">Meta Account 2</option>
            </select>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          />
          <span className="text-xs text-muted-foreground">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>
      </div>

      {/* KPI (always visible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={`Total Spend${platform === "Meta" ? ` (${metaAccount})` : ""}`}
          value={`₹${Math.round(spendKpi).toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{
            value: `${totals.spendTrendPct >= 0 ? "+" : ""}${totals.spendTrendPct.toFixed(1)}% (last 3 vs prev 3)`,
            positive: totals.spendTrendPct >= 0,
          }}
        />

        <KpiCard
          title="Total Leads"
          value={Math.round(leadsKpi).toLocaleString()}
          icon={<Target className="w-5 h-5" />}
          trend={{
            value: `${totals.leadsTrendPct >= 0 ? "+" : ""}${totals.leadsTrendPct.toFixed(1)}% (last 3 vs prev 3)`,
            positive: totals.leadsTrendPct >= 0,
          }}
        />

        <KpiCard
          title={`Avg ROAS (${platform === "Google" ? "Google" : "Meta"})`}
          value={`${roasKpi.toFixed(2)}x`}
          icon={<TrendingUp className="w-5 h-5" />}
        />

        <KpiCard
          title="Avg CPL (Combined)"
          value={`₹${Math.round(totals.avgCpl).toLocaleString()}`}
          icon={<BarChart3 className="w-5 h-5" />}
        />
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" ? (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Spend vs Leads ({platform}
                {platform === "Meta" ? ` - ${metaAccount}` : ""})
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="spend" name="Spend" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="leads" name="Leads" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-4">ROAS Trend ({platform})</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="roas"
                    name="ROAS"
                    stroke="hsl(221, 83%, 53%)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Spend Allocation Pie */}
          <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-4">Spend Split (Meta vs Google)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={spendPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                  {spendPie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table + Pagination */}
          <div className="bg-card rounded-xl card-shadow border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    {[
                      "Date",
                      "Day",
                      "Meta Spend (Acc1)",
                      "Meta Spend (Acc2)",
                      "Meta Leads",
                      "Meta CPA",
                      "Meta ROAS",
                      "Google Spend",
                      "Google Leads",
                      "Dashboard Leads",
                      "Dashboard CPL",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-sm text-muted-foreground">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((r) => (
                      <tr key={r.date} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{r.day}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          ₹{Math.round(r.metaSpendAcc1).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          ₹{Math.round(r.metaSpendAcc2).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{r.metaLeads}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          ₹{Math.round(r.metaCPA).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {r.metaROAS.toFixed(2)}x
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          ₹{Math.round(r.googleSpend).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{r.googleLeads}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{r.dashboardLeads}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          ₹{Math.round(r.dashboardCPL).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={safePage}
              pageSize={pageSize}
              total={filtered.length}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
              onPageSize={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />
          </div>
        </>
      ) : (
        /* PREDICTION TAB */
        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-lg font-semibold text-foreground">Prediction (MVP)</div>
              <div className="text-sm text-muted-foreground">
                Uses last 3 days average as next-day estimate. We can upgrade this later.
              </div>
            </div>
          </div>

          {!prediction ? (
            <div className="text-sm text-muted-foreground">
              Not enough data for prediction. Please refresh and select at least 3 days in date range.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary/20 border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Next-day Avg Spend</div>
                <div className="text-lg font-semibold text-foreground">
                  ₹{Math.round(prediction.avgSpendCombined).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Meta: ₹{Math.round(prediction.avgSpendMeta).toLocaleString()} · Google: ₹
                  {Math.round(prediction.avgSpendGoogle).toLocaleString()}
                </div>
              </div>

              <div className="bg-secondary/20 border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Next-day Avg Leads</div>
                <div className="text-lg font-semibold text-foreground">
                  {Math.round(prediction.avgLeadsCombined).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Meta: {Math.round(prediction.avgLeadsMeta)} · Google: {Math.round(prediction.avgLeadsGoogle)}
                </div>
              </div>

              <div className="bg-secondary/20 border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Predicted CPL</div>
                <div className="text-lg font-semibold text-foreground">
                  ₹{Math.round(prediction.nextCombinedCpl).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Meta: ₹{Math.round(prediction.nextMetaCpl).toLocaleString()} · Google: ₹
                  {Math.round(prediction.nextGoogleCpl).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <div className="text-sm font-semibold text-foreground mb-2">What we can add next</div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>7-day moving average + weekly seasonality</li>
              <li>Confidence band (best/worst case)</li>
              <li>Goal-based forecast: “If spend = X, expected leads = Y”</li>
              <li>Account-level lead split (if sheet adds Meta acc1 vs acc2 leads)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Full-page loader overlay while fetching */}
      {loading ? (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <div className="bg-card border border-border/50 rounded-xl card-shadow px-5 py-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <div className="text-sm text-foreground font-medium">Loading ads data…</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}