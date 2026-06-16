import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { ATTRIBUTES, CARD_TYPES, RACES, BANLIST_OPTIONS } from "../data/mockCards";

export interface FilterState {
  name: string;
  type: string;
  attribute: string;
  archetype: string;
  race: string;
  minAtk: string;
  maxAtk: string;
  minDef: string;
  maxDef: string;
  banlist: string;
  sortBy: string;
}

const DEFAULT_FILTERS: FilterState = {
  name: "", type: "", attribute: "", archetype: "", race: "",
  minAtk: "", maxAtk: "", minDef: "", maxDef: "", banlist: "", sortBy: "name_asc",
};

interface AdvancedFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
  mobile?: boolean;
  onClose?: () => void;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm text-foreground outline-none cursor-pointer"
        style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
      >
        <option value="">Any</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FilterInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Any"}
        className="w-full px-3 py-2 rounded-lg text-sm text-foreground outline-none"
        style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
      />
    </div>
  );
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full py-2 text-left">
        <span className="text-sm text-foreground" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="space-y-3 pb-4">{children}</div>}
    </div>
  );
}

export function AdvancedFilters({ filters, onChange, resultCount, mobile, onClose }: AdvancedFiltersProps) {
  const activeCount = Object.entries(filters).filter(([k, v]) => k !== "sortBy" && v !== "").length;

  const update = (key: keyof FilterState) => (val: string) => onChange({ ...filters, [key]: val });

  const hasActiveFilters = activeCount > 0;

  return (
    <div className="h-full flex flex-col" style={{ background: mobile ? "transparent" : "var(--card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <span className="text-sm" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>FILTERS</span>
          {activeCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--primary)", color: "white" }}>{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs text-muted-foreground">{resultCount} card{resultCount !== 1 ? "s" : ""} found</span>
      </div>

      {/* Filters scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 divide-y divide-border">
        {/* Sort */}
        <FilterSection title="Sort By" defaultOpen={true}>
          <FilterSelect
            label=""
            value={filters.sortBy}
            onChange={update("sortBy")}
            options={["name_asc", "name_desc", "atk_high", "atk_low", "def_high", "def_low"]}
          />
          <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
            <span>name_asc = A→Z · name_desc = Z→A</span>
            <span>atk_high / atk_low · def_high / def_low</span>
          </div>
        </FilterSection>

        {/* Basic */}
        <FilterSection title="Basic Filters">
          <FilterInput label="Card Name" value={filters.name} onChange={update("name")} placeholder="e.g. Blue-Eyes..." />
          <FilterSelect label="Card Type" value={filters.type} onChange={update("type")} options={CARD_TYPES} />
          <FilterSelect label="Attribute" value={filters.attribute} onChange={update("attribute")} options={ATTRIBUTES} />
          <FilterInput label="Archetype" value={filters.archetype} onChange={update("archetype")} placeholder="e.g. Blue-Eyes..." />
        </FilterSection>

        {/* Monster */}
        <FilterSection title="Monster Filters" defaultOpen={false}>
          <FilterSelect label="Race / Monster Type" value={filters.race} onChange={update("race")} options={RACES} />
          <div className="grid grid-cols-2 gap-2">
            <FilterInput label="Min ATK" value={filters.minAtk} onChange={update("minAtk")} placeholder="0" />
            <FilterInput label="Max ATK" value={filters.maxAtk} onChange={update("maxAtk")} placeholder="9999" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FilterInput label="Min DEF" value={filters.minDef} onChange={update("minDef")} placeholder="0" />
            <FilterInput label="Max DEF" value={filters.maxDef} onChange={update("maxDef")} placeholder="9999" />
          </div>
        </FilterSection>

        {/* Additional */}
        <FilterSection title="Additional Filters" defaultOpen={false}>
          <FilterSelect label="Banlist Status" value={filters.banlist} onChange={update("banlist")} options={BANLIST_OPTIONS} />
        </FilterSection>
      </div>
    </div>
  );
}

export { DEFAULT_FILTERS };
