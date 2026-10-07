import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useClientEvent } from "../../contexts/ClientEventContext";
import { Calendar, UserCheck, AlertCircle } from "lucide-react";

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
  blockDay1Breakfast: boolean; blockDay1Lunch: boolean; blockDay1Dinner: boolean;
  blockDay2Breakfast: boolean; blockDay2Lunch: boolean; blockDay2Dinner: boolean;
  blockDay3Breakfast: boolean; blockDay3Lunch: boolean; blockDay3Dinner: boolean;
  blockDay4Breakfast: boolean; blockDay4Lunch: boolean; blockDay4Dinner: boolean;
  blockDay5Breakfast: boolean; blockDay5Lunch: boolean; blockDay5Dinner: boolean;
  blockWorkshop1: boolean; blockWorkshop2: boolean; blockWorkshop3: boolean;
  blockWorkshop4: boolean; blockWorkshop5: boolean;
};

const defaultCategories = ["Delegates", "PG Delegates", "Accompanying Person", "Chairman", "Vice President"];

const ParticipantPage = () => {
  const navigate = useNavigate();
  const { eventId: routeEventId } = useParams();
  const { selectedEvent, selectedEventId, getAuthHeaders } = useClientEvent();
  const { state } = useLocation() as { state: { person?: Participant } };
  const editingPerson = state?.person;

  const targetConferenceId = routeEventId || selectedEventId;
  const targetConferenceName = selectedEvent?.name || selectedEvent?.title || "Selected Event";

  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Participant>({
    name: "", phone: "", email: "", state: "", category: "", reference: "", medicalCouncilNumber: "", printed: false,
    blockKitbag: false, blockCertificate: false,
    blockDay1Breakfast: false, blockDay1Lunch: false, blockDay1Dinner: false,
    blockDay2Breakfast: false, blockDay2Lunch: false, blockDay2Dinner: false,
    blockDay3Breakfast: false, blockDay3Lunch: false, blockDay3Dinner: false,
    blockDay4Breakfast: false, blockDay4Lunch: false, blockDay4Dinner: false,
    blockDay5Breakfast: false, blockDay5Lunch: false, blockDay5Dinner: false,
    blockWorkshop1: false, blockWorkshop2: false, blockWorkshop3: false, blockWorkshop4: false, blockWorkshop5: false
  });

  useEffect(() => { if (editingPerson) setForm(editingPerson); }, [editingPerson]);

  const handleChange = (key: keyof Participant, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleCategoryChange = (val: string) => {
    if (val === "ADD_NEW") {
      const newCat = prompt("Enter new category:");
      if (newCat && !categories.includes(newCat)) {
        setCategories([...categories, newCat]);
        handleChange("category", newCat);
      }
    } else handleChange("category", val);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.category) {
      alert("Please fill in the mandatory fields: Name, Phone, and Category.");
      return;
    }

    if (!targetConferenceId) {
      alert("No target event selected. Please select an event before registering delegates.");
      return;
    }

    try {
      setSubmitting(true);
      const url = editingPerson
        ? `${import.meta.env.VITE_API_URL}/api/participants/${form._id || form.id}`
        : `${import.meta.env.VITE_API_URL}/api/participants`;

      const res = await fetch(url, {
        method: editingPerson ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...form,
          conferenceId: targetConferenceId,
          conferenceName: targetConferenceName,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Failed to save delegate (HTTP ${res.status})`);
      }

      alert(`Success! Delegate registered under ${targetConferenceName}.`);
      navigate(targetConferenceId ? `/client/events/${targetConferenceId}/registered-list` : "/client/registered-list");
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred while registering the delegate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* TARGET EVENT BANNER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Event</p>
            <h2 className="text-base font-bold text-slate-900">{targetConferenceName}</h2>
          </div>
        </div>
        <span className="text-xs text-slate-500">
          All registrations are strictly isolated to this conference.
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          {editingPerson ? "Edit Delegate Profile" : "Register New Delegate"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
            <input className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter Full Name" value={form.name} onChange={e => handleChange("name", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone / Mobile *</label>
            <input className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter Phone Number" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter Email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
            <input className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter State" value={form.state} onChange={e => handleChange("state", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
            <select className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
              <option value="" disabled>Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="ADD_NEW" className="text-teal-700 font-bold">+ Add New Category</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Medical Council Number</label>
            <input className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter Medical Council No." value={form.medicalCouncilNumber} onChange={e => handleChange("medicalCouncilNumber", e.target.value)} />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Reference / Referred By</label>
            <input className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Reference details" value={form.reference} onChange={e => handleChange("reference", e.target.value)} />
          </div>
        </div>

        {/* Blocking Access Layout */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Station Access Restrictions</h3>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <label className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={form.blockKitbag} onChange={e => handleChange("blockKitbag", e.target.checked)} /> Block Kitbag
            </label>
            <label className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={form.blockCertificate} onChange={e => handleChange("blockCertificate", e.target.checked)} /> Block Certificate
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(d => (
              <div key={d} className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 text-[11px] mb-2 uppercase">Day {d}</p>
                {["Breakfast", "Lunch", "Dinner"].map(m => (
                  <label key={m} className="flex items-center gap-2 text-xs py-1 cursor-pointer">
                    <input type="checkbox" checked={!!form[`blockDay${d}${m}` as keyof Participant]} onChange={e => handleChange(`blockDay${d}${m}` as keyof Participant, e.target.checked)} /> Block {m}
                  </label>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-slate-200">
            <p className="font-bold text-slate-800 text-xs mb-3 uppercase">Workshops</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {[1, 2, 3, 4, 5].map(w => (
                <label key={w} className="flex items-center justify-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 font-semibold text-xs cursor-pointer">
                  <input type="checkbox" checked={!!form[`blockWorkshop${w}` as keyof Participant]} onChange={e => handleChange(`blockWorkshop${w}` as keyof Participant, e.target.checked)} /> Block Workshop {w}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-6 py-3.5 bg-slate-900 hover:bg-slate-800 transition-colors text-white rounded-xl font-bold text-sm shadow-xs cursor-pointer"
        >
          {submitting ? "Saving Delegate..." : editingPerson ? "Update Delegate Profile" : `Register Delegate for ${targetConferenceName}`}
        </button>
      </div>
    </div>
  );
};

export default ParticipantPage;