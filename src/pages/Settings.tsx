import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const sections = [
    { icon: User, title: "Profile", desc: "Manage your account details" },
    { icon: Bell, title: "Notifications", desc: "Configure alert preferences" },
    { icon: Shield, title: "Security", desc: "Password and access control" },
    { icon: Palette, title: "Appearance", desc: "Theme and display settings" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspace preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <div key={s.title} className="bg-card rounded-xl p-5 card-shadow border border-border/50 hover:shadow-elevated transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
