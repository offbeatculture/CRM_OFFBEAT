import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Loader2 } from "lucide-react";

const ACCESS_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJpJdHA2HTiq555cPzrkR3pNZflaT6H1VVEHMr3Dr-_9fMGMGbiJvzh5oLIERxwOEXILKSeC9ssFNc/pub?gid=0&single=true&output=csv";

const AUTH_KEY = "crm_logged_in";
const USER_KEY = "crm_username";

type AccessRow = {
  username: string;
  password: string;
};

function cleanCell(v: string) {
  return String(v ?? "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/""/g, '"');
}

function parseCsv(text: string): AccessRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  return lines.slice(1).map((line) => {
    const cells =
      line.match(/("([^"]|"")*"|[^,]+)/g)?.map((c) => cleanCell(c)) ?? [];

    return {
      username: cells[0] ?? "",
      password: cells[1] ?? "",
    };
  });
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password.trim()) {
      setError("Enter username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(ACCESS_CSV, { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        throw new Error("Failed to load access sheet.");
      }

      const rows = parseCsv(text);

      const match = rows.find(
        (row) =>
          row.username.trim().toLowerCase() === form.username.trim().toLowerCase() &&
          row.password.trim() === form.password.trim()
      );

      if (!match) {
        setError("Invalid username or password.");
        return;
      }

      sessionStorage.setItem(AUTH_KEY, "1");
      sessionStorage.setItem(USER_KEY, match.username);

      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl card-shadow p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">CRM Login</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your access credentials
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-foreground">Username</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
                placeholder="Enter username"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-foreground">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
                placeholder="Enter password"
                disabled={loading}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}