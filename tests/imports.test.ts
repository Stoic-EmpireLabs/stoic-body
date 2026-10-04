import test from "node:test";
import assert from "node:assert/strict";
import {
  validateImportFile,
  createStagedImport,
  ALLOWED_EXTENSIONS,
  MAX_FILE_BYTES,
} from "../src/lib/imports";

test("Stoic Body — Document & Media Importer Security & Validation", () => {
  // Check allowed extensions
  assert.ok(ALLOWED_EXTENSIONS.includes(".pdf"));
  assert.ok(ALLOWED_EXTENSIONS.includes(".docx"));
  assert.ok(ALLOWED_EXTENSIONS.includes(".png"));
  assert.ok(ALLOWED_EXTENSIONS.includes(".jpg"));
  assert.ok(ALLOWED_EXTENSIONS.includes(".md"));

  // 1. Valid PDF file import
  const validFile = {
    name: "DBA_Doctoral_Research_Methodology_v2.pdf",
    size: 2 * 1024 * 1024, // 2MB
    mimeType: "application/pdf",
  };
  const valResult = validateImportFile(validFile);
  assert.equal(valResult.valid, true);

  // 2. Reject disallowed extension (executable script)
  const maliciousFile = {
    name: "malicious_script.exe",
    size: 1024,
    mimeType: "application/x-msdownload",
  };
  const malResult = validateImportFile(maliciousFile);
  assert.equal(malResult.valid, false);
  assert.ok(malResult.error?.includes("Disallowed file type"));

  // 3. Reject oversized file (> 25MB)
  const oversizedFile = {
    name: "huge_video.mp4",
    size: 30 * 1024 * 1024,
    mimeType: "video/mp4",
  };
  const sizeResult = validateImportFile(oversizedFile);
  assert.equal(sizeResult.valid, false);

  // 4. Staging requires explicit user confirmation gate
  const staged = createStagedImport(validFile, "Doctoral Research Assignment");
  assert.equal(staged.confirmedByFounder, false);
  assert.equal(staged.category, "Doctoral Research Assignment");
  assert.ok(staged.stagedId.length > 5);
});
