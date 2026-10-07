import { useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useClientEvent } from "../../contexts/ClientEventContext";
import { Upload, Calendar, FileSpreadsheet, CheckCircle2, AlertCircle, Download, X } from "lucide-react";

const UploadPage = () => {
  const navigate = useNavigate();
  const { eventId: routeEventId } = useParams();
  const { selectedEvent, selectedEventId, getAuthHeaders } = useClientEvent();

  const targetConferenceId = routeEventId || selectedEventId;
  const targetConferenceName = selectedEvent?.name || selectedEvent?.title || "Selected Event";

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) {
      setStatusMessage({ type: "error", text: "Please select an Excel or CSV file first." });
      return;
    }

    if (!targetConferenceId) {
      setStatusMessage({ type: "error", text: "No target event selected. Please select an event before uploading." });
      return;
    }

    try {
      setLoading(true);
      setStatusMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("conferenceId", targetConferenceId);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences/import-excel`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }

      if (res.ok && (data.success || data.inserted)) {
        setStatusMessage({
          type: "success",
          text: data.message || `Success! ${data.inserted || "All"} participants imported into ${targetConferenceName}.`,
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        setTimeout(() => {
          navigate(targetConferenceId ? `/client/events/${targetConferenceId}/registered-list` : "/client/registered-list");
        }, 1500);
      } else {
        setStatusMessage({
          type: "error",
          text: "Import failed: " + (data.message || data.error || "Server error importing file"),
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Server error during upload: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      "Name,Phone,Email,Category,State,Medical Council Number\n" +
      "Dr. Ramesh Sharma,9876543210,ramesh.sharma@example.com,Delegate,Maharashtra,MMC12345\n" +
      "Dr. Priya Patel,9876543211,priya.patel@example.com,Faculty,Gujarat,GMC67890\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${targetConferenceName.replace(/\s+/g, "_")}_sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
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
        <button
          onClick={downloadSampleCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-teal-600" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* STATUS BANNER */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* UPLOAD CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Upload Participant Spreadsheet</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Import participants in bulk directly into <strong>{targetConferenceName}</strong>. Supports .xlsx, .xls, and .csv files.
          </p>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">Select or drop spreadsheet file</p>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">Supported formats: .xlsx, .xls, .csv</p>

          <input
            ref={fileInputRef}
            type="file"
            id="client-file-input"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setStatusMessage(null);
            }}
            className="hidden"
          />

          <label htmlFor="client-file-input">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer shadow-2xs">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              Browse Spreadsheet File
            </span>
          </label>
        </div>

        {file && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">{file.name}</span>
            <span className="text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading || !file || !targetConferenceId}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 transition-colors text-white rounded-xl font-bold text-sm shadow-xs cursor-pointer"
        >
          {loading ? "Importing Roster..." : `Import into ${targetConferenceName}`}
        </button>
      </div>
    </div>
  );
};

export default UploadPage;