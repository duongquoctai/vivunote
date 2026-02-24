"use client";

import { SearchResult } from "@/app/types/map";

interface SearchInputProps {
  id: string;
  query: string;
  loading: boolean;
  onQueryChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string, result: SearchResult) => void;
  activeResults: SearchResult[] | null;
  isActive: boolean;
  isOnlyItem: boolean;
}

const SearchInput = ({
  id,
  query,
  loading,
  onQueryChange,
  onRemove,
  onSelect,
  activeResults,
  isActive,
  isOnlyItem,
}: SearchInputProps) => {
  return (
    <div className="relative" style={{ zIndex: isActive ? 50 : 10 }}>
      <div className="flex items-center gap-3">
        {/* Location Dot */}
        <div className="shrink-0 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>

        {/* Search Input Container */}
        <div className="relative flex-1 group">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(id, e.target.value)}
            placeholder="Tìm kiếm địa điểm..."
            className="w-full pl-3 pr-20 py-2.5 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          />

          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {loading && (
              <div className="p-1.5">
                <svg
                  className="animate-spin h-4 w-4 text-blue-500"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
            {!isOnlyItem && (
              <button
                onClick={() => onRemove(id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors"
                title="Xóa điểm này"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.34 9m-4.74 0-.34-9m9.26-2.35a11.95 11.95 0 0 1-12.83 0m14.3 3a12.605 12.605 0 0 1-16.4 0m16.4 0l-1.5 7.5a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2l-1.5-7.5m10.5 0-2.5-5"
                  />
                </svg>
              </button>
            )}
            <div className="p-1.5 text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196 7.5 7.5 0 0 0 16.003 16.003Z"
                />
              </svg>
            </div>
          </div>

          {/* Dropdown Results */}
          {isActive && activeResults && activeResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-9999 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="max-h-60 overflow-y-auto custom-scrollbar text-left flex flex-col">
                {activeResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelect(id, result)}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group border-b border-zinc-100 dark:border-zinc-800 last:border-none"
                  >
                    <div className="flex flex-col gap-0.5 pointer-events-none">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-1">
                        {result.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {result.display_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
