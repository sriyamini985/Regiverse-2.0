import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Upload,
  ChevronRight,
  Filter,
  RefreshCw,
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

  const uniqueCategories = useMemo(() => {
    const cats = participants.map((p) => p.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [participants]);

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
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
        <Link to="/admin/conferences" className="hover:text-[#0F172A]">
          Events
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          to={`/admin/conference/${conferenceId}`}
          className="hover:text-[#0F172A]"
        >
          Manage Event
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-[#0F172A]">Participants</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Participants
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Total registered: {participants.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/admin/conference/${conferenceId}/upload`)}
            variant="secondary"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import Data
          </Button>

          <Button
            onClick={() => navigate(`/admin/conference/${conferenceId}/add-delegate`)}
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Add Participant
          </Button>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={() => {}}
          onClear={() => {
            setSearchQuery("");
            setSelectedCategory("");
          }}
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] outline-none focus:border-[#0F172A] cursor-pointer shadow-2xs min-w-[150px]"
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
              className="text-xs text-slate-500 hover:text-[#0F172A] px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-slate-500 mx-auto" />
          <p className="text-xs text-[#64748B]">Loading participants...</p>
        </div>
      ) : filtered.length > 0 ? (
        <DelegateTable data={filtered} />
      ) : (
        <EmptyState
          title={
            searchQuery || selectedCategory
              ? "No participants match your filter"
              : "No participants registered yet"
          }
          description={
            searchQuery || selectedCategory
              ? "Try adjusting your search query or reset the category filter."
              : "Add walk-in attendees or upload a spreadsheet roster to get started."
          }
          actionLabel={
            searchQuery || selectedCategory ? "Clear Filters" : "Add Participant"
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