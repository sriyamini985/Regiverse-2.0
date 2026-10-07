import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Download,
  Calendar,
  ChevronRight,
  ArrowRight,
  X
} from "lucide-react";
import { Button } from "../../components/ui";

interface Conference {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
}

const UploadPage = () => {
  const navigate = useNavigate();
  const { conferenceId: routeConfId } = useParams();
  const [searchParams] = useSearchParams();

  const [conferences, setConferences] = useState<Conference[]>([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>("");
  const [loadingConferences, setLoadingConferences] = useState<boolean>(true);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
    inserted?: number;
    skipped?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch available conferences for event selection
  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setLoadingConferences(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.conferences || []);
          setConferences(list);

          // Determine initial selected conference
          const queryId = searchParams.get("eventId") || searchParams.get("conferenceId");
          const targetId = routeConfId || queryId || localStorage.getItem("regiverse_active_event_id");

          if (targetId && list.some((c: Conference) => c._id === targetId || c.slug === targetId)) {
            const found = list.find((c: Conference) => c._id === targetId || c.slug === targetId);
            setSelectedConferenceId(found?._id || targetId);
          } else if (list.length > 0) {
            setSelectedConferenceId(list[0]._id);
            localStorage.setItem("regiverse_active_event_id", list[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load events for import:", err);
      } finally {
        setLoadingConferences(false);
      }
    };

    fetchConferences();
  }, [routeConfId, searchParams]);

  // Handle conference selector change
  const handleConferenceChange = (id: string) => {
    setSelectedConferenceId(id);
    localStorage.setItem("regiverse_active_event_id", id);
    window.dispatchEvent(new Event("event-changed"));
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".xls") ||
        droppedFile.name.endsWith(".csv")
      ) {
        setFile(droppedFile);
        setStatusMessage(null);
      } else {
        setStatusMessage({
          type: "error",
          text: "Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV file.",
        });
      }
    }
  };

  // Upload handler
  const handleUpload = async () => {
    if (!file) {
      setStatusMessage({
        type: "error",
        text: "Please select an Excel or CSV file first.",
      });
      return;
    }

    if (!selectedConferenceId) {
      setStatusMessage({
        type: "error",
        text: "Please select a target event for this import.",
      });
      return;
    }

    try {
      setUploading(true);
      setStatusMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("conferenceId", selectedConferenceId);

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
          text: data.message || `Success! ${data.inserted || "All"} participants imported successfully.`,
          inserted: data.inserted,
          skipped: data.skipped,
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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
        text: "Server error during upload: " + err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  // Sample CSV generator
  const downloadSampleCSV = () => {
    const csvContent =
      "Name,Phone,Email,Category,State,Medical Council Number\n" +
      "Dr. Ramesh Sharma,9876543210,ramesh.sharma@example.com,Delegate,Maharashtra,MMC12345\n" +
      "Dr. Priya Patel,9876543211,priya.patel@example.com,Faculty,Gujarat,GMC67890\n" +
      "Dr. Suresh Kumar,9876543212,suresh.kumar@example.com,Student,Karnataka,KMC34567\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "regiverse_participants_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedEventObj = conferences.find((c) => c._id === selectedConferenceId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
        <Link to="/admin/dashboard" className="hover:text-[#0F172A]">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-[#0F172A]">Import Data</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Import Data
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Upload participant spreadsheets (.xlsx, .xls, .csv) into your selected event.
          </p>
        </div>

        <Button
          onClick={downloadSampleCSV}
          variant="secondary"
          size="sm"
          leftIcon={<Download className="w-3.5 h-3.5 text-[#0F766E]" />}
        >
          Download Sample Template
        </Button>
      </div>

      {/* TARGET EVENT SELECTOR CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0F766E]" />
          Target Event
        </label>
        
        {loadingConferences ? (
          <div className="h-10 bg-slate-100 animate-pulse rounded-lg w-full max-w-md" />
        ) : conferences.length === 0 ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            No events found. Please create an event before importing participants.
            <div className="mt-2">
              <Link to="/admin/conferences">
                <Button size="xs" variant="primary">Create Event</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={selectedConferenceId}
              onChange={(e) => handleConferenceChange(e.target.value)}
              className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] text-sm rounded-lg px-3 py-2 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] focus:border-transparent max-w-md w-full"
            >
              {conferences.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name || c.title || "Unnamed Event"} ({c.slug || c._id})
                </option>
              ))}
            </select>
            <span className="text-xs text-[#64748B]">
              Selected: <strong className="text-[#0F172A]">{selectedEventObj?.name || selectedEventObj?.title || "Event"}</strong>
            </span>
          </div>
        )}
      </div>

      {/* FEEDBACK BANNER */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-start justify-between gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold text-sm">
                {statusMessage.type === "success" ? "Import Completed Successfully" : "Import Failed"}
              </div>
              <p className="text-xs">{statusMessage.text}</p>
              {statusMessage.type === "success" && (
                <div className="pt-2 flex items-center gap-2">
                  <Link to="/admin/dashboard">
                    <Button size="xs" variant="primary" rightIcon={<ArrowRight className="w-3 h-3" />}>
                      View Dashboard
                    </Button>
                  </Link>
                  <Link to="/admin/conferences">
                    <Button size="xs" variant="secondary">
                      View Events
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FILE UPLOAD DROPZONE */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs space-y-5">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? "border-[#0F766E] bg-teal-50/50"
              : file
              ? "border-emerald-300 bg-emerald-50/20"
              : "border-[#CBD5E1] bg-[#F8FAFC] hover:bg-slate-100/50"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-[#0F766E] flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-[#0F172A]">
            Choose a spreadsheet file or drag & drop here
          </p>
          <p className="text-xs text-[#64748B] mt-1 mb-4">
            Supports Excel (.xlsx, .xls) and CSV (.csv) formats
          </p>

          <input
            ref={fileInputRef}
            type="file"
            id="file-upload-input"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setStatusMessage(null);
            }}
            className="hidden"
          />

          <label htmlFor="file-upload-input">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50 cursor-pointer shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F766E]" />
              Browse Spreadsheet File
            </span>
          </label>
        </div>

        {/* SELECTED FILE CARD */}
        {file && (
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-[#0F172A]">{file.name}</p>
                <p className="text-[11px] text-[#64748B]">
                  {(file.size / 1024).toFixed(1)} KB • Ready to import
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* UPLOAD ACTION */}
        <Button
          onClick={handleUpload}
          disabled={uploading || !file || !selectedConferenceId}
          isLoading={uploading}
          variant="primary"
          size="md"
          className="w-full"
        >
          {uploading ? "Importing Participants..." : "Upload & Import Participants"}
        </Button>
      </div>

      {/* SPREADSHEET COLUMN GUIDELINES */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3">
        <h3 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider">
          Expected Spreadsheet Columns
        </h3>
        <p className="text-xs text-[#64748B]">
          Regiverse automatically maps common column headers. Your spreadsheet may contain the following columns:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#0F172A]">Name</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200">Required</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Full name of the participant or delegate</p>
          </div>

          <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#0F172A]">Phone / Mobile</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200">Required</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Contact number used for unique identification</p>
          </div>

          <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#0F172A]">Category</span>
              <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">Optional</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">e.g. Delegate, Faculty, PG Student, Organizer</p>
          </div>

          <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#0F172A]">Email</span>
              <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">Optional</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Email address for communication</p>
          </div>

          <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#0F172A]">State</span>
              <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">Optional</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">State or province of the participant</p>
          </div>

          <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#0F172A]">Medical Council No.</span>
              <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">Optional</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Registration or license number (if applicable)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;