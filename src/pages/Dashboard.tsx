import { Users, DollarSign, TrendingUp, Target, BarChart3, Percent } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, FunnelChart, Funnel, LabelList
} from "recharts";
import KpiCard from "@/components/KpiCard";
import { dailyLeadData, revenueVsSpend, funnelData, campaigns } from "@/data/dummy-data";

const roasData = campaigns.map(c => ({ name: c.name.split(" ").slice(0, 2).join(" "), roas: c.roas }));

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Overview of your coaching business performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Total Leads" value="996" subtitle="142 today" icon={<Users className="w-5 h-5" />} trend={{ value: "12% vs last week", positive: true }} />
        <KpiCard title="Cost Per Lead" value="$27.42" icon={<Target className="w-5 h-5" />} trend={{ value: "8% lower", positive: true }} />
        <KpiCard title="Ad Spend" value="$27,300" subtitle="This month" icon={<DollarSign className="w-5 h-5" />} />
        <KpiCard title="ROAS" value="5.18x" icon={<TrendingUp className="w-5 h-5" />} trend={{ value: "0.3x up", positive: true }} />
        <KpiCard title="Revenue" value="$142,500" subtitle="This month" icon={<BarChart3 className="w-5 h-5" />} trend={{ value: "18% growth", positive: true }} />
        <KpiCard title="Conversion" value="14.3%" icon={<Percent className="w-5 h-5" />} trend={{ value: "2.1% up", positive: true }} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Flow */}
        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Lead Flow (Daily)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyLeadData}>
              <defs>
                <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip />
              <Area type="monotone" dataKey="leads" stroke="hsl(221, 83%, 53%)" fill="url(#leadGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue vs Spend */}
        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue vs Ad Spend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueVsSpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="spend" stroke="hsl(349, 79%, 55%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS Performance */}
        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">ROAS by Campaign</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip />
              <Bar dataKey="roas" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Conversion Funnel</h3>
          <div className="space-y-3 mt-4">
            {funnelData.map((item, i) => {
              const maxVal = funnelData[0].value;
              const pct = (item.value / maxVal) * 100;
              const colors = ["hsl(221, 83%, 53%)", "hsl(221, 83%, 63%)", "hsl(221, 83%, 73%)", "hsl(142, 71%, 45%)"];
              return (
                <div key={item.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.stage}</span>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                  <div className="h-8 rounded-lg bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: colors[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
