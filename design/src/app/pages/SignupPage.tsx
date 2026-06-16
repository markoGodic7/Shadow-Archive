import { useState } from "react";
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { motion } from "motion/react";

interface SignupPageProps {
  onNavigate: (page: string) => void;
  onSignup: (email: string, username: string) => void;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains special character", ok: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : "var(--secondary)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs" style={{ color: score > 0 ? colors[score] : "var(--muted-foreground)" }}>
          {score > 0 ? labels[score] : ""}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: ok ? "#22c55e" : "var(--muted-foreground)", opacity: ok ? 1 : 0.4 }} />
            <span style={{ color: ok ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PERKS = [
  { icon: "⭐", title: "Save Your Wishlist", desc: "Bookmark and track your favorite cards across sessions." },
  { icon: "🃏", title: "Browse 12,000+ Cards", desc: "Full access to every card in the TCG & OCG database." },
  { icon: "🔍", title: "Advanced Search", desc: "Filter by type, attribute, archetype, banlist status, and more." },
  { icon: "📤", title: "Export Your Collection", desc: "Download your wishlist as JSON for use in any app." },
];

export function SignupPage({ onNavigate, onSignup }: SignupPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!username.trim()) errs.username = "Username is required.";
    else if (username.length < 3) errs.username = "Username must be at least 3 characters.";
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) errs.username = "Only letters, numbers and underscores.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (!confirm) errs.confirm = "Please confirm your password.";
    else if (confirm !== password) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !agreed) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setStep("success");
    setTimeout(() => onSignup(email, username), 1800);
  }

  const inputStyle = (err?: string) => ({
    background: "var(--secondary)",
    border: `1px solid ${err ? "rgba(239,68,68,0.5)" : "var(--border)"}`,
  });

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground";

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--background)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.4)" }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: "#22c55e" }} />
          </div>
          <h2 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--foreground)" }}>
            Account Created!
          </h2>
          <p className="text-sm mt-2 mb-6" style={{ color: "var(--muted-foreground)" }}>
            Welcome, <strong style={{ color: "var(--primary)" }}>{username}</strong>! Redirecting you to the card explorer…
          </p>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Left: Perks panel */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 relative overflow-hidden flex-col justify-center p-10 xl:p-14"
        style={{ background: "linear-gradient(160deg, #0d0e1f 0%, #131530 60%, #0a0b1a 100%)" }}>

        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
        <div className="absolute top-1/3 right-0 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "var(--primary)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-36 h-36 rounded-full blur-3xl opacity-15" style={{ background: "var(--accent)" }} />

        {/* Logo */}
        <div className="relative z-10 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6c63ff, #8b5cf6)" }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", color: "var(--foreground)" }}>
              CARD EXPLORER
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="mb-2" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.8rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--foreground)" }}>
            Join the Community
          </h2>
          <p className="text-sm mb-10 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Create your free account and unlock the full power of the card explorer.
          </p>

          <div className="space-y-5">
            {PERKS.map(({ icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.2)" }}>
                  {icon}
                </div>
                <div>
                  <div className="text-sm mb-0.5" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, color: "var(--foreground)" }}>{title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 mt-10 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
            <Shield className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Free forever · No credit card required · Data never sold
            </span>
          </div>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className="w-full lg:w-3/5 xl:w-2/3 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md py-4"
        >
          {/* Mobile logo */}
          <button onClick={() => onNavigate("search")} className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6c63ff, #8b5cf6)" }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.06em", color: "var(--foreground)" }}>
              CARD EXPLORER
            </span>
          </button>

          <div className="mb-8">
            <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "2rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--foreground)" }}>
              Create Your Account
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              Start building your card collection today. It's free.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--foreground)" }}>Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: errors.username ? "#f87171" : "var(--muted-foreground)" }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setErrors(p => ({ ...p, username: undefined })); }}
                  placeholder="YamiYugi2024"
                  className={inputClass}
                  style={inputStyle(errors.username)}
                />
                {username.length >= 3 && !errors.username && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#22c55e" }} />
                )}
              </div>
              {errors.username && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
                  <AlertCircle className="w-3 h-3" /> {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--foreground)" }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: errors.email ? "#f87171" : "var(--muted-foreground)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                  placeholder="you@example.com"
                  className={inputClass}
                  style={inputStyle(errors.email)}
                />
                {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !errors.email && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#22c55e" }} />
                )}
              </div>
              {errors.email && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--foreground)" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: errors.password ? "#f87171" : "var(--muted-foreground)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="Create a strong password"
                  className={inputClass}
                  style={{ ...inputStyle(errors.password), paddingRight: "2.75rem" }}
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
              <PasswordStrength password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--foreground)" }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: errors.confirm ? "#f87171" : "var(--muted-foreground)" }} />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })); }}
                  placeholder="Re-enter your password"
                  className={inputClass}
                  style={{ ...inputStyle(errors.confirm), paddingRight: "2.75rem" }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
                  <AlertCircle className="w-3 h-3" /> {errors.confirm}
                </p>
              )}
              {confirm && confirm === password && !errors.confirm && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#22c55e" }}>
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className="w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 mt-0.5"
                style={{
                  background: agreed ? "var(--primary)" : "transparent",
                  border: `1.5px solid ${agreed ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                {agreed && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
              <span className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                I agree to the{" "}
                <button type="button" className="underline" style={{ color: "var(--primary)" }}>Terms of Service</button>
                {" "}and{" "}
                <button type="button" className="underline" style={{ color: "var(--primary)" }}>Privacy Policy</button>.
                My card wishlist data will be stored locally.
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all duration-200 mt-2"
              style={{
                background: !agreed ? "rgba(108,99,255,0.3)" : loading ? "rgba(108,99,255,0.6)" : "var(--primary)",
                color: "white",
                cursor: loading || !agreed ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>or sign up with</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "Google", icon: "G" }, { label: "Discord", icon: "D" }].map(({ label, icon }) => (
                <button key={label} type="button"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--muted)", color: "var(--foreground)" }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm mt-6" style={{ color: "var(--muted-foreground)" }}>
            Already have an account?{" "}
            <button onClick={() => onNavigate("login")} className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
              Sign in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
