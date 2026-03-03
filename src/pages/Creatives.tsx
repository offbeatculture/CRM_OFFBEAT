import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { creatives } from "@/data/dummy-data";
import { coaches } from "@/data/dummy-data";

const chartData = creatives.map((c) => ({ name: c.name.split(" - ")[0], ctr: c.ctr, cpc: c.cpc, roas: c.roas }));

export default function Creatives() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Creatives Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">Performance metrics for all ad creatives</p>
      </div>

      <div className="bg-card rounded-xl p-5 card-shadow border border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-4">Creative Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
            <Tooltip />
            <Bar dataKey="roas" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} name="ROAS" />
            <Bar dataKey="ctr" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} name="CTR %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl card-shadow border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {["Creative Name", "Platform", "CTR %", "CPC", "CPL", "ROAS", "Coach", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creatives.map((c) => {
                const coach = coaches.find((co) => co.id === c.coachId);
                return (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.platform}</td>
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{c.ctr}%</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">${c.cpc}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">${c.cpl}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{c.roas}x</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{coach?.name.split(" ")[0]}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${c.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
