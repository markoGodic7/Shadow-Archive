import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { MOCK_CARDS, filterCards, type YugiohCard, type BanlistStatus } from "../data/mockCards";
import { AdvancedFilters, FilterState, DEFAULT_FILTERS } from "../components/AdvancedFilters";
import { CardThumbnail } from "../components/CardThumbnail";
import { CardDetailPanel } from "../components/CardDetailPanel";
import { Pagination } from "../components/Pagination";
import { SearchBar } from "../components/SearchBar";

const PAGE_SIZE = 18;

interface AdvancedSearchPageProps {
  wishlist: YugiohCard[];
  onToggleWishlist: (card: YugiohCard) => void;
}

function sortCards(cards: YugiohCard[], sortBy: string): YugiohCard[] {
  const arr = [...cards];
  switch (sortBy) {
    case "name_desc": return arr.sort((a, b) => b.name.localeCompare(a.name));
    case "atk_high": return arr.sort((a, b) => (b.atk ?? -1) - (a.atk ?? -1));
    case "atk_low": return arr.sort((a, b) => (a.atk ?? 9999) - (b.atk ?? 9999));
    case "def_high": return arr.sort((a, b) => (b.def ?? -1) - (a.def ?? -1));
    case "def_low": return arr.sort((a, b) => (a.def ?? 9999) - (b.def ?? 9999));
    default: return arr.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function AdvancedSearchPage({ wishlist, onToggleWishlist }: AdvancedSearchPageProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedCard, setSelectedCard] = useState<YugiohCard | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const wishlistIds = useMemo(() => new Set(wishlist.map(c => c.id)), [wishlist]);

  const filtered = useMemo(() => {
    const f = filterCards(MOCK_CARDS, {
      name: filters.name,
      type: filters.type,
      attribute: filters.attribute as any,
      archetype: filters.archetype,
      race: filters.race,
      minAtk: filters.minAtk ? parseInt(filters.minAtk) : undefined,
      maxAtk: filters.maxAtk ? parseInt(filters.maxAtk) : undefined,
      minDef: filters.minDef ? parseInt(filters.minDef) : undefined,
      maxDef: filters.maxDef ? parseInt(filters.maxDef) : undefined,
      banlist: filters.banlist as BanlistStatus || undefined,
    });
    return sortCards(f, filters.sortBy);
  }, [filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (f: FilterState) => {
    setFilters(f);
    setCurrentPage(1);
    setSelectedCard(null);
  };

  const suggestions = useMemo(() => {
    if (filters.name.length < 2) return [];
    return MOCK_CARDS.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase())).slice(0, 8);
  }, [filters.name]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.75rem", fontWeight: 700, letterSpacing: "0.04em" }}>Advanced Search</h1>
        <p className="text-muted-foreground text-sm mt-1">Filter the complete card database using detailed criteria.</p>
      </div>

      {/* Mobile filter bar */}
      <div className="flex items-center gap-3 lg:hidden">
        <SearchBar
          value={filters.name}
          onChange={(v) => handleFilterChange({ ...filters, name: v })}
          onSubmit={(v) => handleFilterChange({ ...filters, name: v })}
          suggestions={suggestions}
          onSelectSuggestion={(c) => { handleFilterChange({ ...filters, name: c.name }); setSelectedCard(c); }}
          placeholder="Search cards..."
        />
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Selected card */}
      <AnimatePresence mode="wait">
        {selectedCard && (
          <motion.div key={selectedCard.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <CardDetailPanel
              card={selectedCard}
              isInWishlist={wishlistIds.has(selectedCard.id)}
              onToggleWishlist={onToggleWishlist}
              onClose={() => setSelectedCard(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 rounded-xl overflow-hidden sticky top-20 self-start" style={{ background: "var(--card)", border: "1px solid var(--border)", maxHeight: "calc(100vh - 5rem)" }}>
          <AdvancedFilters filters={filters} onChange={handleFilterChange} resultCount={filtered.length} />
        </aside>

        {/* Card grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>{filtered.length}</span> cards found
            </p>
          </div>

          {paged.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-muted-foreground">No cards match your filters.</p>
              <button onClick={() => handleFilterChange(DEFAULT_FILTERS)} className="mt-3 text-sm" style={{ color: "var(--primary)" }}>Reset filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {paged.map(card => (
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
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col"
              style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
            >
              <AdvancedFilters filters={filters} onChange={handleFilterChange} resultCount={filtered.length} mobile onClose={() => setMobileFiltersOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
