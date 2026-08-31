"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { regionLabels } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export interface ChapterOption {
  id: string;
  code: string;
  name: string;
  region: string;
}

// Admin UI stays English-only (no useLanguage() anywhere in this dashboard),
// so this mirrors the public directory's chapter-label format without the
// bilingual branch.
function chapterLabelFor(region: string): string {
  return `${regionLabels[region]?.en ?? region} Chapter`;
}

interface ChapterComboboxProps {
  chapters: ChapterOption[];
  value: ChapterOption | null;
  onChange: (chapter: ChapterOption) => void;
  disabled?: boolean;
}

export function ChapterCombobox({
  chapters,
  value,
  onChange,
  disabled,
}: ChapterComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [chapters, query]);

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOpen(false);
          setQuery("");
        }
      }}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          disabled={disabled}
          placeholder="Search by credit union name or code…"
          value={isOpen ? query : value ? `${value.name} (${value.code})` : ""}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-10 pr-9 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
        />
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform pointer-events-none",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg z-20">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">No credit unions match your search.</p>
          ) : (
            filtered.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                onClick={() => {
                  onChange(chapter);
                  setIsOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors",
                  value?.id === chapter.id && "bg-primary-50"
                )}
              >
                <span className="min-w-0">
                  <span className="text-gray-900 block truncate">{chapter.name}</span>
                  <span className="text-xs text-gray-500">{chapterLabelFor(chapter.region)}</span>
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 shrink-0">
                  {chapter.code}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
