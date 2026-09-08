import { AlertTriangle, Database, RefreshCw } from "lucide-react";

interface DbErrorNoticeProps {
  detail: string;
}

/**
 * Shown when the site is deployed but the database is not reachable.
 * Replaces the generic host error page ("This page couldn't load") with an
 * actionable explanation so the site owner knows exactly what to fix.
 */
export default function DbErrorNotice({ detail }: DbErrorNoticeProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">
              Database not connected yet
            </h1>
            <p className="text-xs text-slate-500">
              The web server is running — only the database connection is missing.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <Database className="h-3.5 w-3.5" /> Server reported
          </p>
          <p className="mt-2 break-words font-mono text-[11px] leading-relaxed text-rose-700">
            {detail}
          </p>
        </div>

        <ol className="mt-6 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-slate-600">
          <li>
            In your hosting panel (Hostinger / Vercel) open the app&apos;s{" "}
            <strong>Environment Variables</strong> and set{" "}
            <code className="rounded bg-slate-100 px-1 font-mono">DATABASE_URL</code> to your
            Supabase <strong>Session pooler</strong> connection string (port 5432).
          </li>
          <li>
            Also set{" "}
            <code className="rounded bg-slate-100 px-1 font-mono">NEXT_PUBLIC_SITE_URL</code> to
            this domain.
          </li>
          <li>
            <strong>Restart</strong> the Node app (environment changes need a restart). Tables
            are created automatically on first boot.
          </li>
          <li>
            Verify with{" "}
            <code className="rounded bg-slate-100 px-1 font-mono">/api/health</code> — it returns
            the exact connection status.
          </li>
        </ol>

        <p className="mt-5 text-[11px] text-slate-400">
          Full instructions: see DEPLOYMENT.md in the project repository.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0A2540] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#071728]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload page
        </button>
      </div>
    </div>
  );
}
