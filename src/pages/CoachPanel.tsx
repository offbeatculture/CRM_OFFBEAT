import { useParams } from "react-router-dom";
import { Users, DollarSign, Percent, MessageSquare, Video, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import KpiCard from "@/components/KpiCard";
import { coaches, leads, whatsappGroups, zoomSessions, automations, creatives } from "@/data/dummy-data";

export default function CoachPanel() {
  const { id } = useParams();
  const coachId = Number(id);
  const coach = coaches.find((c) => c.id === coachId);

  if (!coach) return <div className="text-muted-foreground">Coach not found</div>;

  const coachLeads = leads.filter((l) => l.coachId === coachId);
  const coachGroups = whatsappGroups.filter((g) => g.coachId === coachId);
  const coachSessions = zoomSessions.filter((s) => s.coachId === coachId);
  const coachCreatives = creatives.filter((c) => c.coachId === coachId);
  const coachRevenue = coachSessions.reduce((sum, s) => sum + s.revenue, 0);
  const converted = coachLeads.filter((l) => l.status === "Converted").length;
  const convRate = coachLeads.length ? ((converted / coachLeads.length) * 100).toFixed(1) : "0";

  const statusData = ["New", "Contacted", "Joined WA", "Attended Zoom", "Converted"].map((s) => ({
    status: s,
    count: coachLeads.filter((l) => l.status === s).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
          {coach.avatar}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{coach.name}</h2>
          <p className="text-sm text-muted-foreground">{coach.specialty}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KpiCard title="Leads Assigned" value={coachLeads.length} icon={<Users className="w-5 h-5" />} />
        <KpiCard title="Revenue" value={`$${coachRevenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} />
        <KpiCard title="Conversion" value={`${convRate}%`} icon={<Percent className="w-5 h-5" />} />
        <KpiCard title="WA Groups" value={coachGroups.length} icon={<MessageSquare className="w-5 h-5" />} />
        <KpiCard title="Zoom Sessions" value={coachSessions.length} icon={<Video className="w-5 h-5" />} />
        <KpiCard title="Automations" value={automations.filter((a) => a.status === "Active").length} icon={<Zap className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Graph */}
        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Lead Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Creative Performance */}
        <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Creative Performance</h3>
          <div className="space-y-3">
            {coachCreatives.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{c.roas}x ROAS</p>
                  <p className="text-xs text-muted-foreground">CTR: {c.ctr}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Status Table */}
      <div className="bg-card rounded-xl card-shadow border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Lead Pipeline</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {["Name", "Email", "Status", "WA", "Zoom", "Payment"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coachLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{lead.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{lead.status}</td>
                  <td className="px-4 py-3 text-sm">{lead.waJoined ? <span className="text-success">✓</span> : "—"}</td>
                  <td className="px-4 py-3 text-sm">{lead.zoomAttended ? <span className="text-success">✓</span> : "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{lead.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
