import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  QrCode,
  Sliders,
  Users,
  Eye,
  Download,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import GenerationOptions from "./components/GenerationOptions";
import ProgressTracker from "./components/ProgressTracker";
import QRCodePreview from "./components/QRCodePreview";
import ParticipantSelector from "./components/ParticipantSelector";
import TemplateSelector from "./components/TemplateSelector";
import BatchHistory from "./components/BatchHistory";
import {
  Participant,
  QRCodeTemplate,
  GenerationOptions as GenerationOptionsType,
  GenerationProgress,
  GeneratedQRCode,
  BatchOperation,
} from "./types";
import { subscribeToParticipants } from "../../../services/participantService";
import { Button, Card, Badge } from "../../components/ui";

const mockTemplates: QRCodeTemplate[] = [
  {
    id: "template-1",
    name: "Standard QR Code",
    description: "Simple QR code with participant identifier",
    layout: "standard",
    includePhoto: false,
    includeLogo: true,
  },
  {
    id: "template-2",
    name: "Event Badge",
    description: "Conference badge layout with name, company, and QR code",
    layout: "badge",
    includePhoto: true,
    includeLogo: true,
  },
  {
    id: "template-3",
    name: "Entry Ticket",
    description: "Ticket-style layout with verification token and event header",
    layout: "ticket",
    includePhoto: false,
    includeLogo: true,
  },
];

const mockBatches: BatchOperation[] = [];

const QRCodeGenerator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("template-1");
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedQRCode[]>([]);
  const [progress, setProgress] = useState<GenerationProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    percentage: 0,
    status: "idle",
    estimatedTimeRemaining: 0,
  });

  useEffect(() => {
    document.title = "QR Code Generator - REGIVERSE";

    const unsubscribe = subscribeToParticipants((firebaseParticipants) => {
      const mappedParticipants: Participant[] = firebaseParticipants.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        company: p.company || "",
        status: p.status,
        registrationDate:
          p.registrationDate instanceof Date
            ? p.registrationDate.toISOString()
            : new Date().toISOString(),
        qrCode: p.qrCode,
      }));
      setParticipants(mappedParticipants);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGenerate = (options: GenerationOptionsType) => {
    if (selectedParticipants.length === 0) {
      alert("Please select at least one participant to generate QR codes.");
      return;
    }

    const template = mockTemplates.find((t) => t.id === selectedTemplate);
    const templateLayout = template?.layout || "standard";

    setIsLoading(true);
    setProgress({
      total: selectedParticipants.length,
      completed: 0,
      failed: 0,
      percentage: 0,
      status: "generating",
      estimatedTimeRemaining: selectedParticipants.length * 2,
    });

    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextCompleted = Math.min(prev.completed + 1, prev.total);
        const nextPercentage = Math.round((nextCompleted / prev.total) * 100);
        const nextEta = Math.max(0, (prev.total - nextCompleted) * 2);

        if (nextCompleted === prev.total) {
          clearInterval(interval);
          setIsLoading(false);

          const codes: GeneratedQRCode[] = selectedParticipants.map(
            (participantId) => {
              const participant = participants.find((p) => p.id === participantId);

              let qrData = "";
              switch (templateLayout) {
                case "badge":
                  qrData = encodeURIComponent(
                    JSON.stringify({
                      type: "badge",
                      id: participantId,
                      name: participant?.name,
                      email: participant?.email,
                      company: participant?.company,
                      includePhoto: template?.includePhoto,
                      includeLogo: template?.includeLogo,
                    })
                  );
                  break;
                case "ticket":
                  qrData = encodeURIComponent(
                    JSON.stringify({
                      type: "ticket",
                      id: participantId,
                      name: participant?.name,
                      company: participant?.company,
                      ticketId: `TKT-${participantId}`,
                      includeLogo: template?.includeLogo,
                    })
                  );
                  break;
                case "standard":
                default:
                  qrData = participantId;
                  break;
              }

              return {
                participantId,
                participantName: participant?.name || "Unknown",
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=${options.size}x${options.size}&data=${qrData}`,
                timestamp: new Date().toISOString(),
                format: options.format,
                templateLayout,
              };
            }
          );

          setGeneratedCodes(codes);

          return {
            ...prev,
            completed: nextCompleted,
            percentage: nextPercentage,
            status: "completed",
            estimatedTimeRemaining: 0,
          };
        }

        return {
          ...prev,
          completed: nextCompleted,
          percentage: nextPercentage,
          estimatedTimeRemaining: nextEta,
        };
      });
    }, 400);
  };

  const handleDownloadSingle = (code: GeneratedQRCode) => {
    const link = document.createElement("a");
    link.href = code.qrCodeUrl;
    link.download = `qr-code-${code.participantId}.png`;
    link.click();
  };

  const handleDownloadAll = () => {
    if (generatedCodes.length === 0) return;

    const csvContent = [
      ["Participant ID", "Participant Name", "QR Code URL", "Format", "Generated At"],
      ...generatedCodes.map((code) => [
        code.participantId,
        code.participantName,
        code.qrCodeUrl,
        code.format,
        new Date(code.timestamp).toISOString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-codes-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadBatch = (batchId: string) => {
    const batch = mockBatches.find((b) => b.id === batchId);
    if (!batch?.downloadUrl) return;

    const link = document.createElement("a");
    link.href = batch.downloadUrl;
    link.download = `qr-batch-${batchId}.zip`;
    link.click();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/admin/dashboard" className="hover:text-slate-900 transition-colors">
          Admin Console
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">QR Code Generator</span>
      </div>

      {/* TOP HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/70">
              Badge & Credential Engine
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Encoder Online</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            QR Code Generator & Verification Encoder
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
            Generate high-resolution 2D barcodes for event badges, meal counter access, and turnstile checkpoints.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <span>Active Roster:</span>
          <Badge variant="primary" size="md">
            {participants.length} Loaded
          </Badge>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: CONFIGURATION & PARTICIPANTS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Layout & Output Configuration
              </h2>
            </div>

            <GenerationOptions
              selectedTemplateId={selectedTemplate}
              templates={mockTemplates}
              onGenerate={handleGenerate}
              isGenerating={progress.status === "generating"}
            />
          </div>

          {/* Card: Participant Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Target Attendees
                </h2>
              </div>
              <span className="text-xs font-bold text-blue-600">
                {selectedParticipants.length} Selected
              </span>
            </div>

            <ParticipantSelector
              participants={participants}
              selectedParticipants={selectedParticipants}
              onSelectionChange={setSelectedParticipants}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW & OUTPUT (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Live Barcode Preview
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                200x200 px
              </span>
            </div>

            <div className="p-8 bg-slate-50/70 border border-slate-200/70 rounded-2xl flex flex-col items-center justify-center min-h-[260px]">
              <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    selectedTemplate === "badge"
                      ? JSON.stringify({
                          type: "badge",
                          id: "preview-123",
                          name: "Dr. Sample Attendee",
                          company: "Medical Council",
                        })
                      : selectedTemplate === "ticket"
                      ? JSON.stringify({
                          type: "ticket",
                          id: "preview-123",
                          name: "Dr. Sample Attendee",
                          ticketId: "TKT-PREVIEW",
                        })
                      : "preview-123"
                  )}`}
                  alt="QR Code Preview"
                  className="w-44 h-44 object-contain"
                />
              </div>
              <p className="mt-4 text-xs font-bold text-slate-700">
                {mockTemplates.find((t) => t.id === selectedTemplate)?.name} Preview
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Scan with any standard QR scanner
              </p>
            </div>
          </div>

          {/* Progress Tracker */}
          {progress.status !== "idle" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <ProgressTracker progress={progress} />
            </div>
          )}

          {/* Generated Codes Output Preview */}
          {generatedCodes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <QRCodePreview
                codes={generatedCodes}
                onDownloadSingle={handleDownloadSingle}
                onDownloadAll={handleDownloadAll}
              />
            </div>
          )}

          {/* Batch History */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <BatchHistory batches={mockBatches} onDownload={handleDownloadBatch} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;