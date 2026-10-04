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
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <span>Document & Reference Media Staging Vault</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              Zero Unconsented Parsing &bull; Local-First
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage doctoral research, mechanical service guides, and business proposals with strict confirmation gating.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Supported: </span>
          <span className="text-slate-300">{ALLOWED_EXTENSIONS.slice(0, 5).join(" ")}</span>
        </div>
      </section>

      {/* STAGING DROPZONE / UPLOADER */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-6 shadow-lg space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Stage New Reference Document or Media
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Select Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Doctoral DBA Research">Doctoral DBA Research & Resubmission</option>
              <option value="Stoic Business Consulting">Stoic Business Consulting & Retainers</option>
              <option value="Mechanical Manuals">Mechanical Manuals (Mustang / Tools)</option>
              <option value="Fatherhood Athleticism">Fatherhood Athleticism & Milestones</option>
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
                className="flex-1 px-3 py-2 rounded-lg bg-[#181924] border border-[#232636] hover:border-amber-500/40 text-xs font-medium text-slate-300 hover:text-amber-400 transition"
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
                className="flex-1 px-3 py-2 rounded-lg bg-[#181924] border border-[#232636] hover:border-amber-500/40 text-xs font-medium text-slate-300 hover:text-amber-400 transition"
              >
                + Stage Consulting DOCX (1.0 MB)
              </button>
            </div>
          </div>
        </div>

        {validationError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {validationError}
          </div>
        )}
      </section>

      {/* STAGED DOCUMENTS VAULT TABLE */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Vault Index & Two-Step Confirmation Gate
          </h3>
          <span className="text-xs font-mono text-slate-400">{stagedFiles.length} Total Files</span>
        </div>

        <div className="space-y-3">
          {stagedFiles.map((file) => (
            <div
              key={file.stagedId}
              className={`p-4 rounded-lg border transition ${
                file.confirmedByFounder
                  ? "bg-[#181924] border-[#232636]"
                  : "bg-amber-500/5 border-amber-500/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-100">{file.fileName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {(file.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {file.category}
                    </span>
                  </div>
                  {file.notes && (
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">{file.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {file.confirmedByFounder ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                      <span>✓</span> Confirmed & Locked
                    </span>
                  ) : (
                    <button
                      onClick={() => confirmStaged(file.stagedId)}
                      className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow"
                    >
                      Confirm Import
                    </button>
                  )}
                  <button
                    onClick={() => removeStaged(file.stagedId)}
                    className="text-xs text-slate-500 hover:text-red-400 transition px-2 py-1"
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
