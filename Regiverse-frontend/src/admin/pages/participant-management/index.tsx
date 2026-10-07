import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import {
  UserPlus,
  Edit2,
  ChevronRight,
  Shield,
  Utensils,
  Layers,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button, Input, Select, Card } from "../../components/ui";

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
        message: "Mandatory fields missing: Name, Mobile, and Category are required.",
      });
      return;
    }
    if (!selectedConference) {
      setFeedback({
        type: "error",
        message: "Please assign this attendee to a Conference Workspace.",
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

      if (!res.ok) throw new Error(result.message || "Error saving delegate record");

      setFeedback({
        type: "success",
        message: editingPerson
          ? "Delegate profile updated successfully!"
          : "New delegate registered successfully!",
      });

      setTimeout(() => {
        navigate(`/admin/conference/${selectedConference}/registered-list`);
      }, 700);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save data" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ============================================================== */}
      {/* BREADCRUMB & HEADER */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/admin/conferences" className="hover:text-slate-900 transition-colors">
          Event Ecosystem
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        {conferenceId && (
          <>
            <Link
              to={`/admin/conference/${conferenceId}`}
              className="hover:text-slate-900 transition-colors"
            >
              Workspace Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </>
        )}
        <span className="text-slate-900 font-bold">
          {editingPerson ? "Edit Delegate Profile" : "Register New Delegate"}
        </span>
      </div>

      {/* TOP HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600">
            {editingPerson ? <Edit2 className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {editingPerson ? "Edit Delegate Profile" : "Delegate Registration Terminal"}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Configure attendee personal details, credential numbers, and access rights.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back
        </Button>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold shadow-2xs ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* FORM BODY */}
      {/* ============================================================== */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: WORKSPACE & IDENTITY */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-xs font-extrabold flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Identity & Workspace Assignment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conference Selector */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Conference Workspace *
              </label>
              <select
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                disabled={!!editingPerson}
                className="w-full h-11 px-4 text-sm font-semibold bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
              >
                <option value="">Select Conference Workspace *</option>
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
              placeholder="e.g. +91 9876543210"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. delegate@institution.org"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Delegate Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full h-11 px-4 text-sm font-semibold bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
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
                <option value="ADD_NEW" className="text-blue-600 font-bold">
                  + Add New Category
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: PROFESSIONAL & LOCATION METADATA */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-xs font-extrabold flex items-center justify-center">
              2
            </span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Location & Professional Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="State / City"
              placeholder="e.g. Maharashtra / Mumbai"
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />

            <Input
              label="Medical Council Number"
              placeholder="e.g. MCI-2024-8849"
              value={form.medicalCouncilNumber}
              onChange={(e) => handleChange("medicalCouncilNumber", e.target.value)}
            />

            <Input
              label="Reference / Sponsor"
              placeholder="e.g. Hospital or Committee"
              value={form.reference}
              onChange={(e) => handleChange("reference", e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 3: ACCESS CONTROL & BLOCKING ENTITLEMENTS */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-rose-200/70 pb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider">
                Access Control & Station Restrictions
              </h2>
              <p className="text-xs text-rose-700 mt-0.5">
                Check boxes below to block specific services or meal entries for this delegate.
              </p>
            </div>
          </div>

          {/* Kitbag & Certificate Restrictions */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-rose-200 text-xs font-bold text-slate-800 cursor-pointer shadow-2xs hover:bg-slate-50 select-none">
              <input
                type="checkbox"
                checked={form.blockKitbag}
                onChange={(e) => handleChange("blockKitbag", e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
              <span>Block Kitbag Collection</span>
            </label>

            <label className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-rose-200 text-xs font-bold text-slate-800 cursor-pointer shadow-2xs hover:bg-slate-50 select-none">
              <input
                type="checkbox"
                checked={form.blockCertificate}
                onChange={(e) => handleChange("blockCertificate", e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
              <span>Block Certificate Issuance</span>
            </label>
          </div>

          {/* Meal Entitlement Schedule Matrix */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-3.5 h-3.5 text-rose-700" />
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Meal Restrictions (Check to Block)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((d) => (
                <div
                  key={d}
                  className="bg-white p-3.5 rounded-xl border border-rose-200/90 shadow-2xs space-y-2"
                >
                  <p className="text-[11px] font-black text-rose-900 uppercase tracking-wider pb-1 border-b border-rose-100">
                    Day {d}
                  </p>
                  {["Breakfast", "Lunch", "Dinner"].map((m) => (
                    <label
                      key={m}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={!!form[`blockDay${d}${m}` as keyof Participant]}
                        onChange={(e) =>
                          handleChange(`blockDay${d}${m}` as keyof Participant, e.target.checked)
                        }
                        className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Workshop Restrictions */}
          <div className="space-y-3 pt-3 border-t border-rose-200/70">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-rose-700" />
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Workshop Restrictions (Check to Block)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((w) => (
                <label
                  key={w}
                  className="flex items-center justify-center gap-2 bg-white p-3 rounded-xl border border-rose-200/90 font-bold text-xs text-slate-800 cursor-pointer shadow-2xs hover:bg-slate-50 select-none"
                >
                  <input
                    type="checkbox"
                    checked={!!form[`blockWorkshop${w}` as keyof Participant]}
                    onChange={(e) =>
                      handleChange(`blockWorkshop${w}` as keyof Participant, e.target.checked)
                    }
                    className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
                  />
                  <span>Workshop {w}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<CheckCircle className="w-4 h-4" />}
          >
            {editingPerson ? "Save Changes" : "Register Attendee"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ParticipantPage;