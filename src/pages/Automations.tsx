import { useMemo, useState } from "react";
import { Loader2, Save, Percent, BarChart3, Trash2, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CONFIG_UPDATE_URL = "https://offbeatn8n.coachswastik.com/webhook/split-ghm";

const VARIANT_1 = "form1";
const VARIANT_2 = "form2";

type SplitConfig = {
  headline1: string;
  headline2: string;
  pct1: number; // 0-100
};

function clampPct(n: number) {
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** ---------- LOCAL TEST HELPERS ---------- */
const LOCAL_KEY = "ghm_ab_variant_v1_test"; // local test bucket key

function assignVariant(pct1: number) {
  // deterministic per "user" simulation? For local testing we want random.
  const r = Math.random() * 100;
  return r < pct1 ? VARIANT_1 : VARIANT_2;
}

export default function Automations() {
  const { toast } = useToast();

  const [config, setConfig] = useState<SplitConfig>({
    headline1: "Join the Workshop — Hit Your Goals Faster",
    headline2: "Goal Hacking Workshop — Stop Procrastinating Today",
    pct1: 50,
  });

  const pct2 = useMemo(() => 100 - config.pct1, [config.pct1]);

  const [saving, setSaving] = useState(false);

  // Local simulation counts (for verifying split locally)
  const [sim, setSim] = useState({ form1: 0, form2: 0, total: 0 });

  const setPct1 = (v: number) => setConfig((c) => ({ ...c, pct1: clampPct(v) }));

  async function save() {
    setSaving(true);
    try {
      const payload = {
        // keep naming matching what your LP expects (Headline1/2, Perc1/2, parameter1/2)
        active: true, // always active; remove if you don't use it
        Headline1: config.headline1,
        Headline2: config.headline2,
        Perc1: config.pct1,
        Perc2: 100 - config.pct1,
        parameter1: VARIANT_1,
        parameter2: VARIANT_2,
      };

      const res = await fetch(CONFIG_UPDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Save failed");

      toast({
        title: "Saved ✅",
        description: `Split updated: form1 ${config.pct1}% • form2 ${100 - config.pct1}%`,
      });
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  /** Local split verification (simulated users) */
  function simulate(n: number) {
    const counts = { form1: 0, form2: 0 };
    for (let i = 0; i < n; i++) {
      const v = assignVariant(config.pct1);
      if (v === VARIANT_1) counts.form1++;
      else counts.form2++;
    }

    setSim((prev) => ({
      form1: prev.form1 + counts.form1,
      form2: prev.form2 + counts.form2,
      total: prev.total + n,
    }));

    toast({
      title: "Simulation complete",
      description: `+${n} users → form1: ${counts.form1}, form2: ${counts.form2}`,
    });
  }

  function resetSimulation() {
    setSim({ form1: 0, form2: 0, total: 0 });
    localStorage.removeItem(LOCAL_KEY);
    toast({
      title: "Reset ✅",
      description: "Local simulation cleared",
    });
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Split Test (FB)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control headlines + traffic split for form1 vs form2
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl card-shadow p-2 flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      {/* Fixed tracking values */}
      <div className="bg-card border border-border/50 rounded-xl card-shadow p-4 text-xs text-muted-foreground">
        Fixed values:
        <span className="ml-2 text-foreground font-medium">Variant 1 = {VARIANT_1}</span>
        <span className="ml-2 text-foreground font-medium">Variant 2 = {VARIANT_2}</span>
      </div>

      {/* Slider split */}
      <div className="bg-card border border-border/50 rounded-xl card-shadow p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm font-semibold text-foreground">Traffic Split</div>
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">form1: {config.pct1}%</span>
            <span className="mx-2">•</span>
            <span className="text-foreground font-medium">form2: {pct2}%</span>
          </div>
        </div>

        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={100}
            value={config.pct1}
            onChange={(e) => setPct1(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="mt-3 h-3 w-full rounded-full bg-secondary/50 overflow-hidden">
          <div className="h-full bg-primary/70" style={{ width: `${config.pct1}%` }} />
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
          <span>Variant 1 (form1)</span>
          <span>Variant 2 (form2)</span>
        </div>
      </div>

      {/* Headlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Headline Variant 1</h3>
          <p className="text-xs text-muted-foreground mt-1">
            form_variant: <span className="text-foreground font-medium">{VARIANT_1}</span>
          </p>
          <input
            value={config.headline1}
            onChange={(e) => setConfig((c) => ({ ...c, headline1: e.target.value }))}
            className="mt-4 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            placeholder="Enter headline for form1"
          />
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Headline Variant 2</h3>
          <p className="text-xs text-muted-foreground mt-1">
            form_variant: <span className="text-foreground font-medium">{VARIANT_2}</span>
          </p>
          <input
            value={config.headline2}
            onChange={(e) => setConfig((c) => ({ ...c, headline2: e.target.value }))}
            className="mt-4 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            placeholder="Enter headline for form2"
          />
        </div>
      </div>

      {/* ONLY leads count (local test) */}
      <div className="bg-card border border-border/50 rounded-xl card-shadow p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm font-semibold text-foreground">Local Split Test Verification</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => simulate(50)}
              className="h-9 px-3 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Simulate 50 users
            </button>

            <button
              onClick={() => simulate(200)}
              className="h-9 px-3 rounded-md bg-secondary text-foreground text-sm font-medium"
            >
              Simulate 200
            </button>

            <button
              onClick={resetSimulation}
              className="h-9 px-3 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Leads (form1)</p>
            <p className="text-2xl font-bold text-foreground mt-1">{sim.form1}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Leads (form2)</p>
            <p className="text-2xl font-bold text-foreground mt-1">{sim.form2}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Total simulated</p>
            <p className="text-2xl font-bold text-foreground mt-1">{sim.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              form1: {sim.total ? ((sim.form1 / sim.total) * 100).toFixed(1) : "0.0"}% • form2:{" "}
              {sim.total ? ((sim.form2 / sim.total) * 100).toFixed(1) : "0.0"}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}