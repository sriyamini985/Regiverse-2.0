import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Upload, ChevronRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui";

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
          text: `Success! ${data.inserted || "All"} participants imported successfully.`,
        });
        setTimeout(() => {
          navigate(`/admin/conference/${conferenceId}/registered-list`);
        }, 1000);
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
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
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
        <span className="font-semibold text-[#0F172A]">Import Participants</span>
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Import Participants
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Upload an Excel (.xlsx, .xls) or .csv file to import participants in bulk.
          </p>
        </div>

        <Button
          onClick={() => navigate(`/admin/conference/${conferenceId}`)}
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back
        </Button>
      </div>

      {/* FEEDBACK */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* UPLOAD CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs space-y-5">
        <div className="border border-dashed border-[#CBD5E1] rounded-xl p-8 text-center bg-[#F8FAFC]">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#0F172A]">
            Select your spreadsheet file
          </p>
          <p className="text-xs text-[#64748B] mt-1 mb-4">
            Supports .xlsx, .xls, and .csv files
          </p>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setStatusMessage(null);
            }}
            className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-[#CBD5E1] file:text-xs file:font-semibold file:bg-white file:text-[#0F172A] hover:file:bg-slate-50 cursor-pointer"
          />
        </div>

        {file && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
            <span className="font-medium text-[#0F172A]">{file.name}</span>
            <span className="text-[#64748B]">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={loading || !file}
          isLoading={loading}
          variant="primary"
          size="md"
          className="w-full"
        >
          {loading ? "Importing..." : "Upload and Import"}
        </Button>
      </div>

      {/* COLUMNS GUIDE */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs text-xs space-y-2">
        <h2 className="font-semibold text-[#0F172A]">
          Expected Spreadsheet Columns:
        </h2>
        <p className="text-[#64748B]">
          Make sure your file has headers like: <strong>Name</strong>, <strong>Phone</strong> (or Mobile), <strong>Category</strong>, <strong>Email</strong>, <strong>State</strong>, and <strong>Medical Council Number</strong>.
        </p>
      </div>
    </div>
  );
};

export default UploadPage;