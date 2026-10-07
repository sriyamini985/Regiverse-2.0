import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Phone,
  Info,
} from "lucide-react";
import { Button, Card, Badge } from "../../components/ui";

interface Participant {
  _id: string;
  name: string;
  phone?: string;
  category?: string;
  workshopScans?: string[];
  conferenceId?: string;
}

const BulkWhatsapp = () => {
  const { conferenceId } = useParams();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusAlert, setStatusAlert] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchParticipants();
  }, [conferenceId]);

  const fetchParticipants = async () => {
    try {
      setFetching(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`
      );
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setParticipants(list);
    } catch (err) {
      console.log(err);
    } finally {
      setFetching(false);
    }
  };

  const getParticipantCategory = (p: Participant) => {
    return p.category && p.category.trim() !== "" ? p.category : "Uncategorized";
  };

  const dbCategories = Array.from(
    new Set(participants.map((p) => getParticipantCategory(p)))
  );
  const allCategoriesList = [...dbCategories, "Workshop Attendees"];

  useEffect(() => {
    if (participants.length > 0) {
      setSelectedCategories(allCategoriesList);
    }
  }, [participants]);

  const filteredParticipants = participants.filter((p: Participant) => {
    const cat = getParticipantCategory(p);
    const categoryMatch = selectedCategories.includes(cat);

    const isWorkshopAttendee = p.workshopScans && p.workshopScans.length > 0;
    const workshopMatch =
      selectedCategories.includes("Workshop Attendees") && isWorkshopAttendee;

    return categoryMatch || workshopMatch;
  });

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const selectAllCategories = () => {
    setSelectedCategories(allCategoriesList);
  };

  const selectNoneCategories = () => {
    setSelectedCategories([]);
  };

  const sendWhatsapp = async () => {
    try {
      if (!message.trim()) {
        alert("Please enter a WhatsApp message body");
        return;
      }
      if (filteredParticipants.length === 0) {
        alert("No recipients selected based on the target filters");
        return;
      }

      setLoading(true);
      setStatusAlert(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bulk-whatsapp/${conferenceId}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            participantIds: filteredParticipants.map((p) => p._id),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to dispatch WhatsApp broadcast");
      }

      setStatusAlert({
        type: "success",
        text: `WhatsApp broadcast completed! Sent: ${data.sent} | Failed: ${data.failed}`,
      });
    } catch (err: any) {
      console.log(err);
      setStatusAlert({
        type: "error",
        text: err.message || "Failed to transmit WhatsApp broadcast",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/admin/conferences" className="hover:text-slate-900 transition-colors">
          Event Ecosystem
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          to={`/admin/conference/${conferenceId}`}
          className="hover:text-slate-900 transition-colors"
        >
          Workspace Hub
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">Bulk WhatsApp</span>
      </div>

      {/* TOP HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200/70">
              Direct Push Channel
            </span>
            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {conferenceId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Bulk WhatsApp Messaging Center
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
            Dispatch urgent timetable changes, digital passes, and instant alerts directly to verified attendee smartphones.
          </p>
        </div>

        {/* Selected Count */}
        <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-200/80 px-5 py-3 rounded-2xl shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Selected Mobile Numbers
            </p>
            <p className="text-2xl font-black text-emerald-900 tracking-tight mt-0.5">
              {filteredParticipants.length} of {participants.length}
            </p>
          </div>
        </div>
      </div>

      {/* FEEDBACK STATUS */}
      {statusAlert && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold shadow-2xs ${
            statusAlert.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusAlert.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusAlert.text}</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COMPOSER (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              WhatsApp Broadcast Content
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Message Template Body *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi {{name}}, your conference pass for REGIVERSE is confirmed. Please show this message at Hall Entry..."
              rows={12}
              className="w-full p-4 text-xs font-medium bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-y shadow-2xs placeholder:text-slate-400"
              required
            />
          </div>

          <Button
            onClick={sendWhatsapp}
            disabled={loading || fetching || filteredParticipants.length === 0}
            isLoading={loading}
            variant="primary"
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            leftIcon={<Send className="w-4 h-4" />}
          >
            {loading
              ? "Transmitting WhatsApp Packets..."
              : `Send WhatsApp to ${filteredParticipants.length} Numbers`}
          </Button>

          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 text-xs text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 block">
              💡 Message Formatting Tip:
            </span>
            <p>
              Use *bold* for emphasis, _italic_ for notes, and ~strikethrough~ for corrections according to standard WhatsApp protocol.
            </p>
          </div>
        </div>

        {/* AUDIENCE & ROSTER SIDEBAR (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Categories Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Target Categories
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={selectAllCategories}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={selectNoneCategories}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {allCategoriesList.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                const count = participants.filter((p) => {
                  if (cat === "Workshop Attendees") {
                    return p.workshopScans && p.workshopScans.length > 0;
                  }
                  return getParticipantCategory(p) === cat;
                }).length;

                return (
                  <label
                    key={cat}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors select-none ${
                      isSelected
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                        : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                      <span>{cat}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Audience Preview List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col h-[320px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Audience Preview
              </h2>
              <span className="text-[11px] font-bold text-slate-500">
                {filteredParticipants.length} Queued
              </span>
            </div>

            {fetching ? (
              <div className="flex-1 flex items-center justify-center text-xs font-bold text-emerald-600 animate-pulse">
                Synchronizing audience...
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">
                No recipients match current category filter.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredParticipants.slice(0, 40).map((p) => (
                  <div
                    key={p._id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 truncate">
                        {p.name || "Unnamed"}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{p.phone || "No phone number"}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 shrink-0">
                      {getParticipantCategory(p)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkWhatsapp;