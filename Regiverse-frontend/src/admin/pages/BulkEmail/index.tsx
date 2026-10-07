import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, CheckCircle2, AlertCircle, Image } from "lucide-react";
import { Button, Input } from "../../components/ui";

const BulkEmail = () => {
  const { conferenceId } = useParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
        text: `Emails sent: ${data.sent || 0} | Failed: ${data.failed || 0}`,
      });
    } catch (error) {
      setNotification({
        type: "error",
        text: "Failed to send emails. Please check your backend connection.",
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
        <span className="font-semibold text-[#0F172A]">Email Broadcast</span>
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Email Broadcast
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Send bulk email updates to participants in this event.
          </p>
        </div>

        <div className="text-xs text-[#64748B]">
          Selected recipients: <strong className="text-[#0F172A]">{filteredParticipants.length}</strong> of {participants.length}
        </div>
      </div>

      {/* FEEDBACK */}
      {notification && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COMPOSER (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
            Compose Message
          </h2>

          {/* Banner Upload */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0F172A]">
              Banner Image (Optional)
            </label>
            {bannerImage ? (
              <div className="relative rounded-lg border border-slate-200 overflow-hidden">
                <img
                  src={bannerImage}
                  alt="Banner preview"
                  className="w-full h-36 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setBannerImage(null)}
                  className="absolute top-2 right-2 px-2 py-1 bg-white text-rose-600 border border-slate-200 rounded text-[11px] font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-[#CBD5E1] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-[#F8FAFC] hover:bg-slate-100 transition-colors">
                <Image className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-700">
                  Attach header banner
                </span>
                <span className="text-[11px] text-slate-400">
                  PNG or JPG (Max 2MB)
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

          <Input
            label="Subject Line *"
            placeholder="e.g. Schedule Update & Badge Information"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0F172A]">
              Message Body *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your announcement here..."
              rows={9}
              className="w-full p-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#0F172A] transition-colors resize-y"
              required
            />
          </div>

          <Button
            onClick={sendBulkEmail}
            disabled={loading || fetching || filteredParticipants.length === 0}
            isLoading={loading}
            variant="primary"
            size="md"
            className="w-full"
          >
            {loading
              ? "Sending..."
              : `Send to ${filteredParticipants.length} Participants`}
          </Button>
        </div>

        {/* RECIPIENTS CHECKLIST (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
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

          <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
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
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer select-none ${
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
      </div>
    </div>
  );
};

export default BulkEmail;