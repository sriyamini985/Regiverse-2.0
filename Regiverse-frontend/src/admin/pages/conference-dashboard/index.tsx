import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import {
  BarChart3,
  UploadCloud,
  UserPlus,
  Users,
  Mail,
  MessageSquare,
  ArrowRight,
  Globe,
  Radio,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { Button, Badge, Card } from "../../components/ui";

const modules = [
  {
    title: "Registered Attendees",
    route: "registered-list",
    desc: "Full delegate roster with real-time operational status, search, and editing.",
    icon: Users,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    badge: "Core Roster",
  },
  {
    title: "Add Delegate Terminal",
    route: "add-delegate",
    desc: "Manual registration counter for on-ground walk-in guests and access configuration.",
    icon: UserPlus,
    iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    badge: "Registration",
  },
  {
    title: "Import Database (.XLSX)",
    route: "upload",
    desc: "Batch synchronize attendee records via automated spreadsheet ingestion.",
    icon: UploadCloud,
    iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    badge: "Batch Ingest",
  },
  {
    title: "Executive Analytics",
    route: "/admin/dashboard",
    desc: "Live charts, meal allocations, badge printing progress, and XLSX export.",
    icon: BarChart3,
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    badge: "Reporting",
  },
  {
    title: "Bulk Email Engine",
    route: "bulk-email",
    desc: "Mass broadcast platform with banner image embeds and category targeting.",
    icon: Mail,
    iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    badge: "Broadcast",
  },
  {
    title: "Bulk WhatsApp Messaging",
    route: "bulk-whatsapp",
    desc: "Instant mobile SMS/WhatsApp dispatch for schedule updates and badge alerts.",
    icon: MessageSquare,
    iconBg: "bg-rose-50 text-rose-600 border-rose-100",
    badge: "Mobile Push",
  },
];

const ConferenceDashboard = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();
  const [confName, setConfName] = useState("Loading Workspace...");
  const [count, setCount] = useState<number | string>("...");

  const fetchCount = () => {
    if (!conferenceId) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/conferences`)
      .then((res) => res.json())
      .then((data) => {
        const match = data.find(
          (c: any) => c._id === conferenceId || c.slug === conferenceId
        );

        if (match) {
          setConfName(match.title || match.name);
          return fetch(
            `${import.meta.env.VITE_API_URL}/api/participants/conference/${match._id}?admin=true`
          );
        } else {
          throw new Error("No matching workspace found.");
        }
      })
      .then((res) => {
        if (!res) return;
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (Array.isArray(data)) {
            setCount(data.length);
          } else if (data.data && Array.isArray(data.data)) {
            setCount(data.data.length);
          } else if (typeof data.count === "number") {
            setCount(data.count);
          } else {
            setCount(0);
          }
        }
      })
      .catch((err) => {
        console.error("Workspace synchronization error:", err);
        setCount(0);
        setConfName("Unknown Workspace");
      });
  };

  useEffect(() => {
    if (!conferenceId) return;

    fetchCount();

    const socket = io(`${import.meta.env.VITE_API_URL}`);
    socket.emit("join", conferenceId);

    socket.on("conferenceDataUpdated", (data: any) => {
      if (data?.conferenceId === conferenceId || !data?.conferenceId) {
        fetchCount();
      }
    });

    socket.on("statsUpdated", () => {
      fetchCount();
    });

    return () => {
      socket.off("conferenceDataUpdated");
      socket.off("statsUpdated");
      socket.disconnect();
    };
  }, [conferenceId]);

  const handleNavigation = (route: string) => {
    if (route.startsWith("/")) {
      navigate(`${route}?conferenceId=${conferenceId}`);
    } else {
      navigate(`/admin/conference/${conferenceId}/${route}`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* BREADCRUMB & HEADER */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          to="/admin/conferences"
          className="hover:text-slate-900 transition-colors"
        >
          Event Ecosystem
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">{confName}</span>
      </div>

      {/* TOP HUB BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/70">
              Operations Terminal
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>WebSocket Connected</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            {confName}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
            <span className="text-slate-500 font-medium">Workspace Identifier:</span>
            <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
              {conferenceId}
            </span>
          </div>
        </div>

        {/* METRICS & QUICK CTAS */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Live Roster Count Card */}
          <div className="bg-slate-50 border border-slate-200/80 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Registered Attendees
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {typeof count === "number" ? count.toLocaleString() : count}
              </p>
            </div>
          </div>

          <Button
            onClick={() => handleNavigation("add-delegate")}
            variant="primary"
            size="md"
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Delegate
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* OPERATIONS MODULES GRID */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Operational Workstations
          </h2>
          <span className="text-xs font-medium text-slate-400">
            6 Specialized Subsystems
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${m.iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="neutral" size="sm">
                      {m.badge}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {m.title}
                  </h3>

                  <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleNavigation(m.route)}
                    className="w-full h-11 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 hover:border-transparent transition-all active:scale-[0.98]"
                  >
                    <span>Launch Subsystem</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConferenceDashboard;