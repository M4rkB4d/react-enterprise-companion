// src/kyc/components/DocumentUpload.tsx

/**
 * Compliance-aware document upload component for KYC verification.
 *
 * Features:
 * - File type validation (only images and PDFs)
 * - File size limit (10 MB max)
 * - Client-side preview
 * - Upload progress tracking
 * - Audit trail logging
 */

import { useState, useCallback, useRef } from 'react';
import { useAuditTrail } from '@/compliance/hooks/useAuditTrail';

// ─── Types ───────────────────────────────────────────────

type DocumentType = 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement';

interface UploadedFile {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly previewUrl: string | null;
  readonly uploadProgress: number;
  readonly status: 'pending' | 'uploading' | 'complete' | 'error';
  readonly errorMessage?: string;
}

interface DocumentUploadProps {
  readonly documentType: DocumentType;
  readonly label: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly maxSizeMB?: number;
  readonly acceptedTypes?: string[];
  readonly onFileUploaded: (fileId: string) => void;
  readonly onFileRemoved?: (fileId: string) => void;
}

// ─── Constants ───────────────────────────────────────────

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const DEFAULT_MAX_SIZE_MB = 10;

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  passport: 'Passport',
  national_id: 'National ID Card',
  drivers_license: "Driver's License",
  utility_bill: 'Utility Bill',
  bank_statement: 'Bank Statement',
};

// ─── Component ───────────────────────────────────────────

export function DocumentUpload({
  documentType,
  label,
  description,
  required = false,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  onFileUploaded,
  onFileRemoved,
}: DocumentUploadProps) {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { logEvent } = useAuditTrail();

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  /**
   * Validate the selected file.
   */
  const validateFile = useCallback(
    (selectedFile: File): string | null => {
      if (!acceptedTypes.includes(selectedFile.type)) {
        return `Invalid file type. Accepted: ${acceptedTypes.map((t) => t.split('/')[1]).join(', ')}`;
      }
      if (selectedFile.size > maxSizeBytes) {
        return `File too large. Maximum size: ${maxSizeMB} MB`;
      }
      return null;
    },
    [acceptedTypes, maxSizeBytes, maxSizeMB],
  );

  /**
   * Handle file selection (from input or drop).
   */
  const handleFile = useCallback(
    async (selectedFile: File) => {
      const error = validateFile(selectedFile);
      if (error) {
        setFile({
          id: '',
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          previewUrl: null,
          uploadProgress: 0,
          status: 'error',
          errorMessage: error,
        });
        return;
      }

      // Create preview for images
      const previewUrl = selectedFile.type.startsWith('image/')
        ? URL.createObjectURL(selectedFile)
        : null;

      const fileEntry: UploadedFile = {
        id: crypto.randomUUID(),
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        previewUrl,
        uploadProgress: 0,
        status: 'uploading',
      };

      setFile(fileEntry);

      // Log document upload attempt
      logEvent({
        action: 'kyc.document_upload_started',
        resource: `document:${documentType}`,
        metadata: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
        },
      });

      // Simulate upload (in production, use actual upload API)
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('documentType', documentType);

        const response = await fetch('/api/v1/kyc/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const result = await response.json();
        const uploadedFileId = result.fileId ?? fileEntry.id;

        setFile({
          ...fileEntry,
          id: uploadedFileId,
          uploadProgress: 100,
          status: 'complete',
        });

        onFileUploaded(uploadedFileId);

        logEvent({
          action: 'kyc.document_upload_complete',
          resource: `document:${documentType}`,
          metadata: { fileId: uploadedFileId },
        });
      } catch (uploadError) {
        setFile({
          ...fileEntry,
          status: 'error',
          errorMessage:
            uploadError instanceof Error ? uploadError.message : 'Upload failed',
        });

        logEvent({
          action: 'kyc.document_upload_failed',
          resource: `document:${documentType}`,
          metadata: {
            error: uploadError instanceof Error ? uploadError.message : 'Unknown',
          },
        });
      }
    },
    [validateFile, documentType, logEvent, onFileUploaded],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) handleFile(selectedFile);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    if (file?.id && onFileRemoved) {
      onFileRemoved(file.id);
    }
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [file, onFileRemoved]);

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}

      {/* Upload Area */}
      {!file || file.status === 'error' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8
                      text-center transition-colors
                      ${isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-300 bg-slate-50 hover:border-blue-300'
                      }`}
        >
          <div className="text-slate-400">
            <p className="text-sm font-medium">
              Drop your {DOCUMENT_TYPE_LABELS[documentType]} here
            </p>
            <p className="mt-1 text-xs">
              or click to browse ({acceptedTypes.map((t) => t.split('/')[1]).join(', ')}, max {maxSizeMB} MB)
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        /* File Preview */
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-4">
            {file.previewUrl && (
              <img
                src={file.previewUrl}
                alt={`Preview of ${file.name}`}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">{file.name}</p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {file.status === 'uploading' && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${file.uploadProgress}%` }}
                  />
                </div>
              )}
              {file.status === 'complete' && (
                <span className="mt-1 inline-block text-xs font-medium text-green-600">
                  Uploaded successfully
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label={`Remove ${file.name}`}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {file?.status === 'error' && file.errorMessage && (
        <p className="text-xs text-red-600">{file.errorMessage}</p>
      )}
    </div>
  );
}
