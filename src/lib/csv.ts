export function csvValue(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  const maybeTimestamp = value as { toDate?: () => Date };
  if (typeof maybeTimestamp.toDate === "function") return maybeTimestamp.toDate().toISOString();
  return String(value);
}

export function downloadCsv<T>(filename: string, columns: { label: string; value: (row: T) => unknown }[], rows: T[]) {
  const escape = (value: unknown) => `"${csvValue(value).replace(/"/g, '""')}"`;
  const lines = [
    columns.map(c => escape(c.label)).join(","),
    ...rows.map(row => columns.map(c => escape(c.value(row))).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}
