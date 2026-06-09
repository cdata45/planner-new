import { useState } from "react";
import { useStore } from "../store";
import {
  addDaysToJalali,
  jalaliKey,
  parseKey,
  PERSIAN_WEEKDAYS_SHORT,
  todayKey,
  toPersianDigits,
} from "../utils/jalali";
import { CheckIcon, FlameIcon, PlusIcon, TrashIcon } from "../components/Icons";
import type { HabitTemplate } from "../types";

const ICONS = ["🏃", "📚", "🧘", "💧", "🥗", "💤", "✍️", "🎯", "🎨", "🎵", "🌿", "🚶", "💪", "🌅", "📝", "🛐"];
const COLORS = ["#7C6AF7", "#38B2AC", "#F0B429", "#FC5C65", "#26DE81", "#4FACFE", "#F06292", "#FED330"];

export function HabitsPage() {
  const { data, addHabit, deleteHabit, getCompletion, toggleHabitCompletion, habitStreak } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  const todayK = todayKey();
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    jalaliKey(addDaysToJalali(parseKey(todayK), -6 + i)),
  );

  // Weekly stats
  const totalSlots = data.habits.length * 7;
  const filledSlots = data.habits.reduce((acc, h) => {
    return (
      acc +
      last7Days.filter((d) => {
        const c = getCompletion(h.id, d);
        return c.count >= h.targetCount;
      }).length
    );
  }, 0);

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-30 px-4 pt-6 pb-3 bg-[var(--color-bg-primary)]/85 backdrop-blur-xl border-b border-[var(--color-border)]/60">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">عادت‌ها</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              عادت‌سازی، گام‌به‌گام
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-accent-primary)] text-white text-sm font-semibold active:scale-95 transition"
          >
            <PlusIcon className="w-4 h-4" />
            جدید
          </button>
        </div>
      </header>

      <div className="px-4 mt-4 space-y-4 max-w-xl mx-auto">
        {/* Weekly overview */}
        <div className="card p-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--color-text-secondary)]">هفته جاری</div>
              <div className="text-2xl font-bold tabular-fa mt-1">
                {toPersianDigits(filledSlots)}
                <span className="text-sm text-[var(--color-text-muted)]"> / {toPersianDigits(totalSlots)}</span>
              </div>
            </div>
            <div className="text-end">
              <div className="text-xs text-[var(--color-text-secondary)]">پیشرفت</div>
              <div className="text-lg font-bold text-[var(--color-accent-primary)] tabular-fa">
                {toPersianDigits(totalSlots ? Math.round((filledSlots / totalSlots) * 100) : 0)}٪
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[var(--color-accent-primary)] to-[var(--color-accent-teal)] transition-all duration-500"
              style={{ width: `${totalSlots ? (filledSlots / totalSlots) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Habits list */}
        {data.habits.length === 0 && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-2">🌱</div>
            <div className="font-semibold">هنوز عادتی نداری</div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              با یک عادت کوچک شروع کن
            </p>
          </div>
        )}

        {data.habits.map((h) => {
          const { current, best } = habitStreak(h.id);
          return (
            <div key={h.id} className="card p-4 animate-fade-up">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${h.color}25`, color: h.color }}
                >
                  {h.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{h.title}</h3>
                    {current > 0 && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[var(--color-accent-gold)]/15 text-[var(--color-accent-gold)] text-[10px] font-bold tabular-fa">
                        <FlameIcon className="w-3 h-3" />
                        {toPersianDigits(current)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5 tabular-fa">
                    بهترین: {toPersianDigits(best)} روز • هدف: {toPersianDigits(h.targetCount)} {h.unit}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm("این عادت حذف شود؟")) deleteHabit(h.id);
                  }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* 7-day strip */}
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {last7Days.map((d, i) => {
                  const c = getCompletion(h.id, d);
                  const done = c.count >= h.targetCount;
                  const isToday = d === todayK;
                  return (
                    <button
                      key={d}
                      onClick={() => toggleHabitCompletion(h.id, d)}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border transition ${
                        done
                          ? "border-transparent text-white"
                          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)]/40"
                      }`}
                      style={done ? { background: h.color } : undefined}
                    >
                      <span className="text-[9px]">{PERSIAN_WEEKDAYS_SHORT[(new Date().getDay() + 1 - (6 - i)) % 7] || ""}</span>
                      {done ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px] tabular-fa">{toPersianDigits(parseKey(d).jd)}</span>
                      )}
                      {isToday && !done && (
                        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--color-accent-primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <AddHabitModal
          onClose={() => setShowAdd(false)}
          onSave={(h) => {
            addHabit(h);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function AddHabitModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (h: Omit<HabitTemplate, "id" | "createdAt" | "order">) => void;
}) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState("بار");

  const submit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      icon,
      color,
      category: "general",
      targetCount: target,
      unit,
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-[var(--color-bg-secondary)] rounded-t-3xl p-5 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
      >
        <div className="w-12 h-1 mx-auto rounded-full bg-[var(--color-border)] mb-4" />
        <h2 className="text-lg font-bold mb-4">عادت جدید</h2>

        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">عنوان</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثلاً: ورزش روزانه"
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] outline-none text-sm transition"
        />

        <label className="block text-xs text-[var(--color-text-secondary)] mb-2 mt-4">آیکن</label>
        <div className="grid grid-cols-8 gap-2">
          {ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`aspect-square rounded-xl text-xl flex items-center justify-center border transition ${
                icon === ic
                  ? "bg-[var(--color-accent-primary)]/15 border-[var(--color-accent-primary)] scale-110"
                  : "bg-[var(--color-bg-card)] border-[var(--color-border)]"
              }`}
            >
              {ic}
            </button>
          ))}
        </div>

        <label className="block text-xs text-[var(--color-text-secondary)] mb-2 mt-4">رنگ</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full border-2 transition ${color === c ? "scale-110" : "border-transparent"}`}
              style={{ background: c, borderColor: color === c ? "white" : "transparent" }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs text-[var(--color-text-secondary)] mb-1">هدف روزانه</label>
            <input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Math.max(1, +e.target.value || 1))}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] outline-none text-sm tabular-fa transition"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-secondary)] mb-1">واحد</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] outline-none text-sm transition"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-sm font-semibold"
          >
            انصراف
          </button>
          <button
            onClick={submit}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-xl bg-[var(--color-accent-primary)] text-white text-sm font-semibold disabled:opacity-50"
          >
            ساخت عادت
          </button>
        </div>
      </div>
    </div>
  );
}
