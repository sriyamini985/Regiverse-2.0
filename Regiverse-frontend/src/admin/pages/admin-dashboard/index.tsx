import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useConferenceData } from "../../../hooks/useConferenceData";
import { API_URL } from "../../../config/api";
import * as XLSX from "xlsx";
import { Download, RefreshCw, Layers, Calendar, ExternalLink } from "lucide-react";
import TopStats from "./components/TopStats";
import DayTabs from "./components/DayTabs";
import HighlightCards from "./components/HighlightCards";
import ChartsSection from "./components/ChartsSection";
import { Button, Select, Badge, EmptyState } from "../../components/ui";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryConfId = searchParams.get("conferenceId") || "";

  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [conferences, setConferences] = useState<any[]>([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState(queryConfId);
  const [loadingConferences, setLoadingConferences] = useState(true);

  // Fetch all conferences to populate selection dropdown
  useEffect(() => {
    const fetchConfs = async () => {
      try {
        setLoadingConferences(true);
        const res = await fetch(`${API_URL}/api/conferences`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setConferences(list);

        // Auto-select conference if not set by query param
        if (!selectedConferenceId && list.length > 0) {
          const defaultId = list[0].slug || list[0]._id;
          setSelectedConferenceId(defaultId);
        }
      } catch (err) {
        console.error("Failed to fetch conferences list", err);
      } finally {
        setLoadingConferences(false);
      }
    };
    fetchConfs();
  }, []);

  // Sync state if query parameter changes
  useEffect(() => {
    if (queryConfId) {
      setSelectedConferenceId(queryConfId);
    }
  }, [queryConfId]);

  // Load real-time database stats using hook
  const { participants, loading: loadingStats, refresh, stats } = useConferenceData(
    selectedConferenceId || undefined
  );

  const dayKey = selectedDay.toLowerCase().replace(" ", ""); // "day1"
  const mealsForDay = stats?.food?.[dayKey] || { breakfast: 0, lunch: 0, dinner: 0 };

  const activeConf = conferences.find(
    (c) => c._id === selectedConferenceId || c.slug === selectedConferenceId
  );

  const handleDownloadExcel = () => {
    if (!participants || participants.length === 0) {
      alert("No registration records found to download.");
      return;
    }

    const formattedData = participants.map((p, index) => ({
      "S.No": index + 1,
      "Registration ID": p.regId || "N/A",
      "Name": p.name || "",
      "Email": p.email || "",
      "Phone": p.phone || "",
      "Category": p.category || "",
      "State/City": p.state || "",
      "Checked In": p.isCheckedIn ? "Yes" : "No",
      "Kitbag Collected": p.kitbagCollected ? "Yes" : "No",
      "Certificate Issued": p.certificateGiven ? "Yes" : "No",
      "Printed": p.printed ? "Yes" : "No",
      "Registration Date": p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registration List");

    const cleanName = (activeConf?.name || activeConf?.title || "Event").replace(/\s+/g, "_");
    const filename = `${cleanName}_Registration_List.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  const handleConfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedConferenceId(val);
    setSearchParams({ conferenceId: val });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* TOP COMMAND HEADER */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/70">
              Operations Center
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Stream</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Onsite Analytics Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
            Live delegate counts, meal distribution, attendance records, and operational reporting.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
          {/* Workspace Selector */}
          <div className="flex-1 sm:flex-initial min-w-[220px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Workspace
            </label>
            <select
              value={selectedConferenceId}
              onChange={handleConfChange}
              disabled={loadingConferences}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
            >
              {conferences.map((c) => (
                <option key={c._id} value={c.slug || c._id}>
                  {c.name || c.title}
                </option>
              ))}
              {conferences.length === 0 && !loadingConferences && (
                <option value="">No conferences available</option>
              )}
            </select>
          </div>

          {/* Quick Hub Link */}
          {selectedConferenceId && (
            <Link
              to={`/admin/conference/${selectedConferenceId}`}
              className="h-11 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
              title="Open Workspace Terminal"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Workspace Hub</span>
            </Link>
          )}

          {/* Export Roster Button */}
          <Button
            onClick={handleDownloadExcel}
            disabled={loadingStats || participants.length === 0}
            variant="primary"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            Export Roster (.XLSX)
          </Button>
        </div>
      </div>

      {/* Syncing indicator */}
      {(loadingConferences || loadingStats) && (
        <div className="bg-blue-50/80 border border-blue-200/70 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-blue-700">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Synchronizing live operational metrics with server...</span>
        </div>
      )}

      {/* Empty State if No Conferences */}
      {!loadingConferences && conferences.length === 0 ? (
        <EmptyState
          title="No Event Workspaces Found"
          description="Create your first conference workspace to start tracking real-time registrations and onsite operations."
          actionLabel="Go to Event Ecosystem"
          onAction={() => (window.location.href = "/admin/conferences")}
        />
      ) : (
        <>
          {/* ============================================================== */}
          {/* KPI STATS SECTION */}
          {/* ============================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Registration & Onsite KPIs
              </h2>
              <span className="text-xs font-medium text-slate-400">
                Auto-updates via WebSocket
              </span>
            </div>
            <TopStats
              total={stats?.total || 0}
              checkedIn={stats?.checkedIn || 0}
              printed={stats?.printed || 0}
              certificateGiven={stats?.certificateGiven || 0}
              kitbagCollected={stats?.kitbagCollected || 0}
              isLoading={loadingStats}
            />
          </div>

          {/* ============================================================== */}
          {/* MEAL DISTRIBUTION BY SCHEDULE DAY */}
          {/* ============================================================== */}
          <div className="space-y-4">
            <DayTabs
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />

            <HighlightCards
              meals={mealsForDay}
              total={stats?.total || 0}
              selectedDay={selectedDay}
            />
          </div>

          {/* ============================================================== */}
          {/* OPERATIONAL SCAN DISTRIBUTION CHARTS */}
          {/* ============================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Operational Scan Breakdown
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Real-time status across badges, kitbags, meals, certificates, and hall checkpoints.
                </p>
              </div>
            </div>

            <ChartsSection
              data={{
                badges: {
                  printed: stats?.printed || 0,
                  notPrinted: Math.max(0, (stats?.total || 0) - (stats?.printed || 0)),
                },
                meals: mealsForDay,
                kitbags: {
                  given: stats?.kitbagCollected || 0,
                  pending: Math.max(0, (stats?.total || 0) - (stats?.kitbagCollected || 0)),
                },
                certificates: {
                  issued: stats?.certificateGiven || 0,
                  pending: Math.max(0, (stats?.total || 0) - (stats?.certificateGiven || 0)),
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;