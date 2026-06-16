import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { type YugiohCard } from "../data/mockCards";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (val: string) => void;
  suggestions: YugiohCard[];
  onSelectSuggestion: (card: YugiohCard) => void;
  isLoading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  suggestions,
  onSelectSuggestion,
  isLoading = false,
  placeholder = "Search for a card by name...",
  autoFocus = false,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDrop = showSuggestions && focused && suggestions.length > 0 && value.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
        style={{
          background: "var(--secondary)",
          border: `1px solid ${focused ? "var(--primary)" : "var(--border)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(108,99,255,0.15)" : "none",
        }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-muted-foreground shrink-0 animate-spin" />
        ) : (
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setShowSuggestions(true); }}
          onFocus={() => { setFocused(true); setShowSuggestions(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { onSubmit(value); setShowSuggestions(false); }
            if (e.key === "Escape") { setShowSuggestions(false); }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
        {value && (
          <button onClick={() => { onChange(""); inputRef.current?.focus(); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => { onSubmit(value); setShowSuggestions(false); }}
          className="px-4 py-1.5 rounded-lg text-sm transition-all"
          style={{ background: "var(--primary)", color: "white" }}
        >
          Search
        </button>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showDrop && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-40"
            style={{ background: "var(--popover)", border: "1px solid var(--border)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}
          >
            {suggestions.slice(0, 6).map((card) => (
              <button
                key={card.id}
                onMouseDown={() => { onSelectSuggestion(card); setShowSuggestions(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-secondary transition-colors text-left"
              >
                <img
                  src={card.card_images[0]?.image_url_cropped}
                  alt={card.name}
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div>
                  <div className="text-sm text-foreground" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>{card.name}</div>
                  <div className="text-xs text-muted-foreground">{card.type} · {card.race}</div>
                </div>
                {card.atk !== undefined && (
                  <div className="ml-auto text-xs text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    ⚔ {card.atk}
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
