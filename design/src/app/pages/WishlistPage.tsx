import { useState, useMemo } from "react";
import { Star, Trash2, Search, Download, SortAsc, SortDesc, PackageOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { type YugiohCard } from "../data/mockCards";
import { CardTypeBadge, AttributeBadge } from "../components/Badge";
import { CardDetailPanel } from "../components/CardDetailPanel";

interface WishlistPageProps {
  wishlist: YugiohCard[];
  onToggleWishlist: (card: YugiohCard) => void;
}

export function WishlistPage({ wishlist, onToggleWishlist }: WishlistPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedCard, setSelectedCard] = useState<YugiohCard | null>(null);

  const filtered = useMemo(() => {
    let cards = [...wishlist];
    if (searchQuery) {
      cards = cards.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    cards.sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return cards;
  }, [wishlist, searchQuery, sortAsc]);

  const handleExport = () => {
    const data = wishlist.map(c => ({ id: c.id, name: c.name, type: c.type, archetype: c.archetype }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yugioh-wishlist.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const wishlistIds = useMemo(() => new Set(wishlist.map(c => c.id)), [wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Star className="w-6 h-6" style={{ color: "var(--gold)" }} fill="currentColor" />
            <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.75rem", fontWeight: 700, letterSpacing: "0.04em" }}>My Wishlist</h1>
            <span className="px-2 py-0.5 rounded-full text-sm" style={{ background: "rgba(245,200,66,0.15)", color: "var(--gold)", border: "1px solid rgba(245,200,66,0.3)" }}>
              {wishlist.length} card{wishlist.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Your saved card collection.</p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
            >
              {sortAsc ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              {sortAsc ? "A→Z" : "Z→A"}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
              style={{ background: "rgba(108,99,255,0.15)", color: "var(--primary)", border: "1px solid rgba(108,99,255,0.3)" }}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        )}
      </div>

      {wishlist.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)" }}>
            <PackageOpen className="w-10 h-10" style={{ color: "var(--primary)" }} />
          </div>
          <h2 style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.4rem" }}>Your Wishlist is Empty</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">
            Search for cards and click the star icon to add them to your wishlist.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {["Blue-Eyes White Dragon", "Dark Magician", "Exodia"].map(name => (
              <span key={name} className="px-3 py-1.5 rounded-full text-xs" style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      ) : (
        <>
          {/* Search within wishlist */}
          <div className="relative max-w-sm mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your wishlist..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-foreground outline-none"
              style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
            />
          </div>

          {/* Selected card detail */}
          <AnimatePresence mode="wait">
            {selectedCard && (
              <motion.div key={selectedCard.id} className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <CardDetailPanel
                  card={selectedCard}
                  isInWishlist={wishlistIds.has(selectedCard.id)}
                  onToggleWishlist={(c) => { onToggleWishlist(c); if (selectedCard.id === c.id) setSelectedCard(null); }}
                  onClose={() => setSelectedCard(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No cards match "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {filtered.map((card) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer group transition-all"
                    style={{
                      background: "var(--card)",
                      border: selectedCard?.id === card.id ? "1px solid var(--primary)" : "1px solid var(--border)",
                    }}
                    onClick={() => setSelectedCard(card.id === selectedCard?.id ? null : card)}
                  >
                    {/* Card image */}
                    <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--secondary)" }}>
                      <img
                        src={card.card_images[0]?.image_url_small}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate mb-1" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>{card.name}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <CardTypeBadge card={card} />
                        <AttributeBadge attribute={card.attribute} />
                      </div>
                      {card.archetype && (
                        <p className="text-xs text-muted-foreground truncate">{card.archetype}</p>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleWishlist(card); if (selectedCard?.id === card.id) setSelectedCard(null); }}
                      className="shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: "var(--destructive)", background: "rgba(239,68,68,0.1)" }}
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
