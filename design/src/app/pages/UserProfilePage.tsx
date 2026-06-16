import { useState } from "react";
import {
  User, Star, Search, Settings, Bell, Shield, Camera,
  CreditCard, MapPin, Calendar, Clock, Edit2, Save,
  CheckCircle2, Trash2, Download, Eye, EyeOff,
  TrendingUp, Zap, Award, BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_CARDS, type YugiohCard } from "../data/mockCards";
import { CardTypeBadge } from "../components/Badge";

type ProfileTab = "overview" | "wishlist" | "activity" | "settings";

interface UserProfilePageProps {
  user: { email: string; username: string };
  wishlist: YugiohCard[];
  onToggleWishlist: (card: YugiohCard) => void;
  onNavigate: (page: string) => void;
}

const ACTIVITY_LOG = [
  { action: "Added to wishlist", target: "Blue-Eyes White Dragon", time: "2 minutes ago", icon: Star, color: "#f5c842" },
  { action: "Searched for", target: "Dark Magician", time: "18 minutes ago", icon: Search, color: "#6c63ff" },
  { action: "Viewed card", target: "Exodia the Forbidden One", time: "1 hour ago", icon: Eye, color: "#22d3ee" },
  { action: "Added to wishlist", target: "Stardust Dragon", time: "3 hours ago", icon: Star, color: "#f5c842" },
  { action: "Searched for", target: "Pot of Greed", time: "5 hours ago", icon: Search, color: "#6c63ff" },
  { action: "Removed from wishlist", target: "Mirror Force", time: "Yesterday", icon: Trash2, color: "#ef4444" },
  { action: "Viewed card", target: "Number 39: Utopia", time: "Yesterday", icon: Eye, color: "#22d3ee" },
  { action: "Searched for", target: "Red-Eyes Black Dragon", time: "2 days ago", icon: Search, color: "#6c63ff" },
];

const BADGES = [
  { icon: "⚡", label: "First Search", desc: "Searched for your first card", earned: true },
  { icon: "⭐", label: "Collector", desc: "Added 10 cards to wishlist", earned: true },
  { icon: "🐉", label: "Dragon Tamer", desc: "Wishlisted 5 Dragon cards", earned: true },
  { icon: "🔮", label: "Spell Master", desc: "Viewed 20 Spell cards", earned: false },
  { icon: "🏆", label: "Duelist", desc: "Logged in 7 days in a row", earned: false },
  { icon: "📚", label: "Lore Keeper", desc: "Read descriptions of 50 cards", earned: false },
];

// --- Tab: Overview ---
function OverviewTab({ user, wishlist }: { user: { email: string; username: string }; wishlist: YugiohCard[] }) {
  const stats = [
    { label: "Cards Wishlisted", value: wishlist.length, icon: Star, color: "#f5c842" },
    { label: "Total Searches", value: 47, icon: Search, color: "#6c63ff" },
    { label: "Cards Viewed", value: 184, icon: Eye, color: "#22d3ee" },
    { label: "Days Active", value: 12, icon: Calendar, color: "#8b5cf6" },
  ];

  const topTypes = wishlist.reduce<Record<string, number>>((acc, c) => {
    const t = c.frameType || "normal";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="p-4 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div style={{ fontFamily: "Rajdhani,sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>{value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Achievements */}
        <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4" style={{ color: "var(--gold)" }} />
            <h3 style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Achievements</h3>
            <span className="text-xs px-1.5 py-0.5 rounded-full ml-auto"
              style={{ background: "rgba(245,200,66,0.15)", color: "var(--gold)" }}>
              {BADGES.filter(b => b.earned).length}/{BADGES.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map(({ icon, label, desc, earned }) => (
              <div key={label} className="flex flex-col items-center text-center p-3 rounded-xl transition-all"
                style={{
                  background: earned ? "rgba(245,200,66,0.06)" : "var(--secondary)",
                  border: `1px solid ${earned ? "rgba(245,200,66,0.2)" : "var(--border)"}`,
                  opacity: earned ? 1 : 0.5,
                }}>
                <span className="text-2xl mb-1">{icon}</span>
                <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{label}</div>
                <div className="text-xs mt-0.5 leading-tight" style={{ color: "var(--muted-foreground)", fontSize: "0.65rem" }}>{desc}</div>
                {earned && <CheckCircle2 className="w-3 h-3 mt-1.5" style={{ color: "#22c55e" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <h3 style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Recent Activity</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {ACTIVITY_LOG.slice(0, 6).map(({ action, target, time, icon: Icon, color }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "var(--foreground)" }}>
                    {action} <span style={{ color: "var(--primary)" }}>"{target}"</span>
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wishlist type breakdown */}
      {wishlist.length > 0 && (
        <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <h3 style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Your Card Type Mix</h3>
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(topTypes).map(([type, count]) => {
              const pct = Math.round((count / wishlist.length) * 100);
              return (
                <div key={type} className="flex-1 min-w-[80px] p-3 rounded-xl text-center"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "var(--primary)" }}>{pct}%</div>
                  <div className="text-xs capitalize mt-0.5" style={{ color: "var(--muted-foreground)" }}>{type}</div>
                  <div className="text-xs" style={{ color: "var(--foreground)" }}>{count} cards</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Tab: Wishlist ---
function WishlistTab({ wishlist, onToggleWishlist, onNavigate }: { wishlist: YugiohCard[]; onToggleWishlist: (c: YugiohCard) => void; onNavigate: (p: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = wishlist.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Star className="w-12 h-12 mb-4" style={{ color: "var(--gold)", opacity: 0.4 }} />
        <h3 style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "var(--foreground)" }}>No cards yet</h3>
        <p className="text-sm mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>Head to the card search to start saving favourites.</p>
        <button onClick={() => onNavigate("search")}
          className="px-4 py-2 rounded-xl text-sm" style={{ background: "var(--primary)", color: "white" }}>
          Browse Cards
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter wishlist…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{filtered.length} cards</span>
        <button className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
          style={{ background: "rgba(108,99,255,0.12)", color: "var(--primary)", border: "1px solid rgba(108,99,255,0.25)" }}>
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {filtered.map((card) => (
            <motion.div key={card.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 p-3 rounded-xl group"
              style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
              <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--muted)" }}>
                <img src={card.card_images[0]?.image_url_small} alt={card.name}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>{card.name}</p>
                <div className="mt-1"><CardTypeBadge card={card} /></div>
                {card.archetype && <p className="text-xs mt-1 truncate" style={{ color: "var(--muted-foreground)" }}>{card.archetype}</p>}
              </div>
              <button onClick={() => onToggleWishlist(card)}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: "var(--destructive)", background: "rgba(239,68,68,0.1)" }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Tab: Activity ---
function ActivityTab() {
  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Your full interaction history.</p>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {ACTIVITY_LOG.map(({ action, target, time, icon: Icon, color }, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/50 transition-colors"
            style={{ borderBottom: i < ACTIVITY_LOG.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: "var(--foreground)" }}>
                {action} <span style={{ color: "var(--primary)" }}>"{target}"</span>
              </p>
            </div>
            <span className="text-xs shrink-0" style={{ color: "var(--muted-foreground)" }}>{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Tab: Settings ---
function SettingsTab({ user }: { user: { email: string; username: string } }) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState("Passionate duelist and card collector. Favourite deck: Blue-Eyes.");
  const [country, setCountry] = useState("Japan");
  const [saved, setSaved] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [notifSearchSuggestions, setNotifSearchSuggestions] = useState(true);
  const [notifWishlistUpdates, setNotifWishlistUpdates] = useState(false);
  const [notifNewSets, setNotifNewSets] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <button onClick={toggle}
      className="w-11 h-6 rounded-full transition-all duration-200 relative flex items-center"
      style={{ background: on ? "var(--primary)" : "var(--secondary)", border: `1px solid ${on ? "var(--primary)" : "var(--border)"}` }}>
      <div className="w-4 h-4 rounded-full bg-white absolute transition-all duration-200"
        style={{ left: on ? "calc(100% - 20px)" : "3px" }} />
    </button>
  );

  const inputStyle = {
    background: "var(--secondary)", border: "1px solid var(--border)",
    color: "var(--foreground)", borderRadius: "0.75rem",
    padding: "0.625rem 0.875rem", width: "100%", fontSize: "0.875rem", outline: "none",
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Profile info */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="mb-4" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Profile Information</h3>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: "linear-gradient(135deg,#6c63ff,#8b5cf6)", color: "white", fontFamily: "Rajdhani,sans-serif" }}>
              {username[0]?.toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "var(--primary)", border: "2px solid var(--background)" }}>
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm" style={{ color: "var(--foreground)" }}>Profile Picture</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>PNG, JPG up to 2MB</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "Username", value: username, set: setUsername, type: "text" },
            { label: "Email Address", value: email, set: setEmail, type: "email" },
            { label: "Country", value: country, set: setCountry, type: "text" },
          ].map(({ label, value, set, type }) => (
            <div key={label}>
              <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)} style={inputStyle} />
            </div>
          ))}
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              className="resize-none"
              style={{ ...inputStyle, fontFamily: "inherit" }} />
          </div>
        </div>

        <button onClick={handleSave}
          className="flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm transition-all"
          style={{ background: saved ? "rgba(34,197,94,0.15)" : "var(--primary)", color: saved ? "#22c55e" : "white", border: saved ? "1px solid rgba(34,197,94,0.3)" : "none" }}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {/* Password */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="mb-4" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Change Password</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Current Password</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>New Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)}
                placeholder="Create new password"
                style={{ ...inputStyle, paddingRight: "2.5rem" }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl text-sm"
            style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
            Update Password
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="mb-4" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "var(--foreground)" }}>Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { label: "Search Suggestions", desc: "Show autocomplete suggestions as you type.", on: notifSearchSuggestions, toggle: () => setNotifSearchSuggestions(v => !v) },
            { label: "Wishlist Updates", desc: "Notify when a wishlisted card's banlist status changes.", on: notifWishlistUpdates, toggle: () => setNotifWishlistUpdates(v => !v) },
            { label: "New Card Sets", desc: "Alert when new sets are added to the database.", on: notifNewSets, toggle: () => setNotifNewSets(v => !v) },
          ].map(({ label, desc, on, toggle }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
              </div>
              <Toggle on={on} toggle={toggle} />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <h3 className="mb-4 flex items-center gap-2" style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "#ef4444" }}>
          <Shield className="w-4 h-4" /> Danger Zone
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
            Clear All Wishlist Data
          </button>
          <button className="px-4 py-2 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main ---
export function UserProfilePage({ user, wishlist, onToggleWishlist, onNavigate }: UserProfilePageProps) {
  const [tab, setTab] = useState<ProfileTab>("overview");

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Zap },
    { id: "wishlist", label: "Wishlist", icon: Star },
    { id: "activity", label: "Activity", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const joinDate = "January 2025";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden mb-6 p-6 sm:p-8"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: "var(--primary)" }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-8 blur-3xl" style={{ background: "var(--accent)" }} />
          {/* Banner gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-20" style={{ background: "linear-gradient(135deg,rgba(108,99,255,0.2),rgba(139,92,246,0.15),transparent)" }} />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-2xl"
              style={{ background: "linear-gradient(135deg,#6c63ff,#8b5cf6)", color: "white", fontFamily: "Rajdhani,sans-serif", boxShadow: "0 8px 32px rgba(108,99,255,0.4)" }}>
              {user.username[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#22c55e", border: "2px solid var(--card)" }} title="Online" />
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 style={{ fontFamily: "Rajdhani,sans-serif", fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--foreground)" }}>
                {user.username}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(108,99,255,0.15)", color: "var(--primary)", border: "1px solid rgba(108,99,255,0.3)" }}>
                Registered User
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Japan</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {joinDate}</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
                <span style={{ color: "var(--gold)" }}>{wishlist.length}</span> in wishlist
              </span>
              <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Favourite: Blue-Eyes</span>
            </div>
          </div>

          {/* Edit button */}
          <button onClick={() => setTab("settings")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm shrink-0 transition-all"
            style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 flex-1 justify-center"
            style={{
              background: tab === id ? "rgba(108,99,255,0.15)" : "transparent",
              color: tab === id ? "var(--primary)" : "var(--muted-foreground)",
              fontWeight: tab === id ? 600 : 400,
            }}>
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {tab === "overview" && <OverviewTab user={user} wishlist={wishlist} />}
          {tab === "wishlist" && <WishlistTab wishlist={wishlist} onToggleWishlist={onToggleWishlist} onNavigate={onNavigate} />}
          {tab === "activity" && <ActivityTab />}
          {tab === "settings" && <SettingsTab user={user} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
