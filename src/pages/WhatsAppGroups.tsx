import { Plus, ExternalLink } from "lucide-react";
import { whatsappGroups, coaches } from "@/data/dummy-data";

export default function WhatsAppGroups() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">WhatsApp Groups</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage coaching community groups</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {whatsappGroups.map((g) => {
          const coach = coaches.find((c) => c.id === g.coachId);
          return (
            <div key={g.id} className="bg-card rounded-xl p-5 card-shadow border border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{g.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{coach?.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${g.status === "Active" ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
                  {g.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-medium text-foreground">{g.members}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Join Link</span>
                  <a href={g.joinLink} className="text-primary text-xs flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" /> Open</a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Zoom Link</span>
                  <a href={g.zoomLink} className="text-primary text-xs flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" /> Open</a>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Auto-send reminder</span>
                <div className="w-9 h-5 bg-success rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-card rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
