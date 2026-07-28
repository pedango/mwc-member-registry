"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Numeric } from "@/components/shared/Numeric";

type BulkResult = {
  succeeded: Array<{ row: number; id: string }>;
  failed: Array<{ row: number; error: string }>;
  summary: { total: number; successCount: number; failCount: number };
};

const TEMPLATE_COLUMNS = [
  { name: "firstName", note: "Required" },
  { name: "lastName", note: "Required" },
  { name: "sex", note: "MALE or FEMALE" },
  { name: "assembly", note: "ENGLISH or LOCAL" },
  { name: "status", note: "MEMBER or OFFICER" },
  { name: "otherNames", note: "Optional" },
  { name: "contact", note: "Optional" },
  { name: "location", note: "Optional" },
  { name: "motherName", note: "Optional" },
  { name: "fatherName", note: "Optional" },
  { name: "position", note: "Optional" },
  { name: "photoUrl", note: "Optional URL" },
  { name: "dateBaptised", note: "Optional date" },
  { name: "baptisedBy", note: "Optional" },
];

export default function BulkPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);

  function clearFile() {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a spreadsheet first");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/members/bulk", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setResult(json);
      toast.success(
        `Imported ${json.summary.successCount} of ${json.summary.total} rows`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Bulk import"
        description="Download the template, fill it in, then upload it to create members in one pass"
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <SectionCard
            title="Step 1 — Download the template"
            description="An .xlsx file with every supported column already set up"
          >
            <Button asChild variant="outline">
              <a href="/api/members/template">
                <Download className="h-4 w-4" aria-hidden="true" />
                Download template
              </a>
            </Button>
          </SectionCard>

          <SectionCard
            title="Step 2 — Upload your file"
            description="Every row is validated individually, so a bad row never blocks the rest"
          >
            <form onSubmit={onUpload} className="space-y-4">
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setResult(null);
                }}
              />

              {file ? (
                <div className="flex items-center gap-3 rounded-lg border border-mwc-border bg-mwc-surface/60 p-4">
                  <span className="rounded-full bg-white p-2 text-mwc-blue shadow-sm">
                    <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="numeric type-caption tabular-nums">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearFile}
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-mwc-border bg-mwc-surface/50 px-6 py-10 text-center transition-ui hover:border-mwc-blue/40 hover:bg-mwc-surface"
                >
                  <span className="rounded-full bg-white p-3 text-mwc-blue shadow-sm">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Choose a spreadsheet
                  </span>
                  <span className="type-caption">
                    Accepts .xlsx, .xls or .csv
                  </span>
                </button>
              )}

              <Button
                type="submit"
                disabled={loading || !file}
                aria-busy={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "Importing..." : "Upload and import"}
              </Button>
            </form>
          </SectionCard>

          {result ? (
            <SectionCard
              title="Import results"
              description="Review anything that needs a second pass"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <ResultTile label="Rows read" value={result.summary.total} />
                <ResultTile
                  label="Created"
                  value={result.summary.successCount}
                  tone="success"
                />
                <ResultTile
                  label="Failed"
                  value={result.summary.failCount}
                  tone={result.summary.failCount > 0 ? "danger" : "default"}
                />
              </div>

              {result.failed.length > 0 ? (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50/70 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Rows that could not be imported
                  </p>
                  <ul className="space-y-1 text-sm text-red-900">
                    {result.failed.map((f) => (
                      <li key={`${f.row}-${f.error}`}>
                        <span className="numeric font-medium tabular-nums">
                          Row {f.row}
                        </span>
                        {" — "}
                        {f.error}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.succeeded.length > 0 ? (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Members created
                  </p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-emerald-900">
                    {result.succeeded.map((s) => (
                      <li key={s.id}>
                        <a
                          className="numeric underline underline-offset-2 tabular-nums"
                          href={`/members/${s.id}`}
                        >
                          Row {s.row}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </SectionCard>
          ) : null}
        </div>

        <SectionCard
          title="Column reference"
          description="Headers must match these names exactly"
          className="lg:sticky lg:top-6"
        >
          <ul className="divide-y divide-mwc-border">
            {TEMPLATE_COLUMNS.map((column) => (
              <li
                key={column.name}
                className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <code className="text-caption font-semibold text-foreground">
                  {column.name}
                </code>
                <span className="shrink-0 type-caption">{column.note}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

function ResultTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50/70 text-emerald-800"
      : tone === "danger"
        ? "border-red-200 bg-red-50/70 text-red-800"
        : "border-mwc-border bg-mwc-surface/60 text-foreground";

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-caption font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
      <Numeric as="p" className="mt-1 text-2xl font-bold leading-none">
        {value}
      </Numeric>
    </div>
  );
}
