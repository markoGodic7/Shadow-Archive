/* MARKER-MAKE-KIT-INVOKED */
import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster, toast } from "sonner";
import { type YugiohCard } from "./data/mockCards";
import { Header } from "./components/Header";
import { SearchPage } from "./pages/SearchPage";
import { AdvancedSearchPage } from "./pages/AdvancedSearchPage";
import { WishlistPage } from "./pages/WishlistPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AdminPage } from "./pages/AdminPage";
import { UserProfilePage } from "./pages/UserProfilePage";

type Page = "search" | "advanced" | "wishlist" | "login" | "signup" | "profile" | "admin";

interface User {
  email: string;
  username: string;
  role?: "admin" | "user";
}

const AUTH_PAGES: Page[] = ["login", "signup"];

/* ── Demo admin credentials ── */
const ADMIN_EMAIL = "yami@yugioh.com";
const ADMIN_PASSWORD = "shadow123";

function useWishlist() {
  const [wishlist, setWishlist] = useState<YugiohCard[]>(() => {
    try { return JSON.parse(localStorage.getItem("yugioh-wishlist") || "[]"); }
    catch { return []; }
  });

  const toggle = useCallback((card: YugiohCard) => {
    setWishlist(prev => {
      const exists = prev.some(c => c.id === card.id);
      const next = exists ? prev.filter(c => c.id !== card.id) : [...prev, card];
      try { localStorage.setItem("yugioh-wishlist", JSON.stringify(next)); } catch {}
      if (exists) toast(`Removed "${card.name}" from wishlist`, { icon: "🗑️" });
      else toast.success(`Added "${card.name}" to wishlist`, { icon: "⭐" });
      return next;
    });
  }, []);

  return { wishlist, toggle };
}

function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem("yugioh-user") || "null"); }
    catch { return null; }
  });

  const login = useCallback((email: string) => {
    const isAdmin = email === ADMIN_EMAIL;
    const username = email.split("@")[0];
    const u: User = { email, username, role: isAdmin ? "admin" : "user" };
    setUser(u);
    try { localStorage.setItem("yugioh-user", JSON.stringify(u)); } catch {}
    toast.success(`Welcome back, ${username}! ${isAdmin ? "🛡️" : "👋"}`);
  }, []);

  const signup = useCallback((email: string, username: string) => {
    const u: User = { email, username, role: "user" };
    setUser(u);
    try { localStorage.setItem("yugioh-user", JSON.stringify(u)); } catch {}
    toast.success(`Account created! Welcome, ${username}! 🎉`);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem("yugioh-user"); } catch {}
    toast("You've been signed out.", { icon: "👋" });
  }, []);

  return { user, login, signup, logout };
}

export default function App() {
  const [page, setPage] = useState<Page>("search");
  const { wishlist, toggle } = useWishlist();
  const { user, login, signup, logout } = useAuth();

  const navigate = useCallback((target: string) => {
    // Guard admin page — redirect to login if not an admin
    if (target === "admin" && user?.role !== "admin") {
      toast.error("Admin access only. Please sign in as an admin.", { icon: "🛡️" });
      setPage("login");
      return;
    }
    // Guard profile page — redirect to login if not logged in
    if (target === "profile" && !user) {
      toast("Please sign in to view your profile.", { icon: "🔒" });
      setPage("login");
      return;
    }
    setPage(target as Page);
  }, [user]);

  const isAuthPage = AUTH_PAGES.includes(page);

  /* Animated page wrapper */
  const Fade = ({ children, k }: { children: React.ReactNode; k: string }) => (
    <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", fontFamily: "Inter, sans-serif" }}>
      <Toaster theme="dark" position="bottom-right"
        toastOptions={{ style: { background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" } }} />

      {/* Header */}
      {!isAuthPage && (
        <Header
          currentPage={page}
          onNavigate={navigate}
          wishlistCount={wishlist.length}
          user={user}
          onLogout={logout}
        />
      )}

      {/* Ambient glows */}
      {!isAuthPage && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{ background: "var(--primary)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl" style={{ background: "var(--accent)" }} />
        </div>
      )}

      <main className="relative" style={{ zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ── Auth pages ── */}
          {page === "login" && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <LoginPage onNavigate={navigate} onLogin={(email) => { login(email); navigate("search"); }} />
            </motion.div>
          )}
          {page === "signup" && (
            <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <SignupPage onNavigate={navigate} onSignup={(email, username) => { signup(email, username); navigate("search"); }} />
            </motion.div>
          )}

          {/* ── Main pages ── */}
          {page === "search" && <Fade k="search"><SearchPage wishlist={wishlist} onToggleWishlist={toggle} /></Fade>}
          {page === "advanced" && <Fade k="advanced"><AdvancedSearchPage wishlist={wishlist} onToggleWishlist={toggle} /></Fade>}
          {page === "wishlist" && <Fade k="wishlist"><WishlistPage wishlist={wishlist} onToggleWishlist={toggle} /></Fade>}

          {/* ── Admin page ── */}
          {page === "admin" && user?.role === "admin" && <Fade k="admin"><AdminPage /></Fade>}

          {/* ── User profile page ── */}
          {page === "profile" && user && (
            <Fade k="profile">
              <UserProfilePage user={user} wishlist={wishlist} onToggleWishlist={toggle} onNavigate={navigate} />
            </Fade>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      {!isAuthPage && (
        <footer className="border-t py-8 mt-12" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Yu-Gi-Oh! Card Explorer · Data from{" "}
              <span style={{ color: "var(--primary)" }}>YGOProDeck API</span> · Not affiliated with Konami
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
              {user ? (
                <span>
                  Signed in as{" "}
                  <button onClick={() => navigate("profile")} className="hover:underline" style={{ color: "var(--primary)" }}>{user.username}</button>
                  {user.role === "admin" && (
                    <button onClick={() => navigate("admin")} className="ml-2 hover:underline" style={{ color: "#f5c842" }}>
                      · Admin Panel
                    </button>
                  )}
                </span>
              ) : (
                <>
                  <button onClick={() => navigate("login")} className="hover:text-foreground transition-colors">Sign In</button>
                  <button onClick={() => navigate("signup")} className="hover:text-foreground transition-colors">Create Account</button>
                </>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
