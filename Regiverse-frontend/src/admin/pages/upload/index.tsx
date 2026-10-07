import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Info,
  ArrowLeft,
  X,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Button, Card, Badge } from "../../components/ui";

const UploadPage = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setStatusMessage({
        type: "error",
        text: "Please select an Excel or CSV file first.",
      });
      return;
    }

    try {
      setLoading(true);
      setStatusMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("conferenceId", conferenceId || "");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conferences/import-excel`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText = await res.text();
      let data: any = {};

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText || `HTTP Status Code: ${res.status}` };
      }

      if (res.ok && (data.success || data.inserted)) {
        setStatusMessage({
          type: "success",
          text: `Success! ${data.inserted || "All"} delegate records imported into workspace roster.`,
        });
        setTimeout(() => {
          navigate(`/admin/conference/${conferenceId}/registered-list`);
        }, 1200);
      } else {
        setStatusMessage({
          type: "error",
          text:
            "Import failed: " +
            (data.message || data.error || "Unknown server error processing spreadsheet"),
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "Server Connection Error during upload: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
        <span className="text-slate-900 font-bold">Import Database</span>
      </div>

      {/* TOP HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/70">
              Batch Ingestion
            </span>
            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {conferenceId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Import Attendee Database
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl">
            Upload delegate spreadsheets to populate attendee rosters, generate unique identifiers, and configure station entitlements.
          </p>
        </div>

        <Button
          onClick={() => navigate(`/admin/conference/${conferenceId}`)}
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Hub
        </Button>
      </div>

      {/* FEEDBACK STATUS */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold shadow-2xs ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* MAIN UPLOAD CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Zone (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Upload Spreadsheet File
            </h2>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-500/60 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all duration-200 cursor-pointer relative group">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setStatusMessage(null);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click or drag & drop spreadsheet here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts .XLSX, .XLS, or .CSV formatted rosters (Max 25MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Selected File Card */}
            {file && (
              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {(file.size / 1024).toFixed(1)} KB • Ready for batch import
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-blue-100/50 transition-colors"
                  title="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleUpload}
            disabled={loading || !file}
            isLoading={loading}
            variant="primary"
            size="lg"
            className="w-full"
            leftIcon={<UploadCloud className="w-5 h-5" />}
          >
            {loading ? "Parsing & Ingesting Records..." : "Process Batch Ingestion"}
          </Button>
        </div>

        {/* Requirements & Formatting Guide (1 col) */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-xs border-b border-slate-200/70 pb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Schema Guidelines</span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Ensure your spreadsheet includes a header row matching the following column names:
          </p>

          <div className="space-y-2">
            {[
              { col: "Name", req: "Required", desc: "Attendee Full Name" },
              { col: "Phone / Mobile", req: "Required", desc: "Contact number for WhatsApp" },
              { col: "Category", req: "Required", desc: "Delegate, Faculty, etc." },
              { col: "Email", req: "Optional", desc: "For QR badge delivery" },
              { col: "State / City", req: "Optional", desc: "Geographic origin" },
              { col: "Medical Council", req: "Optional", desc: "State registration number" },
            ].map((f) => (
              <div
                key={f.col}
                className="bg-white p-2.5 rounded-xl border border-slate-200/70"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{f.col}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      f.req === "Required"
                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {f.req}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Automatic deduplication enabled by system.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;