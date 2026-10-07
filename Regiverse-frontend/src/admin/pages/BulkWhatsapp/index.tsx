import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { Button } from "../../components/ui";

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
        alert("Please enter a WhatsApp message.");
        return;
      }
      if (filteredParticipants.length === 0) {
        alert("No recipients selected based on the target filters.");
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
        throw new Error(data.message || "Failed to send WhatsApp broadcast");
      }

      setStatusAlert({
        type: "success",
        text: `WhatsApp broadcast sent. Sent: ${data.sent} | Failed: ${data.failed}`,
      });
    } catch (err: any) {
      console.log(err);
      setStatusAlert({
        type: "error",
        text: err.message || "Failed to transmit broadcast",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
        <Link to="/admin/conferences" className="hover:text-[#0F172A]">
          Events
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          to={`/admin/conference/${conferenceId}`}
          className="hover:text-[#0F172A]"
        >
          Manage Event
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-[#0F172A]">WhatsApp Broadcast</span>
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            WhatsApp Broadcast
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Send WhatsApp notifications to participants.
          </p>
        </div>

        <div className="text-xs text-[#64748B]">
          Selected recipients: <strong className="text-[#0F172A]">{filteredParticipants.length}</strong> of {participants.length}
        </div>
      </div>

      {/* FEEDBACK */}
      {statusAlert && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            statusAlert.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusAlert.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusAlert.text}</span>
        </div>
      )}

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COMPOSER (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
            Compose Message
          </h2>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0F172A]">
              Message Text *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, your registration for REGIVERSE is confirmed..."
              rows={11}
              className="w-full p-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#0F172A] transition-colors resize-y"
              required
            />
          </div>

          <Button
            onClick={sendWhatsapp}
            disabled={loading || fetching || filteredParticipants.length === 0}
            isLoading={loading}
            variant="teal"
            size="md"
            className="w-full"
          >
            {loading
              ? "Sending..."
              : `Send WhatsApp to ${filteredParticipants.length} Participants`}
          </Button>
        </div>

        {/* RECIPIENTS & PREVIEW (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
              <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                Recipient Categories
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={selectAllCategories}
                  className="text-slate-600 hover:text-[#0F172A] font-medium"
                >
                  All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={selectNoneCategories}
                  className="text-slate-400 hover:text-slate-600 font-medium"
                >
                  None
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
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
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer select-none ${
                      isSelected
                        ? "bg-slate-50 border-slate-300 font-medium text-[#0F172A]"
                        : "bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(cat)}
                        className="w-3.5 h-3.5 rounded text-slate-900 focus:ring-0"
                      />
                      <span>{cat}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* PREVIEW OF NUMBERS */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs space-y-2">
            <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
              Sample Recipients ({filteredParticipants.length})
            </h2>

            <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
              {filteredParticipants.slice(0, 25).map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-1.5 text-xs text-slate-600 border-b border-slate-100 last:border-0"
                >
                  <span className="truncate max-w-[150px] font-medium text-[#0F172A]">
                    {p.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {p.phone || "No phone"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkWhatsapp;