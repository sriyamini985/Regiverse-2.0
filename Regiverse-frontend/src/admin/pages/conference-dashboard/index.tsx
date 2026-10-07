import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import {
  BarChart3,
  Upload,
  UserPlus,
  Users,
  Mail,
  MessageSquare,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button, Badge } from "../../components/ui";

const modules = [
  {
    title: "Participants",
    route: "registered-list",
    desc: "View attendee roster, live check-in status, search, and edit records.",
    icon: Users,
  },
  {
    title: "Add Participant",
    route: "add-delegate",
    desc: "Register walk-in attendees and configure badges, meal, and workshop access.",
    icon: UserPlus,
  },
  {
    title: "Import Data (.XLSX)",
    route: "upload",
    desc: "Upload attendee spreadsheet rosters to import records in bulk.",
    icon: Upload,
  },
  {
    title: "Event Dashboard",
    route: "/admin/dashboard",
    desc: "Live charts, meal allocations, badge printing progress, and XLSX export.",
    icon: BarChart3,
  },
  {
    title: "Email Broadcast",
    route: "bulk-email",
    desc: "Send bulk emails to targeted categories or all participants.",
    icon: Mail,
  },
  {
    title: "WhatsApp Broadcast",
    route: "bulk-whatsapp",
    desc: "Send instant WhatsApp notifications and updates to attendees.",
    icon: MessageSquare,
  },
];

const ConferenceDashboard = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();
  const [confName, setConfName] = useState("Loading...");
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
          throw new Error("No matching event found.");
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
        console.error("Event sync error:", err);
        setCount(0);
        setConfName("Unknown Event");
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
        <Link to="/admin/conferences" className="hover:text-[#0F172A]">
          Events
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-[#0F172A]">{confName}</span>
      </div>

      {/* HEADER BANNER */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            {confName}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Event ID: <span className="font-mono">{conferenceId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-center">
            <span className="text-[11px] text-[#64748B] block">Total Registered</span>
            <span className="text-xl font-bold text-[#0F172A]">
              {typeof count === "number" ? count.toLocaleString() : count}
            </span>
          </div>

          <Button
            onClick={() => handleNavigation("add-delegate")}
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Add Participant
          </Button>
        </div>
      </div>

      {/* MODULES GRID */}
      <div>
        <h2 className="text-sm font-semibold text-[#0F172A] mb-3">
          Event Management Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 mb-3">
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    {m.title}
                  </h3>

                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F1F5F9]">
                  <button
                    onClick={() => handleNavigation(m.route)}
                    className="w-full h-9 bg-slate-50 hover:bg-[#0F172A] hover:text-white text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Open</span>
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