export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".md",
  ".txt",
];

export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

export interface UploadedFileInfo {
  name: string;
  size: number;
  mimeType: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  extension?: string;
}

export function validateImportFile(file: UploadedFileInfo): ValidationResult {
  const lastDot = file.name.lastIndexOf(".");
  if (lastDot === -1) {
    return { valid: false, error: "Missing file extension." };
  }

  const ext = file.name.slice(lastDot).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Disallowed file type: ${ext}. Supported types: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of 25 MB.`,
    };
  }

  return { valid: true, extension: ext };
}

export interface StagedImport {
  stagedId: string;
  fileName: string;
  fileSizeBytes: number;
  category: string;
  stagedAt: string;
  confirmedByFounder: boolean;
  notes?: string;
}

export function createStagedImport(file: UploadedFileInfo, category: string, notes?: string): StagedImport {
  const stagedId = `stage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    stagedId,
    fileName: file.name,
    fileSizeBytes: file.size,
    category,
    stagedAt: new Date().toISOString(),
    confirmedByFounder: false,
    notes,
  };
}
