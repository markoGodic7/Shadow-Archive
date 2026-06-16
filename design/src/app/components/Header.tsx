import { useState } from "react";
import {
  Search, BookOpen, Star, Menu, X, Zap,
  LogOut, LogIn, ShieldCheck, User, Settings,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Page = "search" | "advanced" | "wishlist" | "profile" | "admin";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  wishlistCount: number;
  user?: { email: string; username: string; role?: string } | null;
  onLogout?: () => void;
}

export function Header({ currentPage, onNavigate, wishlistCount, user, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const avatarLetter = user ? (user.username?.[0] ?? "U").toUpperCase() : null;

  const navLinks = [
    { label: "Search", page: "search", icon: <Search className="w-4 h-4" /> },
    { label: "Advanced", page: "advanced", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Wishlist", page: "wishlist", icon: <Star className="w-4 h-4" />, badge: wishlistCount > 0 ? wishlistCount : null },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: "rgba(10,11,20,0.93)", backdropFilter: "blur(16px)", borderColor: "rgba(108,99,255,0.2)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ── */}
          <button onClick={() => onNavigate("search")} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6c63ff,#8b5cf6)" }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs" style={{ fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>YU-GI-OH!</span>
              <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.05em", lineHeight: 1.1, color: "var(--foreground)" }}>
                CARD EXPLORER
              </span>
            </div>
          </button>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map(({ label, page, icon, badge }) => (
              <button key={page} onClick={() => onNavigate(page)}
                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-all duration-200"
                style={{
                  color: currentPage === page ? "var(--primary)" : "var(--muted-foreground)",
                  background: currentPage === page ? "rgba(108,99,255,0.1)" : "transparent",
                }}>
                {icon} {label}
                {badge && (
                  <span className="text-xs rounded-full px-1.5 py-0.5"
                    style={{ background: "var(--gold)", color: "#000", fontFamily: "JetBrains Mono,monospace" }}>
                    {badge}
                  </span>
                )}
                {currentPage === page && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: "var(--primary)" }} />
                )}
              </button>
            ))}

            {/* Admin link — only visible to admins */}
            {isAdmin && (
              <button onClick={() => onNavigate("admin")}
                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-all duration-200"
                style={{
                  color: currentPage === "admin" ? "#f5c842" : "var(--muted-foreground)",
                  background: currentPage === "admin" ? "rgba(245,200,66,0.08)" : "transparent",
                }}>
                <ShieldCheck className="w-4 h-4" /> Admin
                {currentPage === "admin" && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: "#f5c842" }} />
                )}
              </button>
            )}
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              /* ── Logged-in: avatar dropdown ── */
              <div className="relative hidden md:block">
                <button onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors"
                  style={{ background: profileMenuOpen ? "var(--secondary)" : "transparent", border: profileMenuOpen ? "1px solid var(--border)" : "1px solid transparent" }}>
                  {/* Avatar circle */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#6c63ff,#8b5cf6)", color: "white", fontFamily: "Rajdhani,sans-serif" }}>
                    {avatarLetter}
                  </div>
                  <span className="text-sm max-w-[72px] truncate" style={{ color: "var(--foreground)" }}>{user.username}</span>
                  {isAdmin && <ShieldCheck className="w-3 h-3" style={{ color: "#f5c842" }} />}
                  <ChevronDown className="w-3 h-3" style={{ color: "var(--muted-foreground)", transform: profileMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-60 rounded-2xl overflow-hidden z-50"
                        style={{ background: "var(--popover)", border: "1px solid var(--border)", boxShadow: "0 20px 50px rgba(0,0,0,0.55)" }}
                      >
                        {/* User info header */}
                        <div className="px-4 py-3.5 border-b" style={{ borderColor: "var(--border)", background: "rgba(108,99,255,0.05)" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                              style={{ background: "linear-gradient(135deg,#6c63ff,#8b5cf6)", color: "white", fontFamily: "Rajdhani,sans-serif" }}>
                              {avatarLetter}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold" style={{ color: "var(--foreground)", fontFamily: "Rajdhani,sans-serif" }}>{user.username}</p>
                                {isAdmin && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                                    style={{ background: "rgba(245,200,66,0.15)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.3)" }}>
                                    Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-xs truncate max-w-[140px]" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5">
                          <button onClick={() => { setProfileMenuOpen(false); onNavigate("profile"); }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition-colors"
                            style={{ color: currentPage === "profile" ? "var(--primary)" : "var(--foreground)" }}>
                            <User className="w-4 h-4" /> My Profile
                          </button>
                          <button onClick={() => { setProfileMenuOpen(false); onNavigate("wishlist"); }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition-colors"
                            style={{ color: "var(--foreground)" }}>
                            <Star className="w-4 h-4" style={{ color: "var(--gold)" }} />
                            Wishlist
                            {wishlistCount > 0 && (
                              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                                style={{ background: "rgba(245,200,66,0.15)", color: "var(--gold)" }}>{wishlistCount}</span>
                            )}
                          </button>
                          <button onClick={() => { setProfileMenuOpen(false); onNavigate("profile"); }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition-colors"
                            style={{ color: "var(--foreground)" }}>
                            <Settings className="w-4 h-4 text-muted-foreground" /> Account Settings
                          </button>

                          {/* Admin panel — only for admins */}
                          {isAdmin && (
                            <>
                              <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
                              <button onClick={() => { setProfileMenuOpen(false); onNavigate("admin"); }}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition-colors"
                                style={{ color: "#f5c842" }}>
                                <ShieldCheck className="w-4 h-4" /> Admin Panel
                              </button>
                            </>
                          )}

                          <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
                          <button onClick={() => { setProfileMenuOpen(false); onLogout?.(); }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition-colors"
                            style={{ color: "#f87171" }}>
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Guest: Sign In / Sign Up ── */
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => onNavigate("login")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: "var(--muted-foreground)" }}>
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
                <button onClick={() => onNavigate("signup")}
                  className="px-4 py-2 rounded-lg text-sm transition-all"
                  style={{ background: "var(--primary)", color: "white" }}>
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 rounded-lg" style={{ color: "var(--muted-foreground)" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t"
              style={{ borderColor: "rgba(108,99,255,0.15)" }}
            >
              <div className="pb-4 pt-2 space-y-0.5">
                {navLinks.map(({ label, page, icon, badge }) => (
                  <button key={page} onClick={() => { onNavigate(page); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-left transition-colors"
                    style={{ color: currentPage === page ? "var(--primary)" : "var(--muted-foreground)", background: currentPage === page ? "rgba(108,99,255,0.08)" : "transparent" }}>
                    {icon} {label}
                    {badge && (
                      <span className="ml-auto text-xs rounded-full px-2 py-0.5"
                        style={{ background: "var(--gold)", color: "#000" }}>{badge}</span>
                    )}
                  </button>
                ))}

                {user && (
                  <>
                    <button onClick={() => { onNavigate("profile"); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-left transition-colors"
                      style={{ color: currentPage === "profile" ? "var(--primary)" : "var(--muted-foreground)", background: currentPage === "profile" ? "rgba(108,99,255,0.08)" : "transparent" }}>
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    {isAdmin && (
                      <button onClick={() => { onNavigate("admin"); setMobileMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-left transition-colors"
                        style={{ color: currentPage === "admin" ? "#f5c842" : "var(--muted-foreground)", background: currentPage === "admin" ? "rgba(245,200,66,0.08)" : "transparent" }}>
                        <ShieldCheck className="w-4 h-4" /> Admin Panel
                      </button>
                    )}
                  </>
                )}

                <div className="border-t mx-1 my-2" style={{ borderColor: "var(--border)" }} />

                {user ? (
                  <div className="px-4">
                    <div className="flex items-center gap-3 py-2 mb-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ background: "linear-gradient(135deg,#6c63ff,#8b5cf6)", color: "white", fontFamily: "Rajdhani,sans-serif" }}>
                        {avatarLetter}
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "var(--foreground)" }}>{user.username}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
                      </div>
                    </div>
                    <button onClick={() => { onLogout?.(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 px-4">
                    <button onClick={() => { onNavigate("login"); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm text-center"
                      style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                      Sign In
                    </button>
                    <button onClick={() => { onNavigate("signup"); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm text-center"
                      style={{ background: "var(--primary)", color: "white" }}>
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
