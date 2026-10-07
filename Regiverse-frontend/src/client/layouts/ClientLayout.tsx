import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useClientEvent } from "../contexts/ClientEventContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  LogOut,
  CalendarX,
  Menu,
  X,
  Layers,
  Sparkles,
  Loader2
} from "lucide-react";

export default function ClientLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    loadingEvents,
    switching,
  } = useClientEvent();

  // Helper to determine link URL (uses event-aware path if selectedEventId exists)
  const getNavPath = (page: "dashboard" | "add-delegate" | "registered-list" | "upload-page") => {
    return selectedEventId ? `/client/events/${selectedEventId}/${page}` : `/client/${page}`;
  };

  const isLinkActive = (page: string) => {
    return location.pathname.includes(`/${page}`);
  };

  const handleSignOut = () => {
    logout();
    navigate("/client-login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800">
      {/* ============================================================
          TOPBAR / HEADER
      ============================================================ */}
      <header className="sticky top-0 z-50 bg-[#0F172A] text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* BRANDING */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">REGIVERSE</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-sm bg-teal-500/20 text-teal-300 border border-teal-500/30">Client</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Conference Management</p>
            </div>
          </div>

          {/* EVENT SELECTOR (COMPACT & PROMINENT) */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              Event:
            </span>

            {loadingEvents ? (
              <div className="h-6 w-36 bg-slate-700/60 rounded animate-pulse" />
            ) : events.length === 0 ? (
              <span className="text-xs text-amber-400 font-medium px-2 py-0.5 bg-amber-950/40 rounded">
                No events assigned
              </span>
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-hidden cursor-pointer pr-2"
                aria-label="Select Event"
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id} className="bg-slate-900 text-white font-medium">
                    {ev.name || ev.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            <Link
              to={getNavPath("dashboard")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isLinkActive("dashboard")
                  ? "bg-slate-800 text-white font-bold border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Dashboard
            </Link>

            <Link
              to={getNavPath("add-delegate")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isLinkActive("add-delegate")
                  ? "bg-slate-800 text-white font-bold border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Add Delegate
            </Link>

            <Link
              to={getNavPath("registered-list")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isLinkActive("registered-list")
                  ? "bg-slate-800 text-white font-bold border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Registered List
            </Link>

            <Link
              to={getNavPath("upload-page")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isLinkActive("upload-page")
                  ? "bg-slate-800 text-white font-bold border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Upload Page
            </Link>
          </nav>

          {/* ACTIONS: USER & SIGN OUT */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-slate-800"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Sign Out</span>
            </button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-hidden"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* MOBILE DRAWER */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-4">
            {/* Event Selector in Mobile */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Target Event
              </label>
              {events.length === 0 ? (
                <p className="text-xs text-amber-400">No events assigned</p>
              ) : (
                <select
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setMenuOpen(false);
                  }}
                  className="w-full bg-slate-900 text-white text-xs font-bold rounded p-2 border border-slate-700"
                >
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.name || ev.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-1 text-sm font-medium">
              <Link
                to={getNavPath("dashboard")}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg ${
                  isLinkActive("dashboard") ? "bg-slate-800 text-white font-bold" : "text-slate-300"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to={getNavPath("add-delegate")}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg ${
                  isLinkActive("add-delegate") ? "bg-slate-800 text-white font-bold" : "text-slate-300"
                }`}
              >
                Add Delegate
              </Link>
              <Link
                to={getNavPath("registered-list")}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg ${
                  isLinkActive("registered-list") ? "bg-slate-800 text-white font-bold" : "text-slate-300"
                }`}
              >
                Registered List
              </Link>
              <Link
                to={getNavPath("upload-page")}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg ${
                  isLinkActive("upload-page") ? "bg-slate-800 text-white font-bold" : "text-slate-300"
                }`}
              >
                Upload Page
              </Link>

              <button
                onClick={handleSignOut}
                className="mt-2 text-left px-3 py-2 text-rose-400 hover:bg-slate-800 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ============================================================
          MAIN BODY WITH EMPTY STATE & SWITCHING TRANSITION
      ============================================================ */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative">
        {/* Switching loading overlay */}
        {switching && (
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-2xs z-30 flex items-center justify-center rounded-xl">
            <div className="bg-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2.5 text-xs font-semibold text-slate-800">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Switching event context...</span>
            </div>
          </div>
        )}

        {/* Empty State when no events are assigned to this client */}
        {!loadingEvents && events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <CalendarX className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">No Events Assigned</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your client account currently has no conference events assigned to it. Please contact your system administrator to be granted access to an event workspace.
            </p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}