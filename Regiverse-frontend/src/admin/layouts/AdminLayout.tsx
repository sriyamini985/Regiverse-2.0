import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Upload,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useConference } from "../../contexts/ConferenceContext";
import { API_URL } from "../../config/api";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [conferences, setConferences] = useState<any[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentConferenceId, setCurrentConferenceId } = useConference();

  // Extract active conference identifier from URL if present
  const pathParts = location.pathname.split("/");
  const confIndex = pathParts.indexOf("conference");
  const urlConferenceId = confIndex !== -1 && pathParts[confIndex + 1] ? pathParts[confIndex + 1] : null;

  // Active event ID priority: URL param -> Context -> LocalStorage -> first available event
  const activeEventId =
    urlConferenceId ||
    currentConferenceId ||
    localStorage.getItem("lastConferenceId") ||
    (conferences.length > 0 ? conferences[0].slug || conferences[0]._id : "");

  // Load available events for topbar event selector
  useEffect(() => {
    fetch(`${API_URL}/api/conferences`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setConferences(list);
        if (!activeEventId && list.length > 0) {
          const firstId = list[0].slug || list[0]._id;
          localStorage.setItem("lastConferenceId", firstId);
        }
      })
      .catch((err) => console.error("Failed to load events", err));
  }, []);

  useEffect(() => {
    if (urlConferenceId) {
      localStorage.setItem("lastConferenceId", urlConferenceId);
      if (setCurrentConferenceId) setCurrentConferenceId(urlConferenceId);
    }
  }, [urlConferenceId, setCurrentConferenceId]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin-login");
  };

  // Determine current page title
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes("/dashboard")) return "Dashboard";
    if (p.includes("/conferences")) return "Events";
    if (p.includes("/upload")) return "Import Data";
    if (p.includes("/registered-list")) return "Participants";
    if (p.includes("/conference/")) return "Event Overview";
    return "Dashboard";
  };

  // Switch event from topbar
  const handleEventChange = (newEventId: string) => {
    if (!newEventId) return;
    localStorage.setItem("lastConferenceId", newEventId);
    if (setCurrentConferenceId) setCurrentConferenceId(newEventId);

    const p = location.pathname;
    if (p.includes("/dashboard")) {
      navigate(`/admin/dashboard?conferenceId=${newEventId}`);
    } else if (p.includes("/upload")) {
      navigate(`/admin/upload?conferenceId=${newEventId}`);
    } else if (p.includes("/conference/")) {
      navigate(`/admin/dashboard?conferenceId=${newEventId}`);
    }
  };

  const navItems = [
    {
      title: "Dashboard",
      href: activeEventId ? `/admin/dashboard?conferenceId=${activeEventId}` : "/admin/dashboard",
      icon: LayoutDashboard,
      active: location.pathname.includes("/dashboard") || location.pathname === "/admin",
    },
    {
      title: "Events",
      href: "/admin/conferences",
      icon: Calendar,
      active: location.pathname.includes("/conferences"),
    },
    {
      title: "Import Data",
      href: activeEventId ? `/admin/upload?conferenceId=${activeEventId}` : "/admin/upload",
      icon: Upload,
      active: location.pathname.includes("/upload"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col lg:flex-row antialiased">
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR: ONLY 3 CORE ADMIN RESPONSIBILITIES */}
      {/* ============================================================== */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-[#E2E8F0] sticky top-0 h-screen transition-all duration-200 z-40 select-none ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Brand */}
        <div className="h-14 px-4 border-b border-[#F1F5F9] flex items-center justify-between shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white font-bold text-sm shrink-0">
              R
            </div>
            {!collapsed && (
              <div>
                <span className="font-bold text-sm tracking-tight text-[#0F172A] block leading-tight">
                  REGIVERSE
                </span>
                <span className="text-[10px] text-[#64748B] block leading-tight">
                  Conference Management
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* MAIN NAVIGATION: ONLY DASHBOARD, EVENTS, IMPORT DATA */}
        <div className="flex-1 py-4 px-2 space-y-4">
          <div className="space-y-0.5">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                MAIN
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  title={collapsed ? item.title : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    item.active
                      ? "bg-slate-100 text-[#0F172A] font-semibold"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* SYSTEM SECTION */}
        <div className="p-3 border-t border-[#F1F5F9] bg-white shrink-0 space-y-1">
          {!collapsed && (
            <div className="px-2 pb-1 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
              SYSTEM
            </div>
          )}

          <div
            className={`flex items-center gap-2.5 p-2 rounded-lg ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
              {(user?.email?.[0] || "A").toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#0F172A] truncate">
                  {user?.email || "admin@regiverse.com"}
                </p>
                <p className="text-[10px] text-[#64748B] truncate">Administrator</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE TOPBAR */}
      {/* ============================================================== */}
      <div className="lg:hidden bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <span className="font-bold text-sm text-[#0F172A]">REGIVERSE</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#E2E8F0] bg-white p-3 space-y-2">
            <div className="text-[10px] font-semibold text-[#64748B] uppercase px-2">
              MAIN
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                    item.active
                      ? "bg-slate-100 text-[#0F172A] font-semibold"
                      : "text-[#64748B] hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Simple Top Bar */}
        <header className="hidden lg:flex h-14 bg-white border-b border-[#E2E8F0] px-6 items-center justify-between sticky top-0 z-30">
          {/* Left: Page Title + Clean Event Selector */}
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold text-[#0F172A] tracking-tight">
              {getPageTitle()}
            </h1>

            {conferences.length > 0 && (
              <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                <span className="text-xs text-[#64748B] font-medium">Event:</span>
                <select
                  value={activeEventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="h-8 pl-2.5 pr-7 bg-slate-50 border border-[#CBD5E1] rounded-md text-xs font-semibold text-[#0F172A] outline-none focus:border-[#0F172A] cursor-pointer"
                >
                  {conferences.map((c) => (
                    <option key={c._id} value={c.slug || c._id}>
                      {c.name || c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Admin Account & Sign Out */}
          <div className="flex items-center gap-4 text-xs text-[#64748B]">
            <span className="font-medium text-[#0F172A]">
              {user?.email || "admin@regiverse.com"}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-slate-500 hover:text-[#0F172A] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}