import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Mail,
  Send,
  Image,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { Button, Input, Card, Badge } from "../../components/ui";

const BulkEmail = () => {
  const { conferenceId } = useParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Banner & category filtering
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setParticipants(list);
      })
      .catch((err) => console.error(err))
      .finally(() => setFetching(false));
  }, [conferenceId]);

  const getParticipantCategory = (p: any) => {
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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid image format. Please select a PNG, JPG, or JPEG file.");
      e.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image is too large. Please select an image smaller than 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const filteredParticipants = participants.filter((p: any) => {
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

  const sendBulkEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("Please enter both an email subject and message body.");
      return;
    }
    if (filteredParticipants.length === 0) {
      alert("No recipients selected based on the target filters.");
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      const participantIds = filteredParticipants.map((p) => p._id);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bulk-email/${conferenceId}/send-emails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            message,
            bannerImage,
            participantIds,
          }),
        }
      );
      const data = await response.json();
      setNotification({
        type: "success",
        text: `Transmission complete! Emails Sent: ${data.sent || 0} | Failed: ${data.failed || 0}`,
      });
    } catch (error) {
      setNotification({
        type: "error",
        text: "Failed to dispatch email broadcast. Check backend SMTP settings.",
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
        <span className="text-slate-900 font-bold">Bulk Email Engine</span>
      </div>

      {/* TOP COMMAND BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider border border-purple-200/70">
              Communication Platform
            </span>
            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {conferenceId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Bulk Email Broadcast Engine
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
            Deliver scheduled announcements, digital badges, and workshop alerts directly to delegate inboxes.
          </p>
        </div>

        {/* Audience Count Indicator */}
        <div className="flex items-center gap-3 bg-purple-50/70 border border-purple-200/80 px-5 py-3 rounded-2xl shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
              Selected Recipients
            </p>
            <p className="text-2xl font-black text-purple-900 tracking-tight mt-0.5">
              {filteredParticipants.length} of {participants.length}
            </p>
          </div>
        </div>
      </div>

      {/* NOTIFICATION FEEDBACK */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold shadow-2xs ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COMPOSER (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mail className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Email Content & Design
            </h2>
          </div>

          {/* Banner Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Campaign Header Banner (Optional)
            </label>
            {bannerImage ? (
              <div className="relative rounded-2xl border border-slate-200 overflow-hidden group">
                <img
                  src={bannerImage}
                  alt="Banner preview"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setBannerImage(null)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Remove Banner
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-purple-50/20 transition-all">
                <Image className="w-7 h-7 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">
                  Click to attach campaign banner
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG or JPEG (Max 2MB)
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleBannerChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Subject Line */}
          <Input
            label="Subject Line *"
            placeholder="e.g. Important Update: Conference Schedule & QR Badge"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          {/* Message Body */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Message Body *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dear Delegate,&#10;&#10;We are delighted to welcome you to the conference..."
              rows={10}
              className="w-full p-4 text-xs font-medium bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all resize-y shadow-2xs placeholder:text-slate-400"
              required
            />
          </div>

          {/* Send CTA */}
          <Button
            onClick={sendBulkEmail}
            disabled={loading || fetching || filteredParticipants.length === 0}
            isLoading={loading}
            variant="primary"
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
            leftIcon={<Send className="w-4 h-4" />}
          >
            {loading
              ? "Transmitting Broadcast..."
              : `Send Broadcast to ${filteredParticipants.length} Delegates`}
          </Button>
        </div>

        {/* AUDIENCE TARGETING SIDEBAR (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Target Audience Filters
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={selectAllCategories}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Select All
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

            <p className="text-xs text-slate-500">
              Select delegate categories to include in this broadcast transmission:
            </p>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {allCategoriesList.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                const count = participants.filter((p: any) => {
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
                        ? "bg-purple-50/60 border-purple-200 text-purple-900"
                        : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
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

          {/* Quick Delivery Advice */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Broadcast Delivery Notice</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Outgoing messages are routed through our transactional SMTP cluster. Delegates with invalid or missing email addresses are safely bypassed during dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEmail;