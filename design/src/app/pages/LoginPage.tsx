import { useState } from "react";
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (email: string) => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Demo credentials
const DEMO_EMAIL = "duelist@yugioh.com";
const DEMO_PASSWORD = "shadow123";

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      onLogin(email);
    } else {
      setErrors({ general: "Invalid email or password. Try demo credentials below." });
    }
  }

  const inputClass = (err?: string) =>
    `w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground`;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: "linear-gradient(135deg, #0d0e1f 0%, #111330 50%, #0a0b1a 100%)" }}>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: "var(--primary)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-15"
          style={{ background: "var(--accent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-2xl opacity-10"
          style={{ background: "var(--gold)" }} />

        {/* Card showcase */}
        <div className="relative z-10 flex items-end gap-4 mb-12">
          {[
            { img: "https://images.ygoprodeck.com/images/cards/89631139.jpg", rotate: "-8deg", z: 1, scale: 0.9 },
            { img: "https://images.ygoprodeck.com/images/cards/46986414.jpg", rotate: "0deg", z: 3, scale: 1 },
            { img: "https://images.ygoprodeck.com/images/cards/38033121.jpg", rotate: "8deg", z: 2, scale: 0.9 },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 + i * 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.6, type: "spring" }}
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{
                width: card.z === 3 ? 160 : 130,
                transform: `rotate(${card.rotate}) scale(${card.scale})`,
                zIndex: card.z,
                boxShadow: card.z === 3
                  ? "0 20px 60px rgba(108,99,255,0.5), 0 0 40px rgba(108,99,255,0.2)"
                  : "0 12px 40px rgba(0,0,0,0.6)",
              }}
            >
              <img src={card.img} alt="card" className="w-full" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative z-10 text-center max-w-md"
        >
          <h2 className="mb-3" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "2rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.04em" }}>
            Your Ultimate Card Database
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Search, browse, and track over 12,000 Yu-Gi-Oh! cards. Build your wishlist and master every duel.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {[
              { value: "12K+", label: "Cards" },
              { value: "500+", label: "Archetypes" },
              { value: "100+", label: "Sets" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>{value}</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-10"
        style={{ background: "var(--background)" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <button onClick={() => onNavigate("search")} className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6c63ff, #8b5cf6)" }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground" style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.1em" }}>YU-GI-OH!</div>
              <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.06em", lineHeight: 1, color: "var(--foreground)" }}>CARD EXPLORER</div>
            </div>
          </button>

          <div className="mb-8">
            <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "2rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--foreground)" }}>
              Welcome back, Duelist
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              Sign in to access your wishlist and collection.
            </p>
          </div>

          {/* Demo hint */}
          <div className="flex items-start gap-3 p-3 rounded-xl mb-6 text-xs"
            style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)" }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
            <div style={{ color: "var(--muted-foreground)" }}>
              <strong style={{ color: "var(--primary)" }}>Demo credentials: </strong>
              {DEMO_EMAIL} / {DEMO_PASSWORD}
            </div>
          </div>

          {/* General error */}
          {errors.general && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.general}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--foreground)" }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: errors.email ? "#f87171" : "var(--muted-foreground)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined, general: undefined })); }}
                  placeholder="duelist@yugioh.com"
                  className={inputClass(errors.email)}
                  style={{
                    background: "var(--secondary)",
                    border: `1px solid ${errors.email ? "rgba(239,68,68,0.5)" : "var(--border)"}`,
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm" style={{ color: "var(--foreground)" }}>Password</label>
                <button type="button" className="text-xs hover:underline" style={{ color: "var(--primary)" }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: errors.password ? "#f87171" : "var(--muted-foreground)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined, general: undefined })); }}
                  placeholder="••••••••"
                  className={inputClass(errors.password)}
                  style={{
                    background: "var(--secondary)",
                    border: `1px solid ${errors.password ? "rgba(239,68,68,0.5)" : "var(--border)"}`,
                    paddingRight: "2.75rem",
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded flex items-center justify-center transition-all shrink-0"
                style={{
                  background: rememberMe ? "var(--primary)" : "transparent",
                  border: `1.5px solid ${rememberMe ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                {rememberMe && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Remember me for 30 days</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all duration-200 mt-2"
              style={{
                background: loading ? "rgba(108,99,255,0.5)" : "var(--primary)",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>or continue with</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Google", icon: "G" },
                { label: "Discord", icon: "D" },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--muted)", color: "var(--foreground)" }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm mt-8" style={{ color: "var(--muted-foreground)" }}>
            New to Card Explorer?{" "}
            <button onClick={() => onNavigate("signup")} className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
              Create an account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
