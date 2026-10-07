import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit2, Mail, Phone } from "lucide-react";

interface Participant {
  _id: string;
  regId?: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  state?: string;
  reference?: string;
  medicalCouncilNumber?: string;
  isCheckedIn?: boolean;
  printed?: boolean;
  kitbagCollected?: boolean;
  certificateGiven?: boolean;
  foodLogs?: Record<string, boolean>;
  workshopScans?: string[];
}

type Props = {
  data: Participant[];
};

const DelegateTable: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();

  const handleEdit = (participant: Participant) => {
    navigate(`/admin/conference/${conferenceId}/add-delegate`, {
      state: { person: participant },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              <th className="py-3 px-3 w-16 text-center">Action</th>
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">On-Site Status</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3">Reg ID</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">State</th>
              <th className="py-3 px-3">Council #</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {data.map((p) => {
              const foodScanCount = p.foodLogs
                ? Object.values(p.foodLogs).filter(Boolean).length
                : 0;
              const workshopScanCount = p.workshopScans ? p.workshopScans.length : 0;

              return (
                <tr
                  key={p._id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* EDIT ACTION */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleEdit(p)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#CBD5E1] rounded text-[11px] font-medium transition-colors"
                      title="Edit attendee"
                    >
                      Edit
                    </button>
                  </td>

                  {/* NAME */}
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-[#0F172A]">
                      {p.name || "—"}
                    </span>
                    {p.reference && (
                      <span className="block text-[10px] text-[#64748B]">
                        {p.reference}
                      </span>
                    )}
                  </td>

                  {/* STATUS BADGES */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          p.isCheckedIn
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                      >
                        Entry
                      </span>

                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          p.printed
                            ? "bg-teal-50 text-teal-800 border-teal-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                      >
                        Badge
                      </span>

                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          p.kitbagCollected
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                      >
                        Kitbag
                      </span>

                      {foodScanCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Food ({foodScanCount})
                        </span>
                      )}

                      {workshopScanCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-800 border border-purple-200">
                          Workshop ({workshopScanCount})
                        </span>
                      )}

                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          p.certificateGiven
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                      >
                        Cert
                      </span>
                    </div>
                  </td>

                  {/* CONTACT */}
                  <td className="py-2.5 px-3 text-[#64748B]">
                    <div className="space-y-0.5">
                      {p.email && <div className="truncate max-w-[140px]">{p.email}</div>}
                      {p.phone && <div className="font-mono text-[11px]">{p.phone}</div>}
                      {!p.email && !p.phone && <span>—</span>}
                    </div>
                  </td>

                  {/* REG ID */}
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[11px] font-semibold text-[#0F172A]">
                      {p.regId || p._id.slice(-6).toUpperCase()}
                    </span>
                  </td>

                  {/* CATEGORY */}
                  <td className="py-2.5 px-3 text-[#0F172A]">
                    {p.category || "General"}
                  </td>

                  {/* STATE */}
                  <td className="py-2.5 px-3 text-[#64748B]">
                    {p.state || "—"}
                  </td>

                  {/* MEDICAL COUNCIL */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B]">
                    {p.medicalCouncilNumber || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DelegateTable;