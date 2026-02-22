// src/compliance/utils/data-export.ts

/**
 * GDPR Article 20 - Right to Data Portability
 *
 * Provides utilities for exporting user data in a structured,
 * commonly used, and machine-readable format.
 */

// ─── Types ───────────────────────────────────────────────

interface DataExportSection {
  readonly category: string;
  readonly data: Record<string, unknown>[];
  readonly exportedAt: string;
}

interface DataExportPackage {
  readonly userId: string;
  readonly requestedAt: string;
  readonly exportedAt: string;
  readonly format: 'json' | 'csv';
  readonly sections: DataExportSection[];
  readonly checksum: string;
}

// ─── Export Functions ─────────────────────────────────────

/**
 * Fetch the user's portable data from the backend.
 */
export async function requestDataExport(
  userId: string,
  format: 'json' | 'csv' = 'json',
): Promise<DataExportPackage> {
  const response = await fetch(`/api/v1/gdpr/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, format }),
  });

  if (!response.ok) {
    throw new Error(`Data export request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Convert export data to a downloadable JSON blob.
 */
export function exportToJSON(data: DataExportPackage): Blob {
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Convert export data to a downloadable CSV blob.
 * Each section becomes a separate CSV table separated by headers.
 */
export function exportToCSV(data: DataExportPackage): Blob {
  const sections: string[] = [];

  for (const section of data.sections) {
    if (section.data.length === 0) continue;

    // Section header
    sections.push(`# ${section.category}`);
    sections.push(`# Exported: ${section.exportedAt}`);

    // CSV headers from first record
    const headers = Object.keys(section.data[0]);
    sections.push(headers.map(escapeCSVField).join(','));

    // CSV rows
    for (const record of section.data) {
      const row = headers.map((h) => escapeCSVField(String(record[h] ?? '')));
      sections.push(row.join(','));
    }

    sections.push(''); // Blank line between sections
  }

  return new Blob([sections.join('\n')], { type: 'text/csv' });
}

/**
 * Trigger a file download in the browser.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape a field for CSV output.
 * Wraps fields containing commas, quotes, or newlines in double quotes.
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
