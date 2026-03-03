import { DollarSign, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import KpiCard from "@/components/KpiCard";
import { coaches, campaigns, zoomSessions, revenueVsSpend } from "@/data/dummy-data";

const coachRevData = coaches.map((c) => ({
  name: c.name.split(" ")[0],
  revenue: zoomSessions.filter((s) => s.coachId === c.id).reduce((sum, s) => sum + s.revenue, 0),
}));

const campaignRevData = campaigns.map((c) => ({
  name: c.name.split(" ").slice(0, 2).join(" "),
  revenue: c.revenue,
}));

export default function Revenue() {
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Revenue</h2>
        <p className="text-sm text-muted-foreground mt-1">Financial performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} trend={{ value: "18% growth", positive: true }} />
        <KpiCard title="Avg per Coach" value={`$${(totalRevenue / 5).toLocaleString()}`} icon={<BarChart3 className="w-5 h-5" />} />
        <KpiCard title="Refund Rate" value="2.4%" icon={<AlertTriangle className="w-5 h-5" />} />
        <KpiCard title="Net Growth" value="+$23,400" icon={<TrendingUp className="w-5 h-5" />} trend={{ value: "vs last month", positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueVsSpend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue per Coach</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={coachRevData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-4">Revenue per Campaign</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={campaignRevData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} width={120} />
            <Tooltip />
            <Bar dataKey="revenue" fill="hsl(38, 92%, 50%)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
