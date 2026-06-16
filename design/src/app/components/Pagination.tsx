import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btnBase = "flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-all duration-150";

  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className={`${btnBase} text-muted-foreground disabled:opacity-30`}
        style={{ background: "var(--secondary)" }}
      >
        <ChevronsLeft className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`${btnBase} text-muted-foreground disabled:opacity-30`}
        style={{ background: "var(--secondary)" }}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="w-8 text-center text-muted-foreground text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={btnBase}
            style={{
              background: currentPage === p ? "var(--primary)" : "var(--secondary)",
              color: currentPage === p ? "white" : "var(--muted-foreground)",
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`${btnBase} text-muted-foreground disabled:opacity-30`}
        style={{ background: "var(--secondary)" }}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        className={`${btnBase} text-muted-foreground disabled:opacity-30`}
        style={{ background: "var(--secondary)" }}
      >
        <ChevronsRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
