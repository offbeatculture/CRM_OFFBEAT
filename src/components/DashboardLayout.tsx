import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Palette,
  BarChart3,
  MessageSquare,
  Video,
  Zap,
  DollarSign,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { coaches } from "@/data/dummy-data";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Leads", icon: Users, path: "/leads" },
  { label: "Zoom Sessions", icon: Video, path: "/zoom" },
  { label: "Split Test", icon: Zap, path: "/automations" },
  { label: "Ads & ROAS", icon: BarChart3, path: "/ads" },
  { label: "Creatives", icon: Palette, path: "/creatives" },
  { label: "WhatsApp Groups", icon: MessageSquare, path: "/whatsapp" },
  { label: "Revenue", icon: DollarSign, path: "/revenue" },
];

const COACH_STORAGE_KEY = "coach_id";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Keep coach id as string (sessionStorage stores strings)
  const defaultCoachId = useMemo(() => (coaches?.[0]?.id != null ? String(coaches[0].id) : ""), []);

  const [selectedCoach, setSelectedCoach] = useState<string>("");

  // ✅ Load coach from sessionStorage or set default
  useEffect(() => {
    const saved = sessionStorage.getItem(COACH_STORAGE_KEY);

    if (saved) {
      setSelectedCoach(saved);
    } else {
      setSelectedCoach(defaultCoachId);
      if (defaultCoachId) sessionStorage.setItem(COACH_STORAGE_KEY, defaultCoachId);
    }
  }, [defaultCoachId]);

  // ✅ When coach changes, store + notify pages
  const handleCoachChange = (coachId: string) => {
    setSelectedCoach(coachId);
    sessionStorage.setItem(COACH_STORAGE_KEY, coachId);

    // Let other pages refetch (Zoom page can listen to this)
    window.dispatchEvent(new Event("coachChange"));
  };

  const selectedCoachObj = useMemo(() => {
    return coaches.find((c) => String(c.id) === selectedCoach);
  }, [selectedCoach]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0 -ml-64"
        } transition-all duration-300 bg-card border-r border-border flex flex-col shrink-0`}
      >
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-bold text-foreground tracking-tight">CoachFlow</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Lead Strategy & Automation</p>

          {/* ✅ Coach dropdown in sidebar */}
          <div className="mt-4">
            <div className="text-[11px] text-muted-foreground mb-1">Active Coach</div>

            <div className="relative">
              <UserCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

              <select
                value={selectedCoach}
                onChange={(e) => handleCoachChange(e.target.value)}
                className="w-full h-10 rounded-lg bg-secondary border border-border pl-9 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {coaches.map((coach) => (
                  <option key={coach.id} value={String(coach.id)}>
                    {coach.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {selectedCoachObj ? (
              <div className="mt-2 text-[11px] text-muted-foreground">
                Selected: <span className="text-foreground font-medium">{selectedCoachObj.name}</span>
              </div>
            ) : null}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search..."
                className="h-9 w-64 rounded-lg bg-secondary border-none pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              SA
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}