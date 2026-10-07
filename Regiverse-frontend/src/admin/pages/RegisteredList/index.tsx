import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  UploadCloud,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import SearchBar from "./components/SearchBar";
import DelegateTable from "./components/DelegateTable";
import { Button, Badge, EmptyState } from "../../components/ui";

const RegisteredList = () => {
  const { conferenceId } = useParams();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}?admin=true`
      );

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setParticipants(data);
      } else {
        setParticipants([]);
      }
    } catch (err) {
      console.log("FETCH ERROR:", err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conferenceId) {
      fetchParticipants();
    }
  }, [conferenceId]);

  // Extract unique categories
  const uniqueCategories = useMemo(() => {
    const cats = participants.map((p) => p.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [participants]);

  // Live filter
  const filtered = useMemo(() => {
    let result = participants;

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (!searchQuery.trim()) {
      return result;
    }

    const q = searchQuery.toLowerCase();

    return result.filter((p) =>
      [p.name, p.email, p.phone, p.regId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [participants, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* BREADCRUMB & HEADER */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          to="/admin/conferences"
          className="hover:text-slate-900 transition-colors"
        >
          Event Ecosystem
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          to={`/admin/conference/${conferenceId}`}
          className="hover:text-slate-900 transition-colors"
        >
          Workspace Hub
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">Registered Delegates</span>
      </div>

      {/* TOP COMMAND BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/70">
              Roster Database
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Roster Synced</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Registered Attendees
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
            View full attendee profiles, track live station milestones, and perform real-time profile edits.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={() => navigate(`/admin/conference/${conferenceId}/upload`)}
            variant="outline"
            size="md"
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Import Roster
          </Button>

          <Button
            onClick={() => navigate(`/admin/conference/${conferenceId}/add-delegate`)}
            variant="primary"
            size="md"
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Delegate
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEARCH & FILTERS BAR */}
      {/* ============================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-4">
        {/* Instant Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={() => {}}
          onClear={() => {
            setSearchQuery("");
            setSelectedCategory("");
          }}
        />

        {/* Category Filter Select */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer min-w-[170px]"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Total Roster Pill */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs font-bold text-slate-500 shrink-0">
          <span>Displaying:</span>
          <Badge variant="primary" size="md">
            {filtered.length} of {participants.length}
          </Badge>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DATA TABLE & SKELETON STATES */}
      {/* ============================================================== */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            Fetching latest delegate records from MongoDB cluster...
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <DelegateTable data={filtered} />
      ) : (
        <EmptyState
          title={
            searchQuery || selectedCategory
              ? "No delegates match your filter"
              : "No delegates registered in this workspace"
          }
          description={
            searchQuery || selectedCategory
              ? "Try adjusting your search query or reset the category filter."
              : "Add walk-in delegates manually or upload a batch spreadsheet (.XLSX) to populate this roster."
          }
          actionLabel={
            searchQuery || selectedCategory ? "Clear Filters" : "Add First Delegate"
          }
          onAction={() => {
            if (searchQuery || selectedCategory) {
              setSearchQuery("");
              setSelectedCategory("");
            } else {
              navigate(`/admin/conference/${conferenceId}/add-delegate`);
            }
          }}
        />
      )}
    </div>
  );
};

export default RegisteredList;