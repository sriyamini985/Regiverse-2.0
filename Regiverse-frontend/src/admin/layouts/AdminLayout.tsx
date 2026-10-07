import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserPlus,
  UploadCloud,
  Mail,
  MessageSquare,
  QrCode,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useConference } from "../../contexts/ConferenceContext";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentConferenceId } = useConference();

  // Extract conferenceId from pathname if present (e.g. /admin/conference/xyz-123 or /conference/xyz-123)
  const pathParts = location.pathname.split("/");
  const confIndex = pathParts.indexOf("conference");
  const urlConferenceId = confIndex !== -1 && pathParts[confIndex + 1] ? pathParts[confIndex + 1] : null;
  const activeConferenceId = urlConferenceId || currentConferenceId || localStorage.getItem("lastConferenceId");

  // Save last visited conference
  useEffect(() => {
    if (urlConferenceId) {
      localStorage.setItem("lastConferenceId", urlConferenceId);
    }
  }, [urlConferenceId]);

  // Close mobile drawer on route change
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
    if (p.includes("/dashboard")) return "Executive Onsite Analytics";
    if (p.includes("/conferences")) return "Event Workspaces";
    if (p.includes("/registered-list")) return "Registered Delegates";
    if (p.includes("/add-delegate")) return "Participant Registration";
    if (p.includes("/upload")) return "Batch Import Database";
    if (p.includes("/bulk-email")) return "Bulk Email Broadcast";
    if (p.includes("/bulk-whatsapp")) return "Bulk WhatsApp Messaging";
    if (p.includes("/qr-generator")) return "QR Code Generator";
    if (p.includes("/conference/")) return "Staff Operations Hub";
    return "Admin Command Center";
  };

  const navSections = [
    {
      label: "Platform Overview",
      items: [
        {
          title: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          active: location.pathname === "/admin/dashboard",
        },
        {
          title: "Event Ecosystem",
          href: "/admin/conferences",
          icon: Calendar,
          active: location.pathname.includes("/admin/conferences"),
        },
      ],
    },
    ...(activeConferenceId
      ? [
          {
            label: "Active Workspace",
            badge: "Live",
            items: [
              {
                title: "Operations Hub",
                href: `/admin/conference/${activeConferenceId}`,
                icon: Layers,
                active:
                  location.pathname === `/admin/conference/${activeConferenceId}` ||
                  location.pathname === `/conference/${activeConferenceId}`,
              },
              {
                title: "Registered List",
                href: `/admin/conference/${activeConferenceId}/registered-list`,
                icon: Users,
                active: location.pathname.includes("/registered-list"),
              },
              {
                title: "Add Delegate",
                href: `/admin/conference/${activeConferenceId}/add-delegate`,
                icon: UserPlus,
                active: location.pathname.includes("/add-delegate"),
              },
              {
                title: "Import Database",
                href: `/admin/conference/${activeConferenceId}/upload`,
                icon: UploadCloud,
                active: location.pathname.includes("/upload"),
              },
            ],
          },
          {
            label: "Communication",
            items: [
              {
                title: "Bulk Email",
                href: `/admin/conference/${activeConferenceId}/bulk-email`,
                icon: Mail,
                active: location.pathname.includes("/bulk-email"),
              },
              {
                title: "Bulk WhatsApp",
                href: `/admin/conference/${activeConferenceId}/bulk-whatsapp`,
                icon: MessageSquare,
                active: location.pathname.includes("/bulk-whatsapp"),
              },
            ],
          },
        ]
      : []),
    {
      label: "Tools & Utilities",
      items: [
        {
          title: "QR Code Generator",
          href: "/admin/qr-generator",
          icon: QrCode,
          active: location.pathname.includes("/qr-generator"),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col lg:flex-row antialiased">
      {/* ============================================================== */}
      {/* DESKTOP PERSISTENT SIDEBAR */}
      {/* ============================================================== */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200/90 sticky top-0 h-screen transition-all duration-300 z-40 select-none ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <Link
            to="/admin/conferences"
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors shrink-0">
              R
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                  REGIVERSE
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Admin Platform
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {section.label}
                  </span>
                  {section.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {section.badge}
                    </span>
                  )}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      title={collapsed ? item.title : undefined}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        item.active
                          ? "bg-blue-50/80 text-blue-700 shadow-xs border border-blue-100/60"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      } ${collapsed ? "justify-center" : ""}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          item.active
                            ? "text-blue-600"
                            : "text-slate-400 group-hover:text-slate-700"
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* AI-Ready Reserved Indicator */}
          {!collapsed && (
            <div className="p-3 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-blue-50/60 rounded-2xl border border-indigo-100/70 text-xs">
              <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Ops Engine</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Architected for autonomous registration insights & agentic operations.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-indigo-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>System Ready</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Admin Console
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || "admin@regiverse.com"}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE TOPBAR + DRAWER */}
      {/* ============================================================== */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm">
              R
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                REGIVERSE
              </span>
              <span className="block text-[9px] font-bold text-blue-600 uppercase">
                Admin Panel
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white p-4 shadow-xl space-y-4 max-h-[80vh] overflow-y-auto">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  {section.label}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        item.active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA & TOPBAR */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="hidden lg:flex h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 items-center justify-between sticky top-0 z-30">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
            {activeConferenceId && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Workspace:
                </span>
                <Link
                  to={`/admin/conference/${activeConferenceId}`}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-mono font-bold border border-blue-200/80 transition-colors flex items-center gap-1.5"
                  title="View Workspace Hub"
                >
                  <span>{activeConferenceId}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Status & Meta Controls */}
          <div className="flex items-center gap-4">
            {/* Live Sync Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/70 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Cloud Sync</span>
            </div>

            {/* Quick Workspace Switcher CTA */}
            <Link
              to="/admin/conferences"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
            >
              Switch Workspace
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}