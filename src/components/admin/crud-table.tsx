"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Download, Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadCsv } from "@/lib/csv";
import { useMachine } from "@/machines/use-machine";
import { confirmDeleteMachine } from "@/machines/app.machine";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface AdminColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  value?: (row: T) => string | number;
}

export interface AdminFilter<T> {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  match: (row: T, value: string) => boolean;
}

interface Props<T extends { id: string }> {
  rows: T[];
  columns: AdminColumn<T>[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyLabel?: string;
  searchPlaceholder?: string;
  exportFilename?: string;
  filters?: AdminFilter<T>[];
}

const PAGE_SIZE = 10;

export default function CrudTable<T extends { id: string }>({
  rows, columns, loading, onEdit, onDelete, emptyLabel = "No records yet.", searchPlaceholder = "Search records", exportFilename, filters,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "", dir: "desc" });
  const [page, setPage] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [confirmState, sendConfirm] = useMachine(confirmDeleteMachine);
  const requestDelete = (row: T) => { setPendingDelete(row); sendConfirm("OPEN"); };
  const cancelDelete = () => { setPendingDelete(null); sendConfirm("CANCEL"); };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const row = pendingDelete;
    sendConfirm("CONFIRM");
    setPendingDelete(null);
    try {
      await onDelete?.(row);
      sendConfirm("DONE");
    } catch {
      sendConfirm("FAILURE");
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = rows.filter(row => {
      const passesFilters = (filters ?? []).every(filter => {
        const selected = filterValues[filter.key];
        return !selected || filter.match(row, selected);
      });
      return passesFilters && (!term || JSON.stringify(row).toLowerCase().includes(term));
    });
    if (!sort.key) return matched;
    return matched.sort((a, b) => {
      const get = (r: T) => columns.find(c => c.key === sort.key)?.value?.(r) ?? String((r as any)[sort.key] ?? "");
      const av = get(a), bv = get(b);
      const result = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? result : -result;
    });
  }, [rows, search, sort, columns, filters, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: string) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));
    setPage(0);
  };

  return (
    <div className="site-curved border border-border bg-card p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder={searchPlaceholder} className="site-btn site-btn-outline !py-2 pl-9" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">
            {filtered.length ? `Showing ${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}` : "0 records"}
          </span>
          {exportFilename && (
            <Button variant="outline" className="rounded-xl" aria-label="Export CSV" onClick={() => downloadCsv(exportFilename,
              columns.map(c => ({ label: c.label, value: (row: T) => c.value?.(row) ?? (row as any)[c.key] })),
              filtered)}>
              <Download className="size-4" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {filters && filters.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map(filter => (
            <select
              key={filter.key}
              value={filterValues[filter.key] ?? ""}
              onChange={event => {
                setFilterValues(values => ({ ...values, [filter.key]: event.target.value }));
                setPage(0);
              }}
              aria-label={filter.label}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground"
            >
              <option value="">All {filter.label}</option>
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : pageRows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="app-table">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  {columns.map(c => (
                    <th key={c.key} className="px-3 py-3 text-left">
                      <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-primary">
                        {c.label} <ArrowUpDown className="size-3" />
                      </button>
                    </th>
                  ))}
                  {(onEdit || onDelete) && <th className="px-3 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pageRows.map(row => (
                  <tr key={row.id} className="border-b border-border/50 text-sm last:border-0">
                    {columns.map(c => (
                      <td key={c.key} className="px-3 py-3">{c.render ? c.render(row) : String((row as any)[c.key] ?? "-")}</td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {onEdit && <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Edit" onClick={() => onEdit(row)}><Pencil className="size-4" /></Button>}
                          {onDelete && <Button variant="ghost" size="icon" className="rounded-xl text-red-600" aria-label="Delete" onClick={() => requestDelete(row)}><Trash2 className="size-4" /></Button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {pageRows.map(row => (
              <article key={row.id} className="rounded-2xl border border-border p-4">
                {columns.map(c => (
                  <p key={c.key} className="mb-1 text-sm"><span className="font-bold">{c.label}: </span>{c.render ? c.render(row) : String((row as any)[c.key] ?? "-")}</p>
                ))}
                {(onEdit || onDelete) && (
                  <div className="mt-3 flex gap-2">
                    {onEdit && <Button variant="outline" className="rounded-xl" onClick={() => onEdit(row)}>Edit</Button>}
                    {onDelete && <Button variant="outline" className="rounded-xl text-red-600" onClick={() => requestDelete(row)}>Delete</Button>}
                  </div>
                )}
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3 text-sm font-semibold">
              <Button variant="outline" className="rounded-xl" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" className="rounded-xl" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      <Dialog open={confirmState !== "closed"} onOpenChange={open => { if (!open) cancelDelete(); }}>
        <DialogContent aria-describedby="crud-delete-description">
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription id="crud-delete-description">This cannot be undone. The record will be permanently removed.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" disabled={confirmState === "deleting"} onClick={confirmDelete}>{confirmState === "deleting" ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
