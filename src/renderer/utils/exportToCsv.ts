export interface CsvOptions {
  delimiter?: ',' | ';';
  filename?: string;
}

const escapeValue = (value: unknown, delimiter: string) => {
  const stringValue = value === null || value === undefined ? '' : String(value);
  const needsQuotes = stringValue.includes('\n') || stringValue.includes('\r') || stringValue.includes('"') || stringValue.includes(delimiter);
  const escaped = stringValue.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

export const exportToCsv = (rows: Record<string, unknown>[], options: CsvOptions = {}) => {
  if (rows.length === 0) {
    return;
  }
  const delimiter = options.delimiter ?? ';';
  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(delimiter)];

  for (const row of rows) {
    csvLines.push(headers.map((header) => escapeValue(row[header], delimiter)).join(delimiter));
  }

  const bom = '\uFEFF';
  const blob = new Blob([bom + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = options.filename ?? 'export.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};
