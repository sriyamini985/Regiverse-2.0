import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useConferenceData } from "../../../hooks/useConferenceData";
import { API_URL } from "../../../config/api";
import {
  Users,
  CheckCircle,
  Plus,
  Upload,
  Calendar,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button, Card, Badge, EmptyState } from "../../components/ui";

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryConfId = searchParams.get("conferenceId") || "";

  const [conferences, setConferences] = useState<any[]>([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState(
    queryConfId || localStorage.getItem("lastConferenceId") || ""
  );
  const [loadingConferences, setLoadingConferences] = useState(true);

  // Fetch events list
  useEffect(() => {
    const fetchConfs = async () => {
      try {
        setLoadingConferences(true);
        const res = await fetch(`${API_URL}/api/conferences`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setConferences(list);

        if (!selectedConferenceId && list.length > 0) {
          const defaultId = list[0].slug || list[0]._id;
          setSelectedConferenceId(defaultId);
          localStorage.setItem("lastConferenceId", defaultId);
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoadingConferences(false);
      }
    };
    fetchConfs();
  }, []);

  // Sync if URL query param changes
  useEffect(() => {
    if (queryConfId) {
      setSelectedConferenceId(queryConfId);
      localStorage.setItem("lastConferenceId", queryConfId);
    }
  }, [queryConfId]);

  // Load real-time participant records & stats
  const { participants, loading: loadingStats, stats } = useConferenceData(
    selectedConferenceId || undefined
  );

  const activeConf = conferences.find(
    (c) => c._id === selectedConferenceId || c.slug === selectedConferenceId
  );

  const handleConfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedConferenceId(val);
    setSearchParams({ conferenceId: val });
    localStorage.setItem("lastConferenceId", val);
  };

  // Category distribution from real data
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    participants.forEach((p) => {
      const cat = p.category && p.category.trim() !== "" ? p.category : "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [participants]);

  // Recent 5 registrations
  const recentParticipants = useMemo(() => {
    return [...participants].slice(-5).reverse();
  }, [participants]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ============================================================== */}
      {/* 1. HEADER SECTION */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Dashboard
            </h1>

            {conferences.length > 0 && (
              <select
                value={selectedConferenceId}
                onChange={handleConfChange}
                disabled={loadingConferences}
                className="h-8 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] outline-none focus:border-[#0F172A] cursor-pointer shadow-2xs"
              >
                {conferences.map((c) => (
                  <option key={c._id} value={c.slug || c._id}>
                    {c.name || c.title}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Overview of your conference.
          </p>
        </div>

        {/* Admin Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate("/admin/conferences")}
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Event
          </Button>

          <Button
            onClick={() =>
              navigate(
                selectedConferenceId
                  ? `/admin/upload?conferenceId=${selectedConferenceId}`
                  : "/admin/upload"
              )
            }
            variant="primary"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import Data
          </Button>
        </div>
      </div>

      {/* Syncing indicator */}
      {(loadingConferences || loadingStats) && (
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Refreshing event data...</span>
        </div>
      )}

      {/* Empty State if No Events */}
      {!loadingConferences && conferences.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="Create your first event to start managing registrations."
          actionLabel="Create Event"
          onAction={() => navigate("/admin/conferences")}
        />
      ) : (
        <>
          {/* ============================================================== */}
          {/* 2. SUMMARY CARDS (HIGH-LEVEL ADMIN METRICS ONLY) */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Registrations */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <span className="text-xs font-medium text-[#64748B] block">
                Total Registrations
              </span>
              <div className="text-2xl font-bold text-[#0F172A] mt-1">
                {(stats?.total || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Registered attendees
              </p>
            </div>

            {/* Total Participants */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <span className="text-xs font-medium text-[#64748B] block">
                Total Participants
              </span>
              <div className="text-2xl font-bold text-[#0F172A] mt-1">
                {participants.length.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Active roster records
              </p>
            </div>

            {/* On-Site Checked In (High-Level overview only) */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <span className="text-xs font-medium text-[#64748B] block">
                Checked In
              </span>
              <div className="text-2xl font-bold text-[#0F172A] mt-1">
                {(stats?.checkedIn || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                {stats?.total > 0
                  ? `${Math.round((stats.checkedIn / stats.total) * 100)}% attendance rate`
                  : "0% attendance"}
              </p>
            </div>

            {/* Event Status */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <span className="text-xs font-medium text-[#64748B] block">
                Event Status
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span className="text-lg font-bold text-[#0F172A]">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Open for registration
              </p>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. EVENT SUMMARY & REGISTRATION OVERVIEW */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Event Summary Details (1 col) */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
              <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
                Event Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#64748B] block">Event Name</span>
                  <span className="font-semibold text-[#0F172A] text-sm">
                    {activeConf?.name || activeConf?.title || "Conference"}
                  </span>
                </div>

                <div>
                  <span className="text-[#64748B] block">Event Identifier</span>
                  <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                    {activeConf?.slug || activeConf?._id || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[#64748B] block">Created Date</span>
                  <span className="font-medium text-[#0F172A]">
                    {activeConf?.createdAt
                      ? new Date(activeConf.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Recently created"}
                  </span>
                </div>

                <div>
                  <span className="text-[#64748B] block">Registration Status</span>
                  <Badge variant="success" size="sm" className="mt-1">
                    Accepting Registrations
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9]">
                <Button
                  onClick={() => navigate("/admin/conferences")}
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                >
                  View All Events
                </Button>
              </div>
            </div>

            {/* Registration Overview & Categories (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                  Registration Overview by Category
                </h2>
                <span className="text-xs text-[#64748B]">
                  {participants.length} total participants
                </span>
              </div>

              {categoryCounts.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#64748B]">
                  No participant data available for this event yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryCounts.map(([category, count]) => {
                    const pct =
                      participants.length > 0
                        ? Math.round((count / participants.length) * 100)
                        : 0;

                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#0F172A]">{category}</span>
                          <span className="text-[#64748B]">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0F766E] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. RECENT REGISTRATIONS (SIMPLE REAL DATA TABLE) */}
          {/* ============================================================== */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
              <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                Recent Registrations
              </h2>
              {selectedConferenceId && (
                <Link
                  to={`/admin/conference/${selectedConferenceId}/registered-list`}
                  className="text-xs font-medium text-[#0F766E] hover:underline flex items-center gap-1"
                >
                  <span>View Full Roster</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {recentParticipants.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#64748B]">
                No registrations found for this event yet. Use &ldquo;Import Data&rdquo; to add participants.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold text-[#64748B] border-b border-[#F1F5F9]">
                      <th className="py-2 px-2">Name</th>
                      <th className="py-2 px-2">Reg ID</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2">Mobile / Email</th>
                      <th className="py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8FAFC]">
                    {recentParticipants.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-2 font-medium text-[#0F172A]">
                          {p.name || "—"}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[11px] text-[#64748B]">
                          {p.regId || p._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-2.5 px-2 text-slate-700">
                          {p.category || "General"}
                        </td>
                        <td className="py-2.5 px-2 text-[#64748B]">
                          {p.phone || p.email || "—"}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              p.isCheckedIn
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}
                          >
                            {p.isCheckedIn ? "Checked In" : "Registered"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;