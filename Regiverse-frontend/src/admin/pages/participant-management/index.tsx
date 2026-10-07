import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Input } from "../../components/ui";

type Participant = {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  category: string;
  reference: string;
  medicalCouncilNumber: string;
  printed: boolean;
  blockKitbag: boolean;
  blockCertificate: boolean;
  blockDay1Breakfast: boolean;
  blockDay1Lunch: boolean;
  blockDay1Dinner: boolean;
  blockDay2Breakfast: boolean;
  blockDay2Lunch: boolean;
  blockDay2Dinner: boolean;
  blockDay3Breakfast: boolean;
  blockDay3Lunch: boolean;
  blockDay3Dinner: boolean;
  blockDay4Breakfast: boolean;
  blockDay4Lunch: boolean;
  blockDay4Dinner: boolean;
  blockDay5Breakfast: boolean;
  blockDay5Lunch: boolean;
  blockDay5Dinner: boolean;
  blockWorkshop1: boolean;
  blockWorkshop2: boolean;
  blockWorkshop3: boolean;
  blockWorkshop4: boolean;
  blockWorkshop5: boolean;
  conferenceId?: string;
};

const defaultCategories = [
  "Delegates",
  "PG Delegates",
  "Accompanying Person",
  "Chairman",
  "Vice President",
  "Faculty",
  "VIP Guest",
];

const ParticipantPage = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();
  const { state } = useLocation() as { state: { person?: Participant } };
  const editingPerson = state?.person;

  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [conferences, setConferences] = useState<any[]>([]);
  const [selectedConference, setSelectedConference] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const [form, setForm] = useState<Participant>({
    name: "",
    phone: "",
    email: "",
    state: "",
    category: "",
    reference: "",
    medicalCouncilNumber: "",
    printed: false,
    blockKitbag: false,
    blockCertificate: false,
    blockDay1Breakfast: false,
    blockDay1Lunch: false,
    blockDay1Dinner: false,
    blockDay2Breakfast: false,
    blockDay2Lunch: false,
    blockDay2Dinner: false,
    blockDay3Breakfast: false,
    blockDay3Lunch: false,
    blockDay3Dinner: false,
    blockDay4Breakfast: false,
    blockDay4Lunch: false,
    blockDay4Dinner: false,
    blockDay5Breakfast: false,
    blockDay5Lunch: false,
    blockDay5Dinner: false,
    blockWorkshop1: false,
    blockWorkshop2: false,
    blockWorkshop3: false,
    blockWorkshop4: false,
    blockWorkshop5: false,
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/conferences`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setConferences(list);
        if (!editingPerson && conferenceId) {
          const match = list.find(
            (c: any) =>
              c._id === conferenceId ||
              c.slug === conferenceId ||
              c.name === conferenceId
          );
          if (match) {
            setSelectedConference(match._id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [conferenceId, editingPerson]);

  useEffect(() => {
    if (editingPerson) {
      setForm(editingPerson);
      if (editingPerson.conferenceId) {
        setSelectedConference(editingPerson.conferenceId);
      }
    }
  }, [editingPerson]);

  const handleChange = (key: keyof Participant, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCategoryChange = (val: string) => {
    if (val === "ADD_NEW") {
      const newCat = prompt("Enter new category name:");
      if (newCat && !categories.includes(newCat)) {
        setCategories([...categories, newCat]);
        handleChange("category", newCat);
      }
    } else {
      handleChange("category", val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!form.name.trim() || !form.phone.trim() || !form.category.trim()) {
      setFeedback({
        type: "error",
        message: "Please fill in all required fields (Name, Mobile, and Category).",
      });
      return;
    }
    if (!selectedConference) {
      setFeedback({
        type: "error",
        message: "Please select an event for this participant.",
      });
      return;
    }

    try {
      setLoading(true);
      const url = editingPerson
        ? `${import.meta.env.VITE_API_URL}/api/participants/${form._id || form.id}`
        : `${import.meta.env.VITE_API_URL}/api/participants`;

      const payload = { ...form, conferenceId: selectedConference };
      const res = await fetch(url, {
        method: editingPerson ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch (e) {}

      if (!res.ok) throw new Error(result.message || "Error saving participant");

      setFeedback({
        type: "success",
        message: editingPerson
          ? "Participant updated successfully."
          : "Participant registered successfully.",
      });

      setTimeout(() => {
        navigate(`/admin/conference/${selectedConference}/registered-list`);
      }, 700);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
        <Link to="/admin/conferences" className="hover:text-[#0F172A]">
          Events
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        {conferenceId && (
          <>
            <Link
              to={`/admin/conference/${conferenceId}`}
              className="hover:text-[#0F172A]"
            >
              Manage Event
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </>
        )}
        <span className="font-semibold text-[#0F172A]">
          {editingPerson ? "Edit Participant" : "Add Participant"}
        </span>
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            {editingPerson ? "Edit Participant" : "Add Participant"}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Fill in attendee details and on-site access options.
          </p>
        </div>

        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Cancel
        </Button>
      </div>

      {/* FEEDBACK */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* SECTION 1: IDENTITY */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
            Attendee Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-medium text-[#0F172A]">
                Event *
              </label>
              <select
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                disabled={!!editingPerson}
                className="w-full h-9 px-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#0F172A] cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Select Event *</option>
                {conferences.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || c.title}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Full Name *"
              placeholder="e.g. Dr. John Doe"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />

            <Input
              label="Mobile Number *"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. delegate@domain.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#0F172A]">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-lg outline-none focus:border-[#0F172A] cursor-pointer"
                required
              >
                <option value="" disabled>
                  Select Category *
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="ADD_NEW" className="text-teal-700 font-medium">
                  + Add New Category
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: PROFESSIONAL & LOCATION */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
            Location & Professional Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="State / City"
              placeholder="e.g. Andhra Pradesh"
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />

            <Input
              label="Medical Council Number"
              placeholder="e.g. APMC-12345"
              value={form.medicalCouncilNumber}
              onChange={(e) => handleChange("medicalCouncilNumber", e.target.value)}
            />

            <Input
              label="Reference"
              placeholder="e.g. Institution / Sponsor"
              value={form.reference}
              onChange={(e) => handleChange("reference", e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 3: ON-SITE ACCESS CONTROLS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
            On-Site Restrictions (Check to Block)
          </h2>

          {/* Kitbag & Certificate */}
          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.blockKitbag}
                onChange={(e) => handleChange("blockKitbag", e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-0"
              />
              <span>Block Kitbag</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.blockCertificate}
                onChange={(e) => handleChange("blockCertificate", e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-0"
              />
              <span>Block Certificate</span>
            </label>
          </div>

          {/* Meals */}
          <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
            <p className="text-xs font-medium text-[#64748B]">
              Block Meals by Day:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((d) => (
                <div
                  key={d}
                  className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1 text-xs"
                >
                  <p className="font-semibold text-[#0F172A]">Day {d}</p>
                  {["Breakfast", "Lunch", "Dinner"].map((m) => (
                    <label
                      key={m}
                      className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={!!form[`blockDay${d}${m}` as keyof Participant]}
                        onChange={(e) =>
                          handleChange(`blockDay${d}${m}` as keyof Participant, e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded text-slate-900 focus:ring-0"
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Workshops */}
          <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
            <p className="text-xs font-medium text-[#64748B]">
              Block Workshops:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[1, 2, 3, 4, 5].map((w) => (
                <label
                  key={w}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-slate-700 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={!!form[`blockWorkshop${w}` as keyof Participant]}
                    onChange={(e) =>
                      handleChange(`blockWorkshop${w}` as keyof Participant, e.target.checked)
                    }
                    className="w-3.5 h-3.5 rounded text-slate-900 focus:ring-0"
                  />
                  <span>Workshop {w}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
          >
            {editingPerson ? "Save Changes" : "Save Participant"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ParticipantPage;