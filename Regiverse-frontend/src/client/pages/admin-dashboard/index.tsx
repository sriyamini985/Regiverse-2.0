import { useState, useEffect } from "react";
import { useClientEvent } from "../../contexts/ClientEventContext";
import TopStats from "./components/TopStats";
import DayTabs from "./components/DayTabs";
import HighlightCards from "./components/HighlightCards";
import { Calendar, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react";

interface DashboardStatsData {
  totalDelegates: number;
  badgesIssued: number;
  certificatesIssued: number;
  kitbagsDelivered: number;
  checkedIn: number;
  meals: Record<string, { breakfast: number; lunch: number; dinner: number }>;
}

const Dashboard = () => {
  const { selectedEvent, selectedEventId, loadingEvents, getAuthHeaders } = useClientEvent();
  const [selectedDay, setSelectedDay] = useState("Day 1");

  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch event-scoped dashboard stats whenever the selected event changes
  useEffect(() => {
    if (!selectedEventId) {
      setStats(null);
      setLoadingStats(false);
      return;
    }

    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/stats/${selectedEventId}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `HTTP ${res.status}: Failed to load event data`);
        }

        const data = await res.json();
        if (isMounted) {
          setStats(data.stats);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Dashboard stats fetch error:", err);
          setError(err.message || "Failed to load dashboard metrics for this event.");
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [selectedEventId, getAuthHeaders]);

  if (loadingEvents || (loadingStats && !stats)) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-14 bg-slate-200 rounded-xl w-full max-w-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-10 bg-slate-200 rounded-lg w-72" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 text-xs font-medium space-y-2">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Access Restricted</span>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  const eventName = selectedEvent?.name || selectedEvent?.title || "Selected Event";
  const totalDelegates = stats?.totalDelegates ?? 0;

  // Active day meals from real data
  const dayMeals = stats?.meals?.[selectedDay] || { breakfast: 0, lunch: 0, dinner: 0 };

  const activeDayOperationalData = {
    badges: { printed: stats?.badgesIssued ?? 0, issued: stats?.badgesIssued ?? 0 },
    kitbags: { given: stats?.kitbagsDelivered ?? 0, pending: Math.max(0, totalDelegates - (stats?.kitbagsDelivered ?? 0)) },
    certificates: { issued: stats?.certificatesIssued ?? 0, pending: Math.max(0, totalDelegates - (stats?.certificatesIssued ?? 0)) },
  };

  return (
    <div className="w-full space-y-6">
      {/* ============================================================
          HEADER: REGIVERSE CONFERENCE MANAGEMENT & SELECTED EVENT
      ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Event Operations
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">Live Scoped Metrics</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
            <span>{eventName}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time logistical monitoring, materials distribution, and session attendance.
          </p>
        </div>

        {/* EVENT STATUS PILL */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">Event Status</span>
            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          4 PRIMARY METRIC CARDS (Delegates, Badges, Certificates, Kit Bags)
      ============================================================ */}
      <TopStats data={activeDayOperationalData} totalDelegates={totalDelegates} />

      {/* ============================================================
          DAY SELECTOR TABS
      ============================================================ */}
      <div className="pt-2">
        <DayTabs
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      </div>

      {/* ============================================================
          MEAL ATTENDANCE HIGHLIGHTS (Breakfast, Lunch, Dinner)
      ============================================================ */}
      <HighlightCards
        meals={dayMeals}
        total={totalDelegates}
        selectedDay={selectedDay}
      />
    </div>
  );
};

export default Dashboard;