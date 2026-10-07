import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config/api";
import {
  Calendar,
  Plus,
  Search,
  ExternalLink,
  Layers,
  Users,
  BarChart3,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Globe,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { Button, Input, Card, Badge, EmptyState, Modal } from "../../components/ui";

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

  // Search & Filter
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
      console.error("Failed to load conferences", err);
      setError(err.message || "Failed to load conferences from backend");
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
          errData.message || `Server error ${res.status} when creating workspace`
        );
      }
    } catch (err: any) {
      console.error("Create conference failed", err);
      setError(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Conferences
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* HEADER SECTION */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/70">
              Workspaces Directory
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Tenant Cluster Active</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Event Ecosystem
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
            Deploy, monitor, and manage isolated conference environments and operational suites.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full md:w-auto"
          >
            Create New Workspace
          </Button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-rose-50 text-rose-800 border border-rose-200/90 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Backend Connection Notice: </span>
              <span>{error}</span>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="px-2 py-1 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEARCH & FILTERS BAR */}
      {/* ============================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search workspaces by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs font-semibold bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 self-end sm:self-center">
          <span>Total Workspaces:</span>
          <Badge variant="primary" size="md">
            {conferences.length} Available
          </Badge>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CONFERENCES GRID */}
      {/* ============================================================== */}
      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredConferences.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching workspaces found" : "No event workspaces yet"}
          description={
            searchQuery
              ? `No workspaces matched "${searchQuery}". Try a different keyword.`
              : "Initialize your first conference workspace to begin attendee registration and operational management."
          }
          actionLabel={searchQuery ? "Clear Search" : "Create Workspace"}
          onAction={() => (searchQuery ? setSearchQuery("") : setIsCreateOpen(true))}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConferences.map((conf) => {
            const confSlugOrId = conf.slug || conf._id;
            return (
              <div
                key={conf._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <Badge variant="success" size="sm" dot>
                      Active Hub
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {conf.title || conf.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate">
                      {conf.slug || conf._id}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => navigate(`/admin/conference/${confSlugOrId}`)}
                    className="w-full h-11 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs"
                  >
                    <span>Enter Workspace Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/admin/conference/${confSlugOrId}/registered-list`)}
                      className="h-8 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Roster</span>
                    </button>
                    <button
                      onClick={() => navigate(`/admin/dashboard?conferenceId=${confSlugOrId}`)}
                      className="h-8 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <BarChart3 className="w-3 h-3 text-slate-400" />
                      <span>Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE WORKSPACE MODAL */}
      {/* ============================================================== */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Initialize New Conference Workspace"
        description="Creates an isolated operational environment for attendees, check-in, and mass communication."
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
              Deploy Workspace
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Conference Title *"
            placeholder="e.g. Annual Medical Congress 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            helperText="A clean URL slug will be automatically generated from this name."
          />
          {title.trim() && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Generated Workspace URL Slug:
              </span>
              <p className="font-mono font-bold text-blue-600">
                {title.toLowerCase().replace(/\s+/g, "-")}-****
              </p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Conferences;