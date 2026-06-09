import { useStore } from "../store";
import { CheckIcon } from "./Icons";

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="fixed top-4 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-up pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl glass shadow-lg text-sm"
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              t.tone === "error"
                ? "bg-[var(--color-danger)]/20 text-[var(--color-danger)]"
                : t.tone === "info"
                  ? "bg-[var(--color-accent-teal)]/20 text-[var(--color-accent-teal)]"
                  : "bg-[var(--color-success)]/20 text-[var(--color-success)]"
            }`}
          >
            <CheckIcon className="w-3.5 h-3.5" />
          </span>
          <span className="text-[var(--color-text-primary)]">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
