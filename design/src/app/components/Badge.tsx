import { type YugiohCard, type BanlistStatus } from "../data/mockCards";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "gold" | "danger" | "warning" | "success" | "muted" | "spell" | "trap" | "synchro" | "xyz" | "link";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<string, { background: string; color: string; border?: string }> = {
  default: { background: "rgba(108,99,255,0.15)", color: "#a5b4fc", border: "1px solid rgba(108,99,255,0.3)" },
  primary: { background: "rgba(108,99,255,0.2)", color: "#6c63ff", border: "1px solid rgba(108,99,255,0.4)" },
  gold: { background: "rgba(245,200,66,0.15)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.3)" },
  danger: { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
  warning: { background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" },
  success: { background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" },
  muted: { background: "rgba(123,127,168,0.1)", color: "#7b7fa8", border: "1px solid rgba(123,127,168,0.2)" },
  spell: { background: "rgba(0,191,174,0.15)", color: "#34d8cd", border: "1px solid rgba(0,191,174,0.3)" },
  trap: { background: "rgba(188,43,117,0.15)", color: "#e879a8", border: "1px solid rgba(188,43,117,0.3)" },
  synchro: { background: "rgba(220,220,220,0.1)", color: "#e2e8f0", border: "1px solid rgba(220,220,220,0.25)" },
  xyz: { background: "rgba(40,40,80,0.3)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" },
  link: { background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" },
};

export function Badge({ children, variant = "default", size = "sm", className = "" }: BadgeProps) {
  const style = variantStyles[variant] || variantStyles.default;
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export function CardTypeBadge({ card }: { card: YugiohCard }) {
  const type = card.frameType || card.type;
  if (type.includes("spell") || card.type.includes("Spell")) return <Badge variant="spell">Spell</Badge>;
  if (type.includes("trap") || card.type.includes("Trap")) return <Badge variant="trap">Trap</Badge>;
  if (type.includes("synchro")) return <Badge variant="synchro">Synchro</Badge>;
  if (type.includes("xyz")) return <Badge variant="xyz">XYZ</Badge>;
  if (type.includes("link")) return <Badge variant="link">Link</Badge>;
  if (type.includes("fusion")) return <Badge variant="gold">Fusion</Badge>;
  if (card.type.includes("Effect")) return <Badge variant="warning">Effect</Badge>;
  return <Badge variant="muted">Normal</Badge>;
}

export function AttributeBadge({ attribute }: { attribute?: string }) {
  if (!attribute) return null;
  const attrColors: Record<string, string> = {
    DARK: "default",
    LIGHT: "gold",
    FIRE: "danger",
    WATER: "link",
    EARTH: "success",
    WIND: "spell",
    DIVINE: "gold",
  };
  return <Badge variant={(attrColors[attribute] as BadgeProps["variant"]) || "muted"}>{attribute}</Badge>;
}

export function BanlistBadge({ status }: { status?: BanlistStatus }) {
  if (!status) return <Badge variant="muted">Unlimited</Badge>;
  if (status === "Forbidden") return <Badge variant="danger">Forbidden</Badge>;
  if (status === "Limited") return <Badge variant="warning">Limited</Badge>;
  if (status === "Semi-Limited") return <Badge variant="gold">Semi-Limited</Badge>;
  return <Badge variant="success">Unlimited</Badge>;
}

export function RarityBadge({ rarity }: { rarity?: string }) {
  if (!rarity) return null;
  if (rarity.includes("Secret")) return <Badge variant="primary" size="sm">Secret Rare</Badge>;
  if (rarity.includes("Ultra")) return <Badge variant="gold" size="sm">Ultra Rare</Badge>;
  if (rarity.includes("Super")) return <Badge variant="default" size="sm">Super Rare</Badge>;
  if (rarity.includes("Rare")) return <Badge variant="muted" size="sm">Rare</Badge>;
  return <Badge variant="muted" size="sm">Common</Badge>;
}
