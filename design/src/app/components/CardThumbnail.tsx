import { useState } from "react";
import { Star, Eye, ImageOff } from "lucide-react";
import { motion } from "motion/react";
import { type YugiohCard } from "../data/mockCards";
import { CardTypeBadge } from "./Badge";

interface CardThumbnailProps {
  card: YugiohCard;
  isInWishlist: boolean;
  onToggleWishlist: (card: YugiohCard) => void;
  onSelect: (card: YugiohCard) => void;
}

export function CardThumbnail({ card, isInWishlist, onToggleWishlist, onSelect }: CardThumbnailProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const frameGradient: Record<string, string> = {
    normal: "linear-gradient(135deg, #b8860b, #8b6914)",
    effect: "linear-gradient(135deg, #c06000, #8b4500)",
    spell: "linear-gradient(135deg, #007a6e, #004d45)",
    trap: "linear-gradient(135deg, #8b0053, #600039)",
    synchro: "linear-gradient(135deg, #5a5a5a, #3a3a3a)",
    xyz: "linear-gradient(135deg, #1a1a3e, #0d0d20)",
    fusion: "linear-gradient(135deg, #5a2080, #3d1555)",
    link: "linear-gradient(135deg, #003d8b, #00245c)",
  };

  const borderColor: Record<string, string> = {
    normal: "rgba(184,134,11,0.5)",
    effect: "rgba(192,96,0,0.5)",
    spell: "rgba(0,122,110,0.5)",
    trap: "rgba(139,0,83,0.5)",
    synchro: "rgba(200,200,200,0.3)",
    xyz: "rgba(100,80,200,0.5)",
    fusion: "rgba(140,60,200,0.5)",
    link: "rgba(0,80,200,0.5)",
  };

  const frame = card.frameType || "normal";
  const gradient = frameGradient[frame] || frameGradient.normal;
  const border = borderColor[frame] || "rgba(108,99,255,0.3)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      style={{
        background: "var(--card)",
        border: `1px solid ${border}`,
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.4), 0 0 16px ${border}` : "0 2px 8px rgba(0,0,0,0.3)",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Card image */}
      <div className="relative overflow-hidden" style={{ paddingBottom: "145%", background: gradient }}>
        {!imgError ? (
          <img
            src={card.card_images[0]?.image_url_small}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <ImageOff className="w-8 h-8 text-muted-foreground opacity-50" />
            <span className="text-xs text-center text-muted-foreground px-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>{card.name}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.7)", opacity: hovered ? 1 : 0 }}
        >
          <button
            onClick={() => onSelect(card)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ background: "var(--primary)", color: "white" }}
          >
            <Eye className="w-3 h-3" />
            Quick View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(card); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: isInWishlist ? "rgba(245,200,66,0.2)" : "rgba(255,255,255,0.1)",
              color: isInWishlist ? "var(--gold)" : "white",
              border: `1px solid ${isInWishlist ? "rgba(245,200,66,0.4)" : "rgba(255,255,255,0.2)"}`,
            }}
          >
            <Star className="w-3 h-3" fill={isInWishlist ? "currentColor" : "none"} />
            {isInWishlist ? "Saved" : "Wishlist"}
          </button>
        </div>

        {/* Rarity corner badge */}
        {card.rarity && (card.rarity.includes("Secret") || card.rarity.includes("Ultra")) && (
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--gold)", boxShadow: "0 0 6px var(--gold)" }} />
        )}
      </div>

      {/* Card info */}
      <div className="p-2.5">
        <p className="truncate text-sm text-foreground mb-1" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>{card.name}</p>
        <div className="flex items-center justify-between">
          <CardTypeBadge card={card} />
          {card.atk !== undefined && (
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              {card.atk}
            </span>
          )}
        </div>
      </div>

      {/* Wishlist indicator */}
      {isInWishlist && (
        <div className="absolute top-2 left-2">
          <Star className="w-4 h-4" style={{ color: "var(--gold)" }} fill="currentColor" />
        </div>
      )}
    </motion.div>
  );
}
