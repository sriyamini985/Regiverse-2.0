import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useConferenceData } from "../../../hooks/useConferenceData";
import { API_URL } from "../../../config/api";
import * as XLSX from "xlsx";
import { Download, Users, RefreshCw } from "lucide-react";
import TopStats from "./components/TopStats";
import DayTabs from "./components/DayTabs";
import HighlightCards from "./components/HighlightCards";
import ChartsSection from "./components/ChartsSection";
import { Button, EmptyState } from "../../components/ui";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryConfId = searchParams.get("conferenceId") || "";

  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [conferences, setConferences] = useState<any[]>([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState(
    queryConfId || localStorage.getItem("lastConferenceId") || ""
  );
  const [loadingConferences, setLoadingConferences] = useState(true);

  // Fetch conferences
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

  useEffect(() => {
    if (queryConfId) {
      setSelectedConferenceId(queryConfId);
      localStorage.setItem("lastConferenceId", queryConfId);
    }
  }, [queryConfId]);

  // Load real-time stats
  const { participants, loading: loadingStats, stats } = useConferenceData(
    selectedConferenceId || undefined
  );

  const dayKey = selectedDay.toLowerCase().replace(" ", "");
  const mealsForDay = stats?.food?.[dayKey] || { breakfast: 0, lunch: 0, dinner: 0 };

  const activeConf = conferences.find(
    (c) => c._id === selectedConferenceId || c.slug === selectedConferenceId
  );

  const handleConfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedConferenceId(val);
    setSearchParams({ conferenceId: val });
    localStorage.setItem("lastConferenceId", val);
  };

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
    const filename = `${cleanName}_Registrations.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* PAGE HEADER */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                className="h-9 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] outline-none focus:border-[#0F172A] cursor-pointer shadow-2xs"
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
            Overview of your event and on-site activity.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {selectedConferenceId && (
            <Button
              onClick={() => navigate(`/admin/conference/${selectedConferenceId}`)}
              variant="secondary"
              size="sm"
            >
              Manage Event
            </Button>
          )}

          <Button
            onClick={handleDownloadExcel}
            disabled={loadingStats || participants.length === 0}
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Roster
          </Button>
        </div>
      </div>

      {/* Syncing indicator */}
      {(loadingConferences || loadingStats) && (
        <div className="flex items-center gap-2 text-xs text-[#64748B] py-1">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Updating event data...</span>
        </div>
      )}

      {/* Empty State if No Events */}
      {!loadingConferences && conferences.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="Create your first event to start managing registrations and on-site attendance."
          actionLabel="Create Event"
          onAction={() => navigate("/admin/conferences")}
        />
      ) : (
        <>
          {/* ============================================================== */}
          {/* 5 KPI STATS CARDS */}
          {/* ============================================================== */}
          <TopStats
            total={stats?.total || 0}
            checkedIn={stats?.checkedIn || 0}
            printed={stats?.printed || 0}
            certificateGiven={stats?.certificateGiven || 0}
            kitbagCollected={stats?.kitbagCollected || 0}
            isLoading={loadingStats}
          />

          {/* ============================================================== */}
          {/* MEAL ATTENDANCE BY DAY */}
          {/* ============================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Food & Meal Attendance
              </h2>
            </div>

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
          {/* ON-SITE ACTIVITY BREAKDOWN */}
          {/* ============================================================== */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              On-Site Activity
            </h2>

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