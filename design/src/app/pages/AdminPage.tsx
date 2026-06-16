import { useState } from "react";
import {
  Users, LayoutDashboard, CreditCard, TrendingUp, ShieldCheck,
  Search, MoreHorizontal, ArrowUpRight, ArrowDownRight, Activity,
  Star, Database, AlertTriangle, CheckCircle2, Clock, XCircle,
  ChevronDown, Filter, Download, Eye, Ban, Trash2, Settings,
} from "lucide-react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { MOCK_USERS, ANALYTICS, type AppUser } from "../data/mockUsers";

type AdminTab = "overview" | "users" | "cards" | "analytics" | "settings";

const STAT_CARDS = [
  { label: "Total Users", value: "4,821", change: "+12.4%", up: true, icon: Users, color: "#6c63ff" },
  { label: "Active Today", value: "312", change: "+5.2%", up: true, icon: Activity, color: "#22d3ee" },
  { label: "Wishlist Items", value: "28,734", change: "+8.1%", up: true, icon: Star, color: "#f5c842" },
  { label: "Total Searches", value: "182,450", change: "-2.3%", up: false, icon: TrendingUp, color: "#8b5cf6" },
];

const PIE_COLORS = ["#6c63ff", "#22d3ee", "#f5c842"];

function StatusBadge({ status }: { status: AppUser["status"] }) {
  const map = {
    active: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "Active", icon: CheckCircle2 },
    suspended: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Suspended", icon: Ban },
    pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Pending", icon: Clock },
  };
  const { color, bg, label, icon: Icon } = map[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
      style={{ background: bg, color, border: `1px solid ${color}30` }}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

function RoleBadge({ role }: { role: AppUser["role"] }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
      style={{ background: "rgba(108,99,255,0.15)", color: "var(--primary)", border: "1px solid rgba(108,99,255,0.3)" }}>
      <ShieldCheck className="w-3 h-3" /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
      style={{ background: "rgba(123,127,168,0.1)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
      <Users className="w-3 h-3" /> User
    </span>
  );
}

// --- Sidebar ---
function AdminSidebar({ tab, onTab }: { tab: AdminTab; onTab: (t: AdminTab) => void }) {
  const links: { id: AdminTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users, badge: `${MOCK_USERS.length}` },
    { id: "cards", label: "Card Database", icon: CreditCard, badge: "12K" },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <aside className="w-56 shrink-0 flex flex-col rounded-2xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6c63ff,#8b5cf6)" }}>
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.06em", color: "var(--foreground)" }}>ADMIN PANEL</div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Card Explorer</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => onTab(id)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all text-left"
            style={{
              background: tab === id ? "rgba(108,99,255,0.12)" : "transparent",
              color: tab === id ? "var(--primary)" : "var(--muted-foreground)",
              fontWeight: tab === id ? 600 : 400,
            }}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: tab === id ? "rgba(108,99,255,0.2)" : "var(--secondary)", color: tab === id ? "var(--primary)" : "var(--muted-foreground)" }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--secondary)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg,#6c63ff,#8b5cf6)", color: "white", fontFamily: "Rajdhani,sans-serif" }}>
            A
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>YamiYugi</div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// --- Overview Tab ---
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, change, up, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: up ? "#22c55e" : "#ef4444",
                }}>
                {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
              </span>
            </div>
            <div style={{ fontFamily: "Rajdhani,sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>{value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily signups bar chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Daily Signups</h3>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>New registrations this week</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ANALYTICS.dailySignups} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                cursor={{ fill: "rgba(108,99,255,0.06)" }}
              />
              <Bar dataKey="count" fill="#6c63ff" radius={[6, 6, 0, 0]} name="Signups" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Card type pie */}
        <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="mb-1" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Card Types</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Database distribution</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={ANALYTICS.cardTypeDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                dataKey="count" nameKey="type" paddingAngle={3}>
                {ANALYTICS.cardTypeDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {ANALYTICS.cardTypeDistribution.map(({ type, pct }, i) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span style={{ color: "var(--foreground)" }}>{type}</span>
                </div>
                <span style={{ color: "var(--muted-foreground)", fontFamily: "JetBrains Mono, monospace" }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most searched + top wishlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="mb-4" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Most Searched Cards</h3>
          <div className="space-y-3">
            {ANALYTICS.mostSearched.map(({ name, count }, i) => {
              const pct = (count / ANALYTICS.mostSearched[0].count) * 100;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-2">
                      <span style={{ fontFamily: "JetBrains Mono,monospace", color: "var(--muted-foreground)", minWidth: "1rem" }}>#{i + 1}</span>
                      <span style={{ color: "var(--foreground)" }}>{name}</span>
                    </span>
                    <span style={{ color: "var(--muted-foreground)", fontFamily: "JetBrains Mono,monospace" }}>{count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6c63ff,#8b5cf6)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="mb-4" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Wishlist by Archetype</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ANALYTICS.wishlistByArchetype} layout="vertical" barSize={12}>
              <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                cursor={{ fill: "rgba(108,99,255,0.06)" }} />
              <Bar dataKey="count" fill="#f5c842" radius={[0, 6, 6, 0]} name="Saves" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent users */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Recent Registrations</h3>
          <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>+{ANALYTICS.newThisWeek} this week</span>
        </div>
        <div className="space-y-3">
          {MOCK_USERS.slice(0, 4).map(u => (
            <div key={u.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: "linear-gradient(135deg,#6c63ff,#8b5cf6)", color: "white", fontFamily: "Rajdhani,sans-serif" }}>
                {u.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>{u.username}</p>
                <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{u.email}</p>
              </div>
              <StatusBadge status={u.status} />
              <span className="text-xs hidden sm:block" style={{ color: "var(--muted-foreground)" }}>{u.joinedAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Users Tab ---
function UsersTab() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>
        <div className="flex gap-2">
          {[
            { label: "Role", value: roleFilter, set: setRoleFilter, options: [["all", "All Roles"], ["admin", "Admin"], ["user", "User"]] },
            { label: "Status", value: statusFilter, set: setStatusFilter, options: [["all", "All Status"], ["active", "Active"], ["suspended", "Suspended"], ["pending", "Pending"]] },
          ].map(({ value, set, options }) => (
            <select key={value} value={value} onChange={e => set(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
              {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ background: "rgba(108,99,255,0.15)", color: "var(--primary)", border: "1px solid rgba(108,99,255,0.3)" }}>
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        Showing <strong style={{ color: "var(--foreground)" }}>{filtered.length}</strong> of {MOCK_USERS.length} users
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
                {["User", "Role", "Status", "Country", "Wishlist", "Joined", "Last Seen", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--muted-foreground)", fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                  className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: `hsl(${(u.id.charCodeAt(1) * 40) % 360}, 60%, 40%)`, color: "white", fontFamily: "Rajdhani,sans-serif" }}>
                        {u.username[0]}
                      </div>
                      <div>
                        <p style={{ color: "var(--foreground)", fontWeight: 500 }}>{u.username}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{u.country}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--gold)", fontFamily: "JetBrains Mono,monospace" }}>
                      <Star className="w-3 h-3" /> {u.wishlistCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{u.joinedAt}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{u.lastSeen}</td>
                  <td className="px-4 py-3 relative">
                    <button onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors" style={{ color: "var(--muted-foreground)" }}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {actionMenu === u.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setActionMenu(null)} />
                        <div className="absolute right-8 top-8 z-40 w-40 rounded-xl overflow-hidden shadow-2xl"
                          style={{ background: "var(--popover)", border: "1px solid var(--border)" }}>
                          {[
                            { icon: Eye, label: "View Profile", color: "var(--foreground)" },
                            { icon: ShieldCheck, label: "Edit Role", color: "var(--primary)" },
                            { icon: Ban, label: "Suspend", color: "#f59e0b" },
                            { icon: Trash2, label: "Delete", color: "#ef4444" },
                          ].map(({ icon: Icon, label, color }) => (
                            <button key={label} onClick={() => setActionMenu(null)}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-secondary transition-colors"
                              style={{ color }}>
                              <Icon className="w-3.5 h-3.5" /> {label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Cards Tab ---
function CardsTab() {
  const cardRows = [
    { name: "Blue-Eyes White Dragon", type: "Normal Monster", atk: 3000, banlist: "Unlimited", searches: 8410, wishlistSaves: 3210 },
    { name: "Dark Magician", type: "Normal Monster", atk: 2500, banlist: "Unlimited", searches: 7203, wishlistSaves: 2940 },
    { name: "Exodia the Forbidden One", type: "Effect Monster", atk: 1000, banlist: "Limited", searches: 5980, wishlistSaves: 2580 },
    { name: "Pot of Greed", type: "Spell Card", atk: null, banlist: "Forbidden", searches: 5120, wishlistSaves: 1870 },
    { name: "Mirror Force", type: "Trap Card", atk: null, banlist: "Unlimited", searches: 3210, wishlistSaves: 1640 },
    { name: "Stardust Dragon", type: "Synchro Monster", atk: 2500, banlist: "Unlimited", searches: 4672, wishlistSaves: 1420 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Cards", value: "12,066", color: "#6c63ff" },
          { label: "Monster Cards", value: "7,842", color: "#f59e0b" },
          { label: "Spell / Trap", value: "4,224", color: "#22d3ee" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-2xl flex items-center gap-3"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <Database className="w-5 h-5" style={{ color }} />
            <div>
              <div style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "var(--foreground)", lineHeight: 1 }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <h3 style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Top Interacted Cards</h3>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>By searches + wishlist saves</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
                {["Card Name", "Type", "ATK", "Banlist", "Searches", "Wishlist Saves"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium whitespace-nowrap"
                    style={{ color: "var(--muted-foreground)", fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cardRows.map((c, i) => (
                <tr key={c.name} style={{ borderBottom: i < cardRows.length - 1 ? "1px solid var(--border)" : "none" }}
                  className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>{c.name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{c.type}</td>
                  <td className="px-4 py-3 text-xs" style={{ fontFamily: "JetBrains Mono,monospace", color: "var(--primary)" }}>{c.atk ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: c.banlist === "Forbidden" ? "rgba(239,68,68,0.1)" : c.banlist === "Limited" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                        color: c.banlist === "Forbidden" ? "#ef4444" : c.banlist === "Limited" ? "#f59e0b" : "#22c55e",
                      }}>{c.banlist}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ fontFamily: "JetBrains Mono,monospace", color: "var(--foreground)" }}>{c.searches.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--gold)", fontFamily: "JetBrains Mono,monospace" }}>
                      <Star className="w-3 h-3" /> {c.wishlistSaves.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Analytics Tab ---
function AnalyticsTab() {
  const weeklyActive = [
    { week: "W1", users: 210 }, { week: "W2", users: 245 }, { week: "W3", users: 198 },
    { week: "W4", users: 280 }, { week: "W5", users: 312 }, { week: "W6", users: 295 },
    { week: "W7", users: 340 }, { week: "W8", users: 312 },
  ];
  const searchTrend = [
    { day: "Mon", searches: 22400 }, { day: "Tue", searches: 25100 }, { day: "Wed", searches: 19800 },
    { day: "Thu", searches: 28700 }, { day: "Fri", searches: 31200 }, { day: "Sat", searches: 38900 }, { day: "Sun", searches: 27600 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="mb-1" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Weekly Active Users</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>8-week rolling window</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyActive}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)" />
              <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} />
              <Line type="monotone" dataKey="users" stroke="#6c63ff" strokeWidth={2.5} dot={{ fill: "#6c63ff", r: 3 }} activeDot={{ r: 5 }} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="mb-1" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Daily Search Volume</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Card searches this week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={searchTrend} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                cursor={{ fill: "rgba(245,200,66,0.06)" }} />
              <Bar dataKey="searches" fill="#f5c842" radius={[6, 6, 0, 0]} name="Searches" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg. Session", value: "4m 12s", sub: "per visit", color: "#6c63ff" },
          { label: "Bounce Rate", value: "24.3%", sub: "below avg", color: "#22c55e" },
          { label: "Cards Viewed", value: "61K", sub: "this week", color: "#22d3ee" },
          { label: "Return Users", value: "68%", sub: "of total", color: "#f5c842" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="p-4 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "Rajdhani,sans-serif", fontSize: "1.5rem", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div className="text-sm mt-1" style={{ color: "var(--foreground)" }}>{label}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Settings Tab ---
function SettingsTab() {
  const [maintenance, setMaintenance] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [apiPublic, setApiPublic] = useState(true);

  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <button onClick={toggle}
      className="w-11 h-6 rounded-full transition-all duration-200 relative flex items-center"
      style={{ background: on ? "var(--primary)" : "var(--secondary)", border: `1px solid ${on ? "var(--primary)" : "var(--border)"}` }}>
      <div className="w-4 h-4 rounded-full bg-white absolute transition-all duration-200"
        style={{ left: on ? "calc(100% - 20px)" : "3px" }} />
    </button>
  );

  const sections = [
    {
      title: "Site Settings", items: [
        { label: "Maintenance Mode", desc: "Temporarily disable public access.", on: maintenance, toggle: () => setMaintenance(v => !v) },
        { label: "Email Notifications", desc: "Send welcome emails to new registrations.", on: emailNotifs, toggle: () => setEmailNotifs(v => !v) },
        { label: "Public API Access", desc: "Allow third-party card data API requests.", on: apiPublic, toggle: () => setApiPublic(v => !v) },
      ]
    },
    {
      title: "Danger Zone", danger: true, items: [
        { label: "Clear Search Cache", desc: "Flush all cached card search results.", action: "Clear Cache" },
        { label: "Export All Data", desc: "Download full user + card interaction dataset.", action: "Export JSON" },
        { label: "Reset Analytics", desc: "Wipe analytics counters. Cannot be undone.", action: "Reset", red: true },
      ]
    },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      {sections.map(({ title, items, danger }) => (
        <div key={title} className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: `1px solid ${danger ? "rgba(239,68,68,0.25)" : "var(--border)"}` }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: danger ? "rgba(239,68,68,0.15)" : "var(--border)" }}>
            {danger && <AlertTriangle className="w-4 h-4" style={{ color: "#ef4444" }} />}
            <h3 style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: danger ? "#ef4444" : "var(--foreground)" }}>{title}</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {(items as any[]).map((item) => (
              <div key={item.label} className="flex items-center justify-between px-5 py-4 gap-4">
                <div>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
                </div>
                {"action" in item ? (
                  <button className="shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: item.red ? "rgba(239,68,68,0.1)" : "var(--secondary)",
                      color: item.red ? "#ef4444" : "var(--muted-foreground)",
                      border: `1px solid ${item.red ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                    }}>
                    {item.action}
                  </button>
                ) : (
                  <Toggle on={item.on} toggle={item.toggle} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main ---
export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const tabTitles: Record<AdminTab, { title: string; desc: string }> = {
    overview: { title: "Overview", desc: "Platform-wide stats and recent activity." },
    users: { title: "User Management", desc: "View, filter and moderate registered users." },
    cards: { title: "Card Database", desc: "Monitor card interactions and popularity." },
    analytics: { title: "Analytics", desc: "Traffic, engagement and usage metrics." },
    settings: { title: "Settings", desc: "Configure site behaviour and admin controls." },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5" style={{ color: "var(--primary)" }} />
            <h1 style={{ fontFamily: "Rajdhani,sans-serif", fontSize: "1.75rem", fontWeight: 700, letterSpacing: "0.04em" }}>
              {tabTitles[tab].title}
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{tabTitles[tab].desc}</p>
        </div>
        {/* Mobile sidebar toggle */}
        <button onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          <Filter className="w-4 h-4" /> Menu
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar desktop */}
        <div className="hidden lg:block sticky top-24 self-start">
          <AdminSidebar tab={tab} onTab={setTab} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === "overview" && <OverviewTab />}
          {tab === "users" && <UsersTab />}
          {tab === "cards" && <CardsTab />}
          {tab === "analytics" && <AnalyticsTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            className="fixed left-0 top-0 bottom-0 z-50 w-64 p-4"
            style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}>
            <AdminSidebar tab={tab} onTab={(t) => { setTab(t); setMobileSidebarOpen(false); }} />
          </motion.div>
        </>
      )}
    </div>
  );
}
