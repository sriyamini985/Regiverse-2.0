import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Sliders, Users, Eye } from "lucide-react";
import GenerationOptions from "./components/GenerationOptions";
import ProgressTracker from "./components/ProgressTracker";
import QRCodePreview from "./components/QRCodePreview";
import ParticipantSelector from "./components/ParticipantSelector";
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
    description: "Badge layout with participant name and QR code",
    layout: "badge",
    includePhoto: true,
    includeLogo: true,
  },
  {
    id: "template-3",
    name: "Entry Ticket",
    description: "Ticket format with verification code",
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
    document.title = "Badges & QR Codes - REGIVERSE";

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
      alert("Please select at least one participant.");
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
                    })
                  );
                  break;
                case "ticket":
                  qrData = encodeURIComponent(
                    JSON.stringify({
                      type: "ticket",
                      id: participantId,
                      name: participant?.name,
                      ticketId: `TKT-${participantId}`,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
        <Link to="/admin/dashboard" className="hover:text-[#0F172A]">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-[#0F172A]">Badges & QR Codes</span>
      </div>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Badges & QR Codes
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Generate printable QR codes and badges for participant check-in.
        </p>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CONFIGURATION (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
              Badge & Format Options
            </h2>

            <GenerationOptions
              selectedTemplateId={selectedTemplate}
              templates={mockTemplates}
              onGenerate={handleGenerate}
              isGenerating={progress.status === "generating"}
            />
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
              <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                Select Participants
              </h2>
              <span className="text-xs font-medium text-[#64748B]">
                {selectedParticipants.length} selected
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
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
              QR Preview
            </h2>

            <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-lg flex flex-col items-center justify-center">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    "preview-participant"
                  )}`}
                  alt="QR Code Preview"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <p className="mt-3 text-xs font-medium text-[#0F172A]">
                Sample Code Preview
              </p>
            </div>
          </div>

          {progress.status !== "idle" && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs">
              <ProgressTracker progress={progress} />
            </div>
          )}

          {generatedCodes.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs">
              <QRCodePreview
                codes={generatedCodes}
                onDownloadSingle={handleDownloadSingle}
                onDownloadAll={handleDownloadAll}
              />
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs">
            <BatchHistory batches={mockBatches} onDownload={handleDownloadBatch} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;