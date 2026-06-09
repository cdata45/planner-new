import { useMemo, useState } from "react";
import { useStore } from "../store";
import { CheckIcon, PlusIcon, TrashIcon } from "../components/Icons";
import { addDaysToJalali, formatJalaliShort, jalaliKey, parseKey, todayKey, toPersianDigits } from "../utils/jalali";
import type { Priority } from "../types";

const PRIORITIES: { v: Priority; label: string; color: string }[] = [
  { v: "low", label: "کم", color: "#8B8A9B" },
  { v: "medium", label: "متوسط", color: "#38B2AC" },
  { v: "high", label: "زیاد", color: "#F0B429" },
  { v: "urgent", label: "فوری", color: "#FC5C65" },
];

export function TasksPage() {
  const { data, addTask, toggleTask, deleteTask } = useStore();
  const [filter, setFilter] = useState<"all" | "today" | "pending" | "done">("today");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newDate, setNewDate] = useState(todayKey());

  const filtered = useMemo(() => {
    const todayK = todayKey();
    let arr = [...data.tasks];
    if (filter === "today") arr = arr.filter((t) => t.date === todayK);
    if (filter === "pending") arr = arr.filter((t) => !t.completed);
    if (filter === "done") arr = arr.filter((t) => t.completed);
    return arr.sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      return b.createdAt - a.createdAt;
    });
  }, [data.tasks, filter]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask({
      date: newDate,
      title: newTitle.trim(),
      priority: newPriority,
      completed: false,
      completedAt: null,
      tags: [],
      estimatedMinutes: null,
    });
    setNewTitle("");
  };

  const todayK = todayKey();
  const totalToday = data.tasks.filter((t) => t.date === todayK).length;
  const doneToday = data.tasks.filter((t) => t.date === todayK && t.completed).length;

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-30 px-4 pt-6 pb-3 bg-[var(--color-bg-primary)]/85 backdrop-blur-xl border-b border-[var(--color-border)]/60">
        <div className="max-w-xl mx-auto">
          <h1 className="text-xl font-bold">وظایف</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 tabular-fa">
            امروز {toPersianDigits(doneToday)} از {toPersianDigits(totalToday)} انجام شده
          </p>
        </div>
      </header>

      <div className="px-4 mt-4 max-w-xl mx-auto space-y-4">
        {/* Add task */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3">وظیفه جدید</h2>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="عنوان وظیفه..."
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] outline-none text-sm transition"
          />
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {PRIORITIES.map((p) => (
              <button
                key={p.v}
                onClick={() => setNewPriority(p.v)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  newPriority === p.v
                    ? "text-white"
                    : "bg-[var(--color-bg-elevated)]/60 border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
                style={
                  newPriority === p.v
                    ? { background: p.color, borderColor: p.color }
                    : undefined
                }
              >
                {p.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="px-4 py-1.5 rounded-full bg-[var(--color-accent-primary)] text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1 active:scale-95 transition"
            >
              <PlusIcon className="w-4 h-4" />
              افزودن
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {[
              { v: todayKey(), label: "امروز" },
              { v: jalaliKey(addDaysToJalali(parseKey(todayKey()), 1)), label: "فردا" },
              { v: jalaliKey(addDaysToJalali(parseKey(todayKey()), 7)), label: "هفته بعد" },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setNewDate(opt.v)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition tabular-fa ${
                  newDate === opt.v
                    ? "bg-[var(--color-accent-teal)]/20 border-[var(--color-accent-teal)]/40 text-[var(--color-accent-teal)]"
                    : "bg-[var(--color-bg-elevated)]/60 border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span className="text-[10px] text-[var(--color-text-muted)] mr-auto tabular-fa">
              {formatJalaliShort(parseKey(newDate))}
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          {[
            { v: "today", label: "امروز" },
            { v: "pending", label: "در انتظار" },
            { v: "done", label: "انجام شده" },
            { v: "all", label: "همه" },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v as typeof filter)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                filter === f.v
                  ? "bg-[var(--color-accent-primary)] text-white"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="card p-8 text-center">
              <div className="text-5xl mb-2">🎯</div>
              <div className="font-semibold">وظیفه‌ای نیست</div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                با افزودن یک وظیفه شروع کن
              </p>
            </div>
          )}
          {filtered.map((t) => {
            const prio = PRIORITIES.find((p) => p.v === t.priority)!;
            return (
              <div
                key={t.id}
                className={`animate-fade-up card p-3 flex items-center gap-3 ${t.completed ? "opacity-70" : ""}`}
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition ${
                    t.completed
                      ? "bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)] text-white"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  {t.completed && <CheckIcon className="w-4 h-4 animate-pop" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm ${
                      t.completed
                        ? "line-through text-[var(--color-text-muted)]"
                        : "text-[var(--color-text-primary)]"
                    }`}
                  >
                    {t.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--color-text-muted)] tabular-fa">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                      style={{ background: `${prio.color}25`, color: prio.color }}
                    >
                      ● {prio.label}
                    </span>
                    <span>{formatJalaliShort(parseKey(t.date))}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
