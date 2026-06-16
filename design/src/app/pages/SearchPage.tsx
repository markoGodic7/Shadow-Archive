import { useState, useMemo } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_CARDS, filterCards, type YugiohCard } from "../data/mockCards";
import { SearchBar } from "../components/SearchBar";
import { CardThumbnail } from "../components/CardThumbnail";
import { CardDetailPanel } from "../components/CardDetailPanel";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 12;

const FEATURED_CARDS = MOCK_CARDS.filter(c =>
  ["Blue-Eyes White Dragon", "Dark Magician", "Exodia the Forbidden One", "Stardust Dragon"].includes(c.name)
);

interface SearchPageProps {
  wishlist: YugiohCard[];
  onToggleWishlist: (card: YugiohCard) => void;
}

export function SearchPage({ wishlist, onToggleWishlist }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<YugiohCard | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const wishlistIds = useMemo(() => new Set(wishlist.map(c => c.id)), [wishlist]);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    return MOCK_CARDS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  }, [query]);

  const searchResults = useMemo(() => {
    if (!submittedQuery) return MOCK_CARDS;
    return filterCards(MOCK_CARDS, { name: submittedQuery });
  }, [submittedQuery]);

  const totalPages = Math.ceil(searchResults.length / PAGE_SIZE);
  const pagedResults = searchResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSubmit = (val: string) => {
    setSubmittedQuery(val);
    setCurrentPage(1);
    setSelectedCard(null);
  };

  const handleSelectSuggestion = (card: YugiohCard) => {
    setQuery(card.name);
    setSubmittedQuery(card.name);
    setSelectedCard(card);
    setCurrentPage(1);
  };

  const isSearching = submittedQuery.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Search */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs" style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.25)", color: "var(--primary)" }}>
          <Sparkles className="w-3.5 h-3.5" />
          12,000+ Cards in Database
        </div>
        <h1 className="mb-3" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "0.04em", color: "var(--foreground)" }}>
          Find Any <span style={{ color: "var(--primary)" }}>Yu-Gi-Oh!</span> Card
        </h1>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm">
          Search the complete card database. Browse stats, effects, ban lists, and set information.
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
            autoFocus
          />
        </div>
      </div>

      {/* Selected Card Detail */}
      <AnimatePresence mode="wait">
        {selectedCard && (
          <motion.div key={selectedCard.id} className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <CardDetailPanel
              card={selectedCard}
              isInWishlist={wishlistIds.has(selectedCard.id)}
              onToggleWishlist={onToggleWishlist}
              onClose={() => setSelectedCard(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results or Featured */}
      {isSearching ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-muted-foreground text-sm">
              <span className="text-foreground" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>{searchResults.length}</span> results for "<span style={{ color: "var(--primary)" }}>{submittedQuery}</span>"
            </h2>
          </div>
          {searchResults.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🃏</div>
              <p className="text-muted-foreground">No cards found for "{submittedQuery}"</p>
              <button onClick={() => { setQuery(""); setSubmittedQuery(""); }} className="mt-3 text-sm" style={{ color: "var(--primary)" }}>Clear search</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {pagedResults.map(card => (
                  <CardThumbnail
                    key={card.id}
                    card={card}
                    isInWishlist={wishlistIds.has(card.id)}
                    onToggleWishlist={onToggleWishlist}
                    onSelect={setSelectedCard}
                  />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4" style={{ color: "var(--gold)" }} />
            <h2 style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>Featured Cards</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURED_CARDS.map(card => (
              <CardThumbnail
                key={card.id}
                card={card}
                isInWishlist={wishlistIds.has(card.id)}
                onToggleWishlist={onToggleWishlist}
                onSelect={setSelectedCard}
              />
            ))}
          </div>

          {/* All cards */}
          <div className="flex items-center justify-between mt-10 mb-4">
            <h2 style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>All Cards</h2>
            <span className="text-xs text-muted-foreground">{MOCK_CARDS.length} cards</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {MOCK_CARDS.map(card => (
              <CardThumbnail
                key={card.id}
                card={card}
                isInWishlist={wishlistIds.has(card.id)}
                onToggleWishlist={onToggleWishlist}
                onSelect={setSelectedCard}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
