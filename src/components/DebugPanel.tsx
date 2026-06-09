import { useState } from "react";
import { useStore } from "../store";
import { toPersianDigits } from "../utils/jalali";
import { TrashIcon } from "./Icons";

interface Props {
  onClose: () => void;
}

export function DebugPanel({ onClose }: Props) {
  const { logs, clearLogs, addLog, showToast } = useStore();
  const [filter, setFilter] = useState<"all" | "error" | "warn" | "info">("all");

  const filtered = logs.filter((l) => filter === "all" || l.level === filter);

  const copyAll = async () => {
    const text = logs
      .map((l) => `[${new Date(l.timestamp).toLocaleTimeString("fa-IR")}] ${l.level.toUpperCase()} ${l.source}: ${l.message}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    showToast("کپی شد");
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rozanaam-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addTestLog = (level: "error" | "warn" | "info") => {
    addLog({
      level,
      source: "manual",
      message: level === "error" ? "خطای تست دستی" : "پیام تست",
      context: { test: true, ts: Date.now() },
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-end justify-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[var(--color-bg-secondary)] rounded-t-3xl p-5 animate-slide-up max-h-[92vh] flex flex-col"
        style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}
      >
        <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mb-3" />
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-bold">🛠 پنل توسعه‌دهنده (لاگ‌ها)</h2>
            <div className="text-[10px] text-[var(--color-text-muted)] tabular-fa">{toPersianDigits(logs.length)} مورد</div>
          </div>
          <button onClick={onClose} className="text-sm px-3 py-1 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">بستن</button>
        </div>

        {/* Filters + actions */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          {(["all", "error", "warn", "info"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full border transition ${filter === f ? "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}
            >
              {f === "all" ? "همه" : f.toUpperCase()}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={copyAll} className="px-3 py-1 rounded-xl border border-[var(--color-border)]">کپی</button>
          <button onClick={download} className="px-3 py-1 rounded-xl border border-[var(--color-border)]">دانلود</button>
          <button onClick={clearLogs} className="px-3 py-1 rounded-xl border border-[var(--color-danger)]/40 text-[var(--color-danger)] flex items-center gap-1">
            <TrashIcon className="w-3.5 h-3.5" /> پاک
          </button>
        </div>

        <div className="flex-1 overflow-auto space-y-2 pr-1 text-sm" style={{ maxHeight: "340px" }}>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-[var(--color-text-muted)]">لاگی موجود نیست</div>
          )}
          {filtered.map((log) => (
            <div key={log.id} className="card p-3 text-xs font-mono">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${log.level === "error" ? "bg-[var(--color-danger)]/20 text-[var(--color-danger)]" : log.level === "warn" ? "bg-[var(--color-warning)]/25 text-[var(--color-warning)]" : "bg-[var(--color-accent-teal)]/20 text-[var(--color-accent-teal)]"}`}>
                  {log.level}
                </span>
                <span className="text-[var(--color-text-muted)] tabular-fa">
                  {new Date(log.timestamp).toLocaleTimeString("fa-IR")}
                </span>
                <span className="text-[var(--color-text-secondary)]">• {log.source}</span>
              </div>
              <div className="text-[var(--color-text-primary)]">{log.message}</div>
              {log.context && (
                <pre className="mt-1 text-[9px] text-[var(--color-text-muted)] overflow-auto">{JSON.stringify(log.context, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[var(--color-border)] mt-2 text-xs flex gap-2">
          <button onClick={() => addTestLog("info")} className="flex-1 py-2 rounded-xl border border-[var(--color-border)]">تست INFO</button>
          <button onClick={() => addTestLog("warn")} className="flex-1 py-2 rounded-xl border border-[var(--color-border)]">تست WARN</button>
          <button onClick={() => addTestLog("error")} className="flex-1 py-2 rounded-xl border border-[var(--color-border)]">تست ERROR</button>
        </div>

        <div className="text-[10px] text-center text-[var(--color-text-muted)] mt-3">
          لاگ‌ها فقط روی دستگاه ذخیره می‌شوند • حداکثر ۲۰۰ مورد
        </div>
      </div>
    </div>
  );
}
