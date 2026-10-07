import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config/api";
import {
  Calendar,
  Plus,
  Search,
  Upload,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Button, Input, Badge, EmptyState, Modal } from "../../components/ui";

interface Conference {
  _id: string;
  title?: string;
  name?: string;
  slug?: string;
  delegates?: number;
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

  // Create Event Form Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [eventName, setEventName] = useState("");

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
      setError(err.message || "Failed to load events from server.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadConferences();
  }, []);

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!eventName.trim()) return;
    setLoading(true);
    setError(null);

    const slug =
      eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString().slice(-4);

    try {
      const res = await fetch(`${API_URL}/api/conferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: eventName, name: eventName, slug }),
      });

      if (res.ok) {
        setEventName("");
        setIsCreateOpen(false);
        await loadConferences();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message || `Server error ${res.status} creating event`
        );
      }
    } catch (err: any) {
      console.error("Create event failed", err);
      setError(err.message || "Failed to create event.");
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ============================================================== */}
      {/* HEADER SECTION */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-5">
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
          leftIcon={<Plus className="w-3.5 h-3.5" />}
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

      {/* SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events by name or ID..."
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
      {/* EVENTS TABLE (CLEAN, PROFESSIONAL LIST) */}
      {/* ============================================================== */}
      {fetching ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B]">
          Loading events...
        </div>
      ) : filteredConferences.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching events" : "No events created yet"}
          description={
            searchQuery
              ? `No events found matching "${searchQuery}".`
              : "Click '+ Create Event' above to set up your first event."
          }
          actionLabel={searchQuery ? "Clear Search" : "+ Create Event"}
          onAction={() => (searchQuery ? setSearchQuery("") : setIsCreateOpen(true))}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">Event Name</th>
                <th className="py-3 px-4">Identifier / Slug</th>
                <th className="py-3 px-4">Registrations</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredConferences.map((conf) => {
                const confSlugOrId = conf.slug || conf._id;
                return (
                  <tr key={conf._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Event Name */}
                    <td className="py-3.5 px-4 font-semibold text-[#0F172A] text-sm">
                      {conf.title || conf.name}
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                      {conf.slug || conf._id}
                    </td>

                    {/* Registrations count */}
                    <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                      {(conf.delegates || 0).toLocaleString()}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {conf.createdAt
                        ? new Date(conf.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/upload?conferenceId=${confSlugOrId}`)
                          }
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-[#CBD5E1] rounded-md transition-colors"
                          title="Import attendee data for this event"
                        >
                          Import Data
                        </button>

                        <button
                          onClick={() => {
                            localStorage.setItem("lastConferenceId", confSlugOrId);
                            navigate(`/admin/dashboard?conferenceId=${confSlugOrId}`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-md transition-colors"
                        >
                          View Dashboard
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE EVENT MODAL */}
      {/* ============================================================== */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Event"
        description="Set up a new conference or event to manage registrations."
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
              disabled={!eventName.trim()}
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
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            autoFocus
            helperText="Enter the official title of the conference or event."
          />
        </form>
      </Modal>
    </div>
  );
};

export default Conferences;