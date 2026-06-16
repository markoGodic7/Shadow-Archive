import { useState } from "react";
import { Star, Download, ZoomIn, ZoomOut, X, Layers, Sword, Shield, ChevronDown, ChevronUp, ImageOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { type YugiohCard } from "../data/mockCards";
import { CardTypeBadge, AttributeBadge, BanlistBadge, RarityBadge } from "./Badge";

interface CardDetailPanelProps {
  card: YugiohCard;
  isInWishlist: boolean;
  onToggleWishlist: (card: YugiohCard) => void;
  onClose?: () => void;
}

function StatBar({ label, value, max = 4000 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-8 text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
        />
      </div>
      <span className="text-xs w-10 text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--primary)" }}>{value}</span>
    </div>
  );
}

export function CardDetailPanel({ card, isInWishlist, onToggleWishlist, onClose }: CardDetailPanelProps) {
  const [zoomed, setZoomed] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [setsExpanded, setSetsExpanded] = useState(false);

  const frameGradient: Record<string, string> = {
    normal: "linear-gradient(135deg, rgba(184,134,11,0.15), rgba(139,105,20,0.05))",
    effect: "linear-gradient(135deg, rgba(192,96,0,0.15), rgba(139,69,0,0.05))",
    spell: "linear-gradient(135deg, rgba(0,122,110,0.15), rgba(0,77,69,0.05))",
    trap: "linear-gradient(135deg, rgba(139,0,83,0.15), rgba(96,0,57,0.05))",
    synchro: "linear-gradient(135deg, rgba(180,180,180,0.1), rgba(120,120,120,0.05))",
    xyz: "linear-gradient(135deg, rgba(100,80,200,0.15), rgba(60,40,150,0.05))",
    fusion: "linear-gradient(135deg, rgba(140,60,200,0.15), rgba(80,20,150,0.05))",
    link: "linear-gradient(135deg, rgba(0,80,200,0.15), rgba(0,40,150,0.05))",
  };

  const frame = card.frameType || "normal";
  const gradient = frameGradient[frame] || frameGradient.normal;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:flex-row gap-6 p-6 rounded-2xl"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* Left: Info */}
      <div className="flex-1 min-w-0 order-2 lg:order-1">
        {onClose && (
          <button onClick={onClose} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" /> Close
          </button>
        )}

        <div className="mb-4">
          <h2 className="text-foreground mb-2" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2 }}>
            {card.name}
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <CardTypeBadge card={card} />
            <AttributeBadge attribute={card.attribute} />
            <RarityBadge rarity={card.rarity} />
          </div>
        </div>

        {/* Stats */}
        {(card.atk !== undefined || card.def !== undefined) && (
          <div
            className="p-4 rounded-xl mb-4"
            style={{ background: gradient, border: "1px solid var(--border)" }}
          >
            <div className="flex gap-6 mb-3">
              {card.atk !== undefined && (
                <div className="flex items-center gap-2">
                  <Sword className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  <span className="text-muted-foreground text-sm">ATK</span>
                  <span className="text-foreground" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "var(--primary)" }}>{card.atk}</span>
                </div>
              )}
              {card.def !== undefined && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  <span className="text-muted-foreground text-sm">DEF</span>
                  <span className="text-foreground" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "var(--accent)" }}>{card.def}</span>
                </div>
              )}
              {(card.level || card.rank) !== undefined && (
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" style={{ color: "var(--gold)" }} />
                  <span className="text-muted-foreground text-sm">{card.rank !== undefined ? "Rank" : "Level"}</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "var(--gold)" }}>{card.level ?? card.rank}</span>
                </div>
              )}
            </div>
            {card.atk !== undefined && <StatBar label="ATK" value={card.atk} />}
            {card.def !== undefined && <StatBar label="DEF" value={card.def} />}
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          {[
            { label: "Type", value: card.humanReadableCardType || card.type },
            { label: "Race", value: card.race },
            ...(card.archetype ? [{ label: "Archetype", value: card.archetype }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg p-2.5" style={{ background: "var(--secondary)" }}>
              <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
              <div className="text-foreground">{value}</div>
            </div>
          ))}
          <div className="rounded-lg p-2.5" style={{ background: "var(--secondary)" }}>
            <div className="text-xs text-muted-foreground mb-1">Banlist (TCG)</div>
            <BanlistBadge status={card.banlist_info?.ban_tcg} />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Card Effect / Lore</div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--card-foreground)", opacity: 0.85 }}>{card.desc}</p>
        </div>

        {/* Card Sets */}
        {card.card_sets && card.card_sets.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setSetsExpanded(!setsExpanded)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full text-left transition-colors mb-2"
            >
              <span className="uppercase tracking-wider text-xs">Card Sets</span>
              <span className="text-xs rounded-full px-1.5 py-0.5" style={{ background: "var(--secondary)" }}>{card.card_sets.length}</span>
              {setsExpanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>
            <AnimatePresence>
              {setsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {card.card_sets.map((set, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-2 border-b" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <div className="text-foreground">{set.set_name}</div>
                        <div className="text-muted-foreground">{set.set_code} · {set.set_rarity}</div>
                      </div>
                      <div style={{ color: "var(--gold)" }}>${set.set_price}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Add to wishlist */}
        <button
          onClick={() => onToggleWishlist(card)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl transition-all duration-200 text-sm"
          style={{
            background: isInWishlist ? "rgba(245,200,66,0.15)" : "rgba(108,99,255,0.15)",
            color: isInWishlist ? "var(--gold)" : "var(--primary)",
            border: `1px solid ${isInWishlist ? "rgba(245,200,66,0.3)" : "rgba(108,99,255,0.3)"}`,
          }}
        >
          <Star className="w-4 h-4" fill={isInWishlist ? "currentColor" : "none"} />
          {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>
      </div>

      {/* Right: Image */}
      <div className="w-full lg:w-56 xl:w-64 flex-shrink-0 order-1 lg:order-2">
        <div
          className="relative rounded-xl overflow-hidden cursor-zoom-in"
          style={{ paddingBottom: "145%", background: "var(--secondary)" }}
          onClick={() => setZoomed(true)}
        >
          {!imgError ? (
            <img
              src={card.card_images[0]?.image_url}
              alt={card.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="w-12 h-12 text-muted-foreground opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 flex items-end p-2 opacity-0 hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}>
            <ZoomIn className="w-4 h-4 text-white ml-auto" />
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setZoomed(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
          >
            <ZoomIn className="w-3 h-3" /> Zoom
          </button>
          <a
            href={card.card_images[0]?.image_url}
            download={`${card.name}.jpg`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
          >
            <Download className="w-3 h-3" /> Save
          </a>
        </div>
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={card.card_images[0]?.image_url}
                alt={card.name}
                className="w-full rounded-2xl shadow-2xl"
              />
              <button
                onClick={() => setZoomed(false)}
                className="absolute top-3 right-3 p-2 rounded-full"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
