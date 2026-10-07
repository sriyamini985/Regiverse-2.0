import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useClientEvent } from "../../contexts/ClientEventContext";
import SearchBar from "./components/SearchBar";
import DelegateTable from "./components/DelegateTable";
import { Users, UserPlus, RefreshCw, AlertCircle } from "lucide-react";

const RegisteredList = () => {
  const { eventId: routeEventId } = useParams();
  const { selectedEvent, selectedEventId, getAuthHeaders } = useClientEvent();

  const targetConferenceId = routeEventId || selectedEventId;
  const targetConferenceName = selectedEvent?.name || selectedEvent?.title || "Selected Event";

  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchParticipants = async () => {
    if (!targetConferenceId) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/participants/conference/${targetConferenceId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to fetch delegates (HTTP ${response.status})`);
      }

      const data = await response.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Fetch delegates error:", err);
      setError(err.message || "Failed to load delegates for this event.");
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [targetConferenceId, getAuthHeaders]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const q = searchQuery.toLowerCase();
    return participants.filter((p) =>
      [p.name, p.email, p.phone, p.regId, p.category, p.state]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [participants, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Event Roster</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">{targetConferenceName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Registered Delegates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing all delegates registered under <strong>{targetConferenceName}</strong> ({filtered.length} total)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchParticipants}
            disabled={loading}
            className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 shadow-2xs"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            to={targetConferenceId ? `/client/events/${targetConferenceId}/add-delegate` : "/client/add-delegate"}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Delegate</span>
          </Link>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* SEARCH BAR */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => {}}
        onClear={() => setSearchQuery("")}
      />

      {/* TABLE / LOADING / EMPTY */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-8 text-center text-xs font-semibold text-slate-500">
          Loading delegates for {targetConferenceName}...
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
          <DelegateTable data={filtered} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">No Delegates Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No delegates match "${searchQuery}" in ${targetConferenceName}.`
              : `No delegates have been registered for ${targetConferenceName} yet.`}
          </p>
          <div className="pt-2">
            <Link
              to={targetConferenceId ? `/client/events/${targetConferenceId}/add-delegate` : "/client/add-delegate"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs shadow-2xs hover:bg-teal-700"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register First Delegate</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredList;