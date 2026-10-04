"use client";

import React, { useState } from "react";
import {
  validateImportFile,
  createStagedImport,
  ALLOWED_EXTENSIONS,
  StagedImport,
} from "@/lib/imports";

export default function ImportsPage() {
  const [stagedFiles, setStagedFiles] = useState<StagedImport[]>([
    {
      stagedId: "stage-dba-01",
      fileName: "DBA_Doctoral_Research_Methodology_Synthesized.pdf",
      fileSizeBytes: 2457600,
      category: "Doctoral DBA Research",
      stagedAt: "2026-10-04T10:15:00Z",
      confirmedByFounder: true,
      notes: "Synthesis of quantitative methodology with improved literature matrix for assignment grade upgrade.",
    },
    {
      stagedId: "stage-mustang-02",
      fileName: "2015_Mustang_V6_3.7L_Engine_Oil_Torque_Specs.pdf",
      fileSizeBytes: 1248000,
      category: "Mechanical Manuals",
      stagedAt: "2026-10-04T10:20:00Z",
      confirmedByFounder: true,
      notes: "Ford Motorcraft OEM factory torque specifications (19 lb-ft for 15mm drain plug; 6.0 qt capacity).",
    },
    {
      stagedId: "stage-consult-03",
      fileName: "Stoic_Consulting_Enterprise_AI_Proposal_Template.docx",
      fileSizeBytes: 819200,
      category: "Stoic Business Consulting",
      stagedAt: "2026-10-04T11:00:00Z",
      confirmedByFounder: false,
      notes: "High-margin automation retainer proposal framework for local commercial business outreach.",
    },
  ]);

  const [category, setCategory] = useState("Doctoral DBA Research");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSimulatedUpload = (mockName: string, mockSize: number, mockMime: string) => {
    setValidationError(null);
    const validation = validateImportFile({ name: mockName, size: mockSize, mimeType: mockMime });
    if (!validation.valid) {
      setValidationError(validation.error || "File validation failed.");
      return;
    }

    const newStaged = createStagedImport(
      { name: mockName, size: mockSize, mimeType: mockMime },
      category,
      "Uploaded via secure local-first staging vault"
    );
    setStagedFiles([newStaged, ...stagedFiles]);
  };

  const confirmStaged = (id: string) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.stagedId === id ? { ...item, confirmedByFounder: true } : item))
    );
  };

  const removeStaged = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.stagedId !== id));
  };

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <span>Document & Reference Media Staging Vault</span>
            <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-600/40 font-mono">
              Zero Unconsented Parsing &bull; Local-First
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Stage doctoral research, mechanical service guides, and business proposals with strict confirmation gating.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="text-amber-400 font-bold">Supported: </span>
          <span className="text-white font-semibold">{ALLOWED_EXTENSIONS.slice(0, 5).join(" ")}</span>
        </div>
      </section>

      {/* STAGING DROPZONE / UPLOADER */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-6 shadow-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Stage New Reference Document or Media
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Select Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#121218] border border-red-900/60 rounded-lg p-2.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="Doctoral DBA Research" className="bg-black text-white">Doctoral DBA Research & Resubmission</option>
              <option value="Stoic Business Consulting" className="bg-black text-white">Stoic Business Consulting & Retainers</option>
              <option value="Mechanical Manuals" className="bg-black text-white">Mechanical Manuals (Mustang / Tools)</option>
              <option value="Fatherhood Athleticism" className="bg-black text-white">Fatherhood Athleticism & Milestones</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex flex-col justify-end">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleSimulatedUpload(
                    "DBA_Assignment_2_Revised_Methodology.pdf",
                    3145728,
                    "application/pdf"
                  )
                }
                className="flex-1 px-3 py-2 rounded-lg bg-[#121218] border border-red-900/60 hover:border-amber-500/60 text-xs font-bold text-white hover:text-amber-400 transition"
              >
                + Stage DBA Research PDF (3.0 MB)
              </button>
              <button
                onClick={() =>
                  handleSimulatedUpload(
                    "Fiverr_Enterprise_AI_Case_Study.docx",
                    1048576,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  )
                }
                className="flex-1 px-3 py-2 rounded-lg bg-[#121218] border border-red-900/60 hover:border-amber-500/60 text-xs font-bold text-white hover:text-amber-400 transition"
              >
                + Stage Consulting DOCX (1.0 MB)
              </button>
            </div>
          </div>
        </div>

        {validationError && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-700/60 text-red-300 font-semibold text-xs">
            {validationError}
          </div>
        )}
      </section>

      {/* STAGED DOCUMENTS VAULT TABLE */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Vault Index & Two-Step Confirmation Gate
          </h3>
          <span className="text-xs font-mono font-bold text-white bg-red-950/60 border border-red-900/60 px-2.5 py-1 rounded">
            {stagedFiles.length} Total Files
          </span>
        </div>

        <div className="space-y-3">
          {stagedFiles.map((file) => (
            <div
              key={file.stagedId}
              className={`p-4 rounded-lg border transition ${
                file.confirmedByFounder
                  ? "bg-[#121218] border-red-950/80"
                  : "bg-red-950/20 border-amber-500/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-white">{file.fileName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-slate-300 border border-red-950">
                      {(file.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                      {file.category}
                    </span>
                  </div>
                  {file.notes && (
                    <p className="text-xs text-slate-200 mt-1 max-w-2xl font-normal leading-relaxed">{file.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {file.confirmedByFounder ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                      <span>✓</span> Confirmed & Locked
                    </span>
                  ) : (
                    <button
                      onClick={() => confirmStaged(file.stagedId)}
                      className="px-3 py-1.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider transition shadow"
                    >
                      Confirm Import
                    </button>
                  )}
                  <button
                    onClick={() => removeStaged(file.stagedId)}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold transition px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
