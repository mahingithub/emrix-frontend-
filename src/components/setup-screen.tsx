import { Logo } from "@emrix/shared/ui/logo";
import type { SetupProblem } from "@/lib/backend";

const COPY: Record<SetupProblem, { jp: string; title: string; body: string; file: string; line: string }> = {
  "api-missing": {
    jp: "未接続",
    title: "Backend not linked",
    body: "The shop reads everything from the EMRIX backend. Add its address (and the shared key) to",
    file: "frontend/.env.local",
    line: "API_URL=http://localhost:3300\nINTERNAL_API_KEY=…",
  },
  "api-down": {
    jp: "応答なし",
    title: "Backend not running",
    body: "The backend at API_URL isn't answering. Start everything from the project folder with npm run dev, or check",
    file: "frontend/.env.local",
    line: "API_URL=http://localhost:3300",
  },
  "db-missing": {
    jp: "未接続",
    title: "Database not connected",
    body: "The backend is running but has no database yet. Add your MongoDB connection string to",
    file: "backend/.env",
    line: "MONGODB_URI=mongodb+srv://…",
  },
};

/** Local development only: shown instead of crashing while the backend or database isn't set up yet. */
export function SetupScreen({ problem }: { problem: SetupProblem }) {
  const c = COPY[problem];
  return (
    <main className="flex flex-1 items-center justify-center bg-[#f3f1ec] px-5 py-16 text-ink">
      <div className="w-full max-w-lg rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <Logo />
        <p className="mt-8 font-jp text-xs font-bold tracking-[0.3em] text-shu">{c.jp}</p>
        <h1 className="mt-1 font-display text-3xl uppercase leading-none">{c.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          {c.body} <code className="rounded bg-ink/5 px-1 font-mono text-[13px]">{c.file}</code>:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink px-4 py-3 font-mono text-[13px] text-paper">{c.line}</pre>
        <p className="mt-4 text-xs leading-relaxed text-ink/50">
          Then reload this page. (This screen only appears in local development. A production build stops with an error
          instead.)
        </p>
      </div>
    </main>
  );
}
