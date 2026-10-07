import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit2, CheckCircle2, Clock, Mail, Phone } from "lucide-react";

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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-16 text-center">Action</th>
              <th className="py-3.5 px-4 font-bold">Attendee Name</th>
              <th className="py-3.5 px-4 font-bold">Live Station Progress</th>
              <th className="py-3.5 px-4 font-bold">Contact Info</th>
              <th className="py-3.5 px-4 font-bold">Reg ID</th>
              <th className="py-3.5 px-4 font-bold">Category</th>
              <th className="py-3.5 px-4 font-bold">State / Location</th>
              <th className="py-3.5 px-4 font-bold">Medical Council #</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((p) => {
              const foodScanCount = p.foodLogs
                ? Object.values(p.foodLogs).filter(Boolean).length
                : 0;
              const workshopScanCount = p.workshopScans ? p.workshopScans.length : 0;

              return (
                <tr
                  key={p._id}
                  className="hover:bg-blue-50/30 transition-colors duration-150 group"
                >
                  {/* EDIT ACTION */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleEdit(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs"
                      title="Edit Attendee Profile"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </td>

                  {/* NAME */}
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {p.name || "Unnamed Delegate"}
                    </div>
                    {p.reference && (
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                        Ref: {p.reference}
                      </div>
                    )}
                  </td>

                  {/* OPERATIONAL PROGRESS INDICATORS */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Check-In Entry */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                          p.isCheckedIn
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                        title={p.isCheckedIn ? "Checked in at Hall" : "Not yet checked in"}
                      >
                        Entry
                      </span>

                      {/* Badge Printed */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                          p.printed
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                        title={p.printed ? "Badge printed" : "Badge not printed"}
                      >
                        Badge
                      </span>

                      {/* Kitbag Delivered */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                          p.kitbagCollected
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                        title={p.kitbagCollected ? "Kitbag collected" : "Kitbag pending"}
                      >
                        Kitbag
                      </span>

                      {/* Food Scans */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                          foodScanCount > 0
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                        title={`${foodScanCount} meal services recorded`}
                      >
                        Food {foodScanCount > 0 ? `(${foodScanCount})` : ""}
                      </span>

                      {/* Workshop Scans */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                          workshopScanCount > 0
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                        title={`${workshopScanCount} workshops attended`}
                      >
                        Workshop {workshopScanCount > 0 ? `(${workshopScanCount})` : ""}
                      </span>

                      {/* Certificate Issued */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                          p.certificateGiven
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                        title={p.certificateGiven ? "Certificate issued" : "Certificate pending"}
                      >
                        Cert
                      </span>
                    </div>
                  </td>

                  {/* CONTACT INFO */}
                  <td className="py-3 px-4 text-slate-600">
                    <div className="space-y-0.5">
                      {p.email && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{p.email}</span>
                        </div>
                      )}
                      {p.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{p.phone}</span>
                        </div>
                      )}
                      {!p.email && !p.phone && <span className="text-slate-400">—</span>}
                    </div>
                  </td>

                  {/* REG ID */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-all">
                      {p.regId || p._id.slice(-6).toUpperCase()}
                    </span>
                  </td>

                  {/* CATEGORY */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {p.category || "General"}
                    </span>
                  </td>

                  {/* STATE / LOCATION */}
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {p.state || "—"}
                  </td>

                  {/* MEDICAL COUNCIL NUMBER */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
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