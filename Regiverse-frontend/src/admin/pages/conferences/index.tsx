import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config/api";
import {
  Calendar,
  Plus,
  Search,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Button, Input, Badge, EmptyState, Modal } from "../../components/ui";

interface Conference {
  _id: string;
  title?: string;
  name?: string;
  slug?: string;
  createdAt?: string;
}

const Conferences: React.FC = () => {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");

  const loadConferences = async () => {
    setError(null);
    setFetching(true);
    try {
      const res = await fetch(`${API_URL}/api/conferences`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      setConferences(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load events", err);
      setError(err.message || "Failed to load events from backend");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadConferences();
  }, []);

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    const slug =
      title.toLowerCase().replace(/\s+/g, "-") +
      "-" +
      Date.now().toString().slice(-4);

    try {
      const res = await fetch(`${API_URL}/api/conferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, name: title, slug }),
      });
      if (res.ok) {
        setTitle("");
        setIsCreateOpen(false);
        await loadConferences();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message || `Server error ${res.status} when creating event`
        );
      }
    } catch (err: any) {
      console.error("Create event failed", err);
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const filteredConferences = useMemo(() => {
    if (!searchQuery.trim()) return conferences;
    const q = searchQuery.toLowerCase();
    return conferences.filter((c) => {
      const name = (c.name || c.title || "").toLowerCase();
      const slug = (c.slug || "").toLowerCase();
      return name.includes(q) || slug.includes(q);
    });
  }, [conferences, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* HEADER SECTION */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Events
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Create and manage your conferences and events.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Create Event
        </Button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-700 hover:underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEARCH BAR */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-white text-[#0F172A] placeholder:text-slate-400 border border-[#CBD5E1] rounded-lg outline-none focus:border-[#0F172A] shadow-2xs"
          />
        </div>

        <span className="text-xs text-[#64748B]">
          {filteredConferences.length} {filteredConferences.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* ============================================================== */}
      {/* EVENTS TABLE / CARDS */}
      {/* ============================================================== */}
      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs animate-pulse space-y-3"
            >
              <div className="h-5 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
              <div className="h-9 bg-slate-100 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : filteredConferences.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching events" : "No events created yet"}
          description={
            searchQuery
              ? `No events found matching "${searchQuery}".`
              : "Click '+ Create Event' above to set up your first event."
          }
          actionLabel={searchQuery ? "Clear Search" : "Create Event"}
          onAction={() => (searchQuery ? setSearchQuery("") : setIsCreateOpen(true))}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConferences.map((conf) => {
            const confSlugOrId = conf.slug || conf._id;
            return (
              <div
                key={conf._id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-[#0F172A] line-clamp-1">
                      {conf.title || conf.name}
                    </h3>
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  </div>

                  <p className="text-xs font-mono text-[#64748B] truncate">
                    ID: {conf.slug || conf._id}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/admin/conference/${confSlugOrId}`)}
                    className="flex-1 h-9 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Manage Event</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => navigate(`/admin/dashboard?conferenceId=${confSlugOrId}`)}
                    className="h-9 px-3 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE EVENT MODAL */}
      {/* ============================================================== */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Event"
        description="Add a new event or conference to manage."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              isLoading={loading}
              disabled={!title.trim()}
            >
              Create Event
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Event Name *"
            placeholder="e.g. Annual Medical Congress 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
};

export default Conferences;