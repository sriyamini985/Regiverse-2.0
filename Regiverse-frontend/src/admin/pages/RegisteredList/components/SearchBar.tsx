import React from "react";
import { Search, X } from "lucide-react";
import { Button } from "../../../components/ui";

interface Props {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const SearchBar: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  onClear,
}) => {
  return (
    <div className="relative flex-1">
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="w-full h-11 pl-10 pr-10 text-xs font-semibold bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
        placeholder="Filter delegates by Name, Email, Phone, or Reg ID..."
      />
      {searchQuery && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;