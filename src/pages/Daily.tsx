import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { DateNavigator } from "../components/DateNavigator";
import { PlusIcon, TrashIcon, CheckIcon, StarIcon, HeartIcon, LightbulbIcon, SparklesIcon } from "../components/Icons";
import { toPersianDigits } from "../utils/jalali";

const MOODS = [
  { v: 1, emoji: "😞", label: "خیلی بد", color: "#FC5C65" },
  { v: 2, emoji: "😐", label: "بد", color: "#FED330" },
  { v: 3, emoji: "🙂", label: "معمولی", color: "#FED330" },
  { v: 4, emoji: "😊", label: "خوب", color: "#26DE81" },
  { v: 5, emoji: "😄", label: "عالی", color: "#26DE81" },
] as const;

export function DailyPage() {
  const { selectedDate, getDay, updateDay, tasksForDate, addTask, toggleTask, deleteTask, data, getCompletion, toggleHabitCompletion } = useStore();
  const day = getDay(selectedDate);
  const tasks = tasksForDate(selectedDate);
  const activeHabits = useMemo(() => data.habits.filter((h) => h.active), [data.habits]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // local mirror for text inputs (uncontrolled-like to avoid lag)
  const [localFeeling, setLocalFeeling] = useState(day.feeling);
  const [localLesson, setLocalLesson] = useState(day.lesson);
  const [localNotes, setLocalNotes] = useState(day.notes);

  useEffect(() => {
    setLocalFeeling(day.feeling);
    setLocalLesson(day.lesson);
    setLocalNotes(day.notes);
  }, [selectedDate]); // eslint-disable-line

  // simple debounced commit
  useEffect(() => {
    const t = setTimeout(() => {
      if (localFeeling !== day.feeling) updateDay(selectedDate, { feeling: localFeeling });
    }, 500);
    return () => clearTimeout(t);
  }, [localFeeling]); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => {
      if (localLesson !== day.lesson) updateDay(selectedDate, { lesson: localLesson });
    }, 500);
    return () => clearTimeout(t);
  }, [localLesson]); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => {
      if (localNotes !== day.notes) updateDay(selectedDate, { notes: localNotes });
    }, 500);
    return () => clearTimeout(t);
  }, [localNotes]); // eslint-disable-line

  const handleAddPositive = (v: string) => {
    if (!v.trim() || day.positives.length >= 5) return;
    updateDay(selectedDate, { positives: [...day.positives, v.trim()] });
  };
  const handleRemovePositive = (i: number) =>
    updateDay(selectedDate, { positives: day.positives.filter((_, k) => k !== i) });

  const handleAddNegative = (v: string) => {
    if (!v.trim() || day.negatives.length >= 5) return;
    updateDay(selectedDate, { negatives: [...day.negatives, v.trim()] });
  };
  const handleRemoveNegative = (i: number) =>
    updateDay(selectedDate, { negatives: day.negatives.filter((_, k) => k !== i) });

  const handleGratitude = (idx: 0 | 1 | 2, v: string) => {
    const g = [...day.gratitude] as [string, string, string];
    g[idx] = v;
    updateDay(selectedDate, { gratitude: g });
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask({
      date: selectedDate,
      title: newTaskTitle.trim(),
      priority: "medium",
      completed: false,
      completedAt: null,
      tags: [],
      estimatedMinutes: null,
    });
    setNewTaskTitle("");
  };

  return (
    <div className="pb-32">
      <DateNavigator />

      <div className="px-4 mt-4 space-y-4 max-w-xl mx-auto">
        {/* Hero greeting */}
        <Hero day={day} />

        {/* Mood + Energy */}
        <div className="grid grid-cols-1 gap-4">
          <Card title="چطوری؟" subtitle="حال و هوای کلی امروز" icon={<HeartIcon className="w-4 h-4 text-[var(--color-accent-rose)]" />}>
            <div className="flex items-stretch justify-between gap-2 mt-2">
              {MOODS.map((m) => {
                const selected = day.mood === m.v;
                return (
                  <button
                    key={m.v}
                    onClick={() => updateDay(selectedDate, { mood: m.v })}
                    className={`flex-1 group flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${
                      selected
                        ? "bg-[var(--color-accent-primary)]/15 border-[var(--color-accent-primary)] scale-[1.04]"
                        : "bg-[var(--color-bg-elevated)]/50 border-transparent hover:border-[var(--color-border)]"
                    }`}
                  >
                    <span className={`text-3xl transition-transform ${selected ? "scale-110" : "group-hover:scale-105"}`}>{m.emoji}</span>
                    <span className={`text-[10px] ${selected ? "text-[var(--color-text-primary)] font-semibold" : "text-[var(--color-text-muted)]"}`}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="انرژی" subtitle="سطح انرژی‌ات چقدره؟" icon={<SparklesIcon className="w-4 h-4 text-[var(--color-accent-gold)]" />}>
            <div className="flex items-center justify-between gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((v) => {
                const active = day.energy >= v;
                return (
                  <button
                    key={v}
                    onClick={() => updateDay(selectedDate, { energy: v as 1 | 2 | 3 | 4 | 5 })}
                    className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? "bg-gradient-to-t from-[#f0b429] to-[#f7c95a] text-[#1a1928] font-bold shadow-lg shadow-amber-500/20"
                        : "bg-[var(--color-bg-elevated)]/50 text-[var(--color-text-muted)]"
                    }`}
                  >
                    <span className="text-lg">⚡</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Positives */}
        <Card title="اتفاقات مثبت" subtitle={`${toPersianDigits(day.positives.length)}/${toPersianDigits(5)}`} icon={<span className="text-base">✨</span>}>
          <ListInput
            placeholder="یک موفقیت یا لحظه خوب امروز..."
            onAdd={handleAddPositive}
            disabled={day.positives.length >= 5}
            accent="success"
          />
          <ul className="mt-3 space-y-2">
            {day.positives.map((p, i) => (
              <li key={i} className="animate-fade-up flex items-start gap-2 px-3 py-2 rounded-xl bg-[var(--color-success)]/8 border border-[var(--color-success)]/20">
                <span className="mt-1 w-2 h-2 rounded-full bg-[var(--color-success)] flex-shrink-0" />
                <span className="flex-1 text-sm">{p}</span>
                <button onClick={() => handleRemovePositive(i)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Negatives */}
        <Card title="اتفاقات منفی" subtitle={`${toPersianDigits(day.negatives.length)}/${toPersianDigits(5)}`} icon={<span className="text-base">🌧️</span>}>
          <ListInput
            placeholder="چیزی که خوب پیش نرفت..."
            onAdd={handleAddNegative}
            disabled={day.negatives.length >= 5}
            accent="danger"
          />
          <ul className="mt-3 space-y-2">
            {day.negatives.map((p, i) => (
              <li key={i} className="animate-fade-up flex items-start gap-2 px-3 py-2 rounded-xl bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/20">
                <span className="mt-1 w-2 h-2 rounded-full bg-[var(--color-danger)] flex-shrink-0" />
                <span className="flex-1 text-sm">{p}</span>
                <button onClick={() => handleRemoveNegative(i)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Gratitude */}
        <Card title="سپاسگزاری" subtitle="سه چیز که امروز بابتش شکرگزاری" icon={<span className="text-base">🙏</span>}>
          <div className="space-y-2 mt-2">
            {([0, 1, 2] as const).map((i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)] focus-within:border-[var(--color-accent-primary)] transition">
                <span className="w-6 h-6 rounded-full bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)] flex items-center justify-center text-xs font-bold tabular-fa">
                  {toPersianDigits(i + 1)}
                </span>
                <input
                  type="text"
                  value={day.gratitude[i]}
                  onChange={(e) => handleGratitude(i, e.target.value)}
                  placeholder="سپاسگزارم بابت..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Feeling */}
        <Card title="احساس کلی" subtitle="آزادانه بنویس" icon={<HeartIcon className="w-4 h-4 text-[var(--color-accent-rose)]" />}>
          <textarea
            value={localFeeling}
            onChange={(e) => setLocalFeeling(e.target.value)}
            rows={3}
            placeholder="امروز چه احساسی داشتی؟"
            className="w-full mt-2 px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] outline-none text-sm resize-none transition"
          />
        </Card>

        {/* Habits */}
        {activeHabits.length > 0 && (
          <Card title="عادت‌های امروز" subtitle={`${toPersianDigits(activeHabits.filter(h => getCompletion(h.id, selectedDate).count >= h.targetCount).length)}/${toPersianDigits(activeHabits.length)} انجام شده`}>
            <div className="space-y-2 mt-2">
              {activeHabits.map((h) => {
                const c = getCompletion(h.id, selectedDate);
                const done = c.count >= h.targetCount;
                const pct = Math.min(100, (c.count / h.targetCount) * 100);
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHabitCompletion(h.id, selectedDate)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition ${
                      done
                        ? "bg-[var(--color-success)]/10 border-[var(--color-success)]/30"
                        : "bg-[var(--color-bg-elevated)]/60 border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${h.color}25`, color: h.color }}
                    >
                      {h.icon}
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <div className="text-sm font-semibold truncate">{h.title}</div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, background: h.color }}
                        />
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${done ? "bg-[var(--color-success)] text-white animate-pop" : "border-2 border-[var(--color-border)]"}`}>
                      {done && <CheckIcon className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Tasks */}
        <Card title="وظایف امروز" subtitle={`${toPersianDigits(tasks.filter(t => t.completed).length)}/${toPersianDigits(tasks.length)}`}>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="افزودن وظیفه..."
              className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] outline-none text-sm transition"
            />
            <button
              onClick={handleAddTask}
              className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)] text-white flex items-center justify-center active:scale-95 transition"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className={`animate-fade-up flex items-center gap-2 px-3 py-2.5 rounded-xl border transition ${
                  t.completed
                    ? "bg-[var(--color-bg-elevated)]/30 border-[var(--color-border)]/60"
                    : "bg-[var(--color-bg-elevated)]/60 border-[var(--color-border)]"
                }`}
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                    t.completed
                      ? "bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)] text-white"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  {t.completed && <CheckIcon className="w-4 h-4 animate-pop" />}
                </button>
                <span
                  className={`flex-1 text-sm transition ${
                    t.completed
                      ? "line-through text-[var(--color-text-muted)]"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {t.title}
                </span>
                <button onClick={() => deleteTask(t.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
            {tasks.length === 0 && (
              <li className="text-center text-xs text-[var(--color-text-muted)] py-4">
                هنوز وظیفه‌ای ثبت نشده
              </li>
            )}
          </ul>
        </Card>

        {/* Lesson */}
        <Card title="درس امروز" subtitle="چه چیزی یاد گرفتی؟" icon={<LightbulbIcon className="w-4 h-4 text-[var(--color-accent-gold)]" />}>
          <textarea
            value={localLesson}
            onChange={(e) => setLocalLesson(e.target.value)}
            rows={2}
            placeholder="درس یا نکته‌ای که از امروز یاد گرفتم..."
            className="w-full mt-2 px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] outline-none text-sm resize-none transition"
          />
        </Card>

        {/* Stars */}
        <Card title="امتیاز کلی روز" subtitle="چقدر از امروز راضی هستی؟" icon={<StarIcon className="w-4 h-4 text-[var(--color-accent-gold)]" />}>
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((v) => {
              const active = day.stars >= v;
              return (
                <button
                  key={v}
                  onClick={() => updateDay(selectedDate, { stars: day.stars === v ? 0 : v })}
                  className={`transition-all ${active ? "text-[var(--color-accent-gold)] scale-110" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}
                >
                  <StarIcon filled={active} className="w-8 h-8" />
                </button>
              );
            })}
          </div>
        </Card>

        {/* Notes */}
        <Card title="یادداشت‌های آزاد" subtitle="فضای خودت">
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            rows={4}
            placeholder="هرچی دلت می‌خواد..."
            className="w-full mt-2 px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] outline-none text-sm resize-none transition"
          />
        </Card>
      </div>
    </div>
  );
}

function Hero({ day }: { day: { mood: number; stars: number; positives: string[]; gratitude: [string, string, string] } }) {
  const filled =
    (day.mood > 0 ? 1 : 0) +
    (day.stars > 0 ? 1 : 0) +
    (day.positives.length > 0 ? 1 : 0) +
    (day.gratitude.filter(Boolean).length > 0 ? 1 : 0);
  const total = 4;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 border border-[var(--color-border)]" style={{ background: "linear-gradient(135deg, rgba(124,106,247,0.18), rgba(56,178,172,0.12) 60%, rgba(240,180,41,0.10))" }}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--color-accent-primary)]/20 blur-3xl" />
      <div className="relative">
        <div className="text-xs text-[var(--color-text-secondary)]">پیشرفت ثبت امروز</div>
        <div className="mt-1 flex items-end justify-between">
          <div className="text-3xl font-bold tabular-fa">
            {toPersianDigits(pct)}<span className="text-base text-[var(--color-text-secondary)]">٪</span>
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {filled === total ? "✨ روز کامل ثبت شد" : "ادامه بده، عالی پیش میری"}
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-black/30 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #7C6AF7, #38B2AC, #F0B429)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4 animate-fade-up">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-[15px] font-bold">{title}</h3>
        </div>
        {subtitle && (
          <span className="text-[11px] text-[var(--color-text-muted)] tabular-fa">{subtitle}</span>
        )}
      </header>
      {children}
    </section>
  );
}

function ListInput({
  placeholder,
  onAdd,
  disabled,
  accent,
}: {
  placeholder: string;
  onAdd: (v: string) => void;
  disabled?: boolean;
  accent: "success" | "danger";
}) {
  const [v, setV] = useState("");
  const submit = () => {
    if (!v.trim()) return;
    onAdd(v);
    setV("");
  };
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] outline-none text-sm disabled:opacity-50 transition"
      />
      <button
        onClick={submit}
        disabled={disabled || !v.trim()}
        className={`w-10 h-10 rounded-xl text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition ${
          accent === "success" ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"
        }`}
      >
        <PlusIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
